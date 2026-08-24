/**
 * Adds the items the owner sent through on WhatsApp to a dataset that is
 * already live, without re-seeding it.
 *
 *   npm run menu:new-items -- --dry-run   report what would change
 *   npm run menu:new-items                apply it
 *
 * `npm run seed` would do this too, but it rewrites every document in the
 * dataset from the master file — including the photos, prices and wording the
 * Studio has edited since. This touches the eight documents in NEW_ITEMS and
 * nothing else, so it is safe to run against production.
 *
 * The content comes from src/lib — menuContent.ts and menuTranslations.ts are
 * the master copy, exactly as they are for the seeder. Safe to re-run: an item
 * that is already there is updated in place rather than added twice, and it
 * keeps the position it has been dragged to.
 *
 * Requires SANITY_WRITE_TOKEN in .env.local.
 */
import { createClient, type Transaction } from "@sanity/client";

import { menuCategories } from "../src/lib/menuContent";
import {
  dishTranslations,
  groupTranslations,
} from "../src/lib/menuTranslations";
import { ranksBetween } from "../src/sanity/orderRank";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!token) throw new Error("Missing SANITY_WRITE_TOKEN");

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

/**
 * The items this run is for, by their id in menuContent.ts. Everything else
 * about them — name, price, wording, section, whether they are being served —
 * is read from the master file, so this list is the only thing to edit when
 * the next batch comes in.
 */
const NEW_ITEMS = [
  // Announced 23 August, not being served yet: they go in switched off.
  "gel-melon",
  "gel-avocado",
  "gel-letchi",
  "gel-watermelon",
  "gel-bergamot",
  "gel-affogato",
  "bf-croque",
  "bite-fish",
];

/** Sub-section ids are derived from the group name; see scripts/seed.ts. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** For matching an item against one already typed into the Studio by hand. */
function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Every language's price note, for clearing it when a price is set. */
const PRICE_NOTE_FIELDS = [
  "priceNoteEn",
  "priceNoteFr",
  "priceNoteIt",
  "priceNoteDe",
  "priceNoteRu",
];

/** Drops undefined values, so an untranslated field is never written as null. */
function defined(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined),
  );
}

type SanityDish = {
  _id: string;
  nameEn?: string;
  orderRank?: string;
  categoryId?: string;
};

type SanitySub = { _id: string; titleEn: string; categoryId?: string };

type Doc = { _id: string; _type: string; [field: string]: unknown };

async function main() {
  console.log(
    `${dryRun ? "Dry run" : "Applying"} — project ${projectId}, dataset ${dataset}\n`,
  );

  const { dishes, subcategories, categoryIds } = await client.fetch<{
    dishes: SanityDish[];
    subcategories: SanitySub[];
    categoryIds: string[];
  }>(`{
    "dishes": *[_type == "dish"]{
      _id, nameEn, orderRank, "categoryId": category._ref
    },
    "subcategories": *[_type == "subcategory"]{
      _id, titleEn, "categoryId": category._ref
    },
    "categoryIds": *[_type == "category"]._id
  }`);

  if (dishes.length === 0) {
    throw new Error(
      "No items in this dataset — it has never been seeded. Run `npm run seed` instead.",
    );
  }

  // The whole menu in master order, so an item's neighbours can be found even
  // when they sit in the section before or after it. Item sort keys are one
  // sequence across the menu, not one per section.
  const master = menuCategories.flatMap((category) =>
    category.dishes.map((dish, index) => ({
      dish,
      category,
      order: index + 1,
    })),
  );

  const ranks = new Map(
    dishes.filter((d) => d.orderRank).map((d) => [d._id, d.orderRank!]),
  );

  // An item already typed into the Studio by hand has a generated id, so it is
  // matched on its name within its section — otherwise this would add a second
  // copy of it under our id.
  const byName = new Map(
    dishes
      .filter((d) => d.nameEn && d.categoryId)
      .map((d) => [`${d.categoryId}|${normalise(d.nameEn!)}`, d._id]),
  );

  const created: string[] = [];
  const updated: string[] = [];
  const newSubcategories = new Map<string, Doc>();
  // Collected rather than applied as we go: a sub-section has to exist before
  // an item can reference it, so those mutations lead the transaction.
  const itemMutations: ((tx: Transaction) => Transaction)[] = [];

  for (const id of NEW_ITEMS) {
    const index = master.findIndex(({ dish }) => dish._id === id);
    if (index === -1) {
      throw new Error(`${id} is not in src/lib/menuContent.ts`);
    }

    const { dish, category, order } = master[index];

    if (!categoryIds.includes(category._id)) {
      console.warn(`  ! no section ${category._id} in Sanity — ${id} skipped`);
      continue;
    }

    // Ours if we have put it there before, otherwise whatever the Studio
    // already calls this dish, otherwise brand new.
    const existingId = ranks.has(id)
      ? id
      : byName.get(`${category._id}|${normalise(dish.nameEn)}`);

    let subcategory: { _type: "reference"; _ref: string } | undefined;

    if (dish.groupEn) {
      const match = subcategories.find(
        (s) =>
          s.categoryId === category._id &&
          normalise(s.titleEn) === normalise(dish.groupEn!),
      );
      const subId = match?._id ?? `${category._id}-sub-${slug(dish.groupEn)}`;

      if (!match && !newSubcategories.has(subId)) {
        newSubcategories.set(subId, {
          _id: subId,
          _type: "subcategory",
          titleEn: dish.groupEn,
          titleFr: dish.groupFr || dish.groupEn,
          ...defined({ ...groupTranslations[dish.groupEn] }),
          category: { _type: "reference", _ref: category._id },
          order: subcategories.length + newSubcategories.size + 1,
        });
        console.log(`  + sub-section ${dish.groupEn} (${subId})`);
      }

      subcategory = { _type: "reference", _ref: subId };
    }

    const fields = defined({
      nameEn: dish.nameEn,
      nameFr: dish.nameFr,
      descriptionEn: dish.descriptionEn,
      descriptionFr: dish.descriptionFr,
      priceNoteEn: dish.priceNoteEn,
      priceNoteFr: dish.priceNoteFr,
      ...dishTranslations[id],
      category: { _type: "reference", _ref: category._id },
      subcategory,
      available: dish.available,
      ...(dish.price === null ? {} : { price: dish.price }),
    });

    if (existingId) {
      // Already on the menu: update the wording and the price, and leave the
      // position alone — it may have been dragged since.
      updated.push(existingId);
      console.log(
        `  ~ ${dish.nameEn} (${existingId}) → ${Object.keys(fields).join(", ")}`,
      );
      itemMutations.push((t) =>
        t.patch(existingId, {
          set: fields,
          // A price note and a price are alternatives: whichever this item
          // does not have has to come off, or the old one shows next to the
          // new.
          unset: dish.price === null ? ["price"] : PRICE_NOTE_FIELDS,
        }),
      );
      continue;
    }

    // Slot it between the neighbours it has in the master file, skipping any
    // that are not in Sanity — the last new item added becomes the neighbour
    // of the next, so a run of them keeps its order.
    const before = [...master.slice(0, index)]
      .reverse()
      .map(({ dish: d }) => ranks.get(d._id))
      .find(Boolean);
    const after = master
      .slice(index + 1)
      .map(({ dish: d }) => ranks.get(d._id))
      .find(Boolean);
    const [orderRank] = ranksBetween(before, after, 1);
    ranks.set(id, orderRank);

    created.push(id);
    console.log(
      `  + ${dish.nameEn} (${id}) in ${category.titleEn}${
        dish.available ? "" : " — not available yet"
      }`,
    );
    itemMutations.push((t) =>
      t
        .createIfNotExists({ _id: id, _type: "dish", ...fields })
        // createIfNotExists does nothing if the id is already there — an
        // earlier run that was interrupted, say — so the patch behind it is
        // what makes the content right either way.
        .patch(id, { set: { ...fields, orderRank, order } }),
    );
  }

  console.log(
    `\n${created.length} items added, ${updated.length} updated, ${newSubcategories.size} sub-sections added${
      dryRun ? " — nothing written." : "."
    }`,
  );

  if (dryRun) return;

  // One transaction: the batch lands whole, or the menu is untouched.
  let tx = client.transaction();
  for (const doc of newSubcategories.values()) tx = tx.createIfNotExists(doc);
  for (const mutate of itemMutations) tx = mutate(tx);
  await tx.commit();
  console.log("Done. The site picks the change up within a minute.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
