/**
 * Puts the items the owner sent through on WhatsApp into a dataset that is
 * already live, without re-seeding it.
 *
 *   npm run menu:new-items -- --list      print what is in Sanity today
 *   npm run menu:new-items -- --dry-run   report what would change
 *   npm run menu:new-items                apply it
 *
 * `npm run seed` would do this too, but it rewrites every document in the
 * dataset from the master file — including the photos, prices and wording the
 * Studio has edited since. This touches the documents in NEW_ITEMS and nothing
 * else, so it is safe to run against production.
 *
 * The content comes from src/lib — menuContent.ts and menuTranslations.ts are
 * the master copy, exactly as they are for the seeder.
 *
 * SOME OF THESE ITEMS ARE ALREADY IN SANITY, added by hand in the Studio and
 * never written back to the master file, so they carry a generated id rather
 * than the id used here. Matching one of those is the whole difficulty: get it
 * wrong and the menu shows the dish twice. So an item is matched on its id, on
 * its name, and on its name within the section, in that order, a match in a
 * different section is reported rather than moved, and anything ambiguous is
 * skipped for a human to settle with `existing` below. Run `--dry-run` first
 * and read what it says it is going to do — it prints every match it made and
 * every field it would change.
 *
 * Re-running is safe: an item already there is updated in place, keeps the
 * position it has been dragged to, and fields that already agree are not
 * written at all.
 *
 * --list and --dry-run only read. Applying needs SANITY_WRITE_TOKEN in
 * .env.local.
 */
import { createClient, type Transaction } from "@sanity/client";

import { menuCategories } from "../src/lib/menuContent";
import {
  dishTranslations,
  groupTranslations,
} from "../src/lib/menuTranslations";
import {
  matchDish,
  normalise,
  relatedDishes,
} from "../src/sanity/matchDish";
import { ranksBetween } from "../src/sanity/orderRank";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");

const listOnly = process.argv.includes("--list");
const dryRun = process.argv.includes("--dry-run");

if (!listOnly && !dryRun && !token) {
  throw new Error(
    "Missing SANITY_WRITE_TOKEN — needed to apply. `-- --dry-run` and `-- --list` only read.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

type NewItem = {
  /** The item's id in menuContent.ts, which is where its content comes from. */
  id: string;
  /**
   * The id of the document in Sanity this item already is, when the matching
   * below cannot work it out on its own — `--list` prints the ids to copy from.
   * Set it and no matching is attempted: that document is the one updated.
   */
  existing?: string;
};

/**
 * The items this run is for. Everything about them — name, price, wording,
 * section, whether they are being served — is read from the master file, so
 * this list is the only thing to edit when the next batch comes in.
 */
const NEW_ITEMS: NewItem[] = [
  // Announced 23 August, not being served yet: they go in switched off.
  { id: "gel-melon" },
  { id: "gel-avocado" },
  { id: "gel-letchi" },
  { id: "gel-watermelon" },
  { id: "gel-bergamot" },
  { id: "gel-affogato" },
  // These two are already on the menu — added in the Studio, never written
  // back to the master file. What this run does to them is update the price
  // and the wording the owner sent. If --dry-run reports them as new, or as
  // ambiguous, put the id --list prints into `existing` rather than letting
  // the run add a second copy.
  { id: "bf-croque" },
  { id: "bite-fish" },
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

/** Field values as they are compared: a reference is its target. */
function same(a: unknown, b: unknown): boolean {
  const value = (v: unknown) =>
    v && typeof v === "object" && "_ref" in (v as Record<string, unknown>)
      ? (v as { _ref: string })._ref
      : v;
  return value(a) === value(b);
}

function show(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "string") {
    return value.length > 48 ? `"${value.slice(0, 45)}…"` : `"${value}"`;
  }
  if (value && typeof value === "object" && "_ref" in (value as object)) {
    return String((value as { _ref: string })._ref);
  }
  return String(value);
}

type SanityDish = {
  _id: string;
  _type: string;
  nameEn?: string;
  orderRank?: string;
  price?: number;
  available?: boolean;
  categoryId?: string;
  subcategoryId?: string;
  [field: string]: unknown;
};

type SanitySub = { _id: string; titleEn: string; categoryId?: string };
type SanityCategory = { _id: string; titleEn: string };
type Doc = { _id: string; _type: string; [field: string]: unknown };

const dataQuery = `{
  "dishes": *[_type == "dish"]{
    ...,
    "categoryId": category._ref,
    "subcategoryId": subcategory._ref
  },
  "subcategories": *[_type == "subcategory"]{
    _id, titleEn, "categoryId": category._ref
  },
  "categories": *[_type == "category"] | order(coalesce(orderRank, "9") asc, order asc){
    _id, titleEn
  }
}`;

async function main() {
  const { dishes, subcategories, categories } = await client.fetch<{
    dishes: SanityDish[];
    subcategories: SanitySub[];
    categories: SanityCategory[];
  }>(dataQuery);

  const sectionName = new Map(categories.map((c) => [c._id, c.titleEn]));

  if (listOnly) {
    console.log(`${dataset} — ${dishes.length} items\n`);
    for (const category of categories) {
      console.log(`## ${category.titleEn}`);
      for (const dish of dishes.filter((d) => d.categoryId === category._id)) {
        const price = dish.price ? `Rs ${dish.price}` : (dish.priceNoteEn ?? "—");
        console.log(
          `   ${dish._id.padEnd(38)} ${(dish.nameEn ?? "").padEnd(34)} ${price}${
            dish.available === false ? "  (off the menu)" : ""
          }`,
        );
      }
    }
    const orphans = dishes.filter(
      (d) => !d.categoryId || !sectionName.has(d.categoryId),
    );
    if (orphans.length) {
      console.log(`\n## Not in any section`);
      for (const dish of orphans) {
        console.log(`   ${dish._id.padEnd(38)} ${dish.nameEn ?? ""}`);
      }
    }
    return;
  }

  console.log(
    `${dryRun ? "Dry run" : "Applying"} — project ${projectId}, dataset ${dataset}\n`,
  );

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
  const byId = new Map(dishes.map((d) => [d._id, d]));

  let added = 0;
  let changed = 0;
  let unchanged = 0;
  let skipped = 0;
  const newSubcategories = new Map<string, Doc>();
  // Collected rather than applied as we go: a sub-section has to exist before
  // an item can reference it, so those mutations lead the transaction.
  const itemMutations: ((tx: Transaction) => Transaction)[] = [];

  for (const { id, existing } of NEW_ITEMS) {
    const index = master.findIndex(({ dish }) => dish._id === id);
    if (index === -1) throw new Error(`${id} is not in src/lib/menuContent.ts`);

    const { dish, category, order } = master[index];

    if (!sectionName.has(category._id)) {
      console.warn(`  ! no section ${category._id} in Sanity — ${id} skipped`);
      skipped += 1;
      continue;
    }

    let match: SanityDish | undefined;

    if (existing) {
      match = byId.get(existing);
      if (!match) {
        console.warn(
          `  ! ${dish.nameEn}: no document ${existing} in this dataset — skipped`,
        );
        skipped += 1;
        continue;
      }
    } else {
      const found = matchDish(id, dish.nameEn, category._id, dishes);
      if (found.candidates) {
        console.warn(
          `  ! ${dish.nameEn} could be any of these — set \`existing\` on it in NEW_ITEMS and re-run:`,
        );
        for (const c of found.candidates) {
          console.warn(
            `      ${c._id}  "${c.nameEn}"  in ${sectionName.get(c.categoryId ?? "") ?? "no section"}`,
          );
        }
        skipped += 1;
        continue;
      }
      match = found.id ? byId.get(found.id) : undefined;
    }

    // An item found somewhere other than where the master file files it has
    // been put there deliberately in the Studio. Its wording and price are
    // updated; where it sits is left alone.
    const elsewhere = Boolean(
      match && match.categoryId && match.categoryId !== category._id,
    );

    let subcategory: { _type: "reference"; _ref: string } | undefined;

    if (dish.groupEn && !elsewhere) {
      const sub = subcategories.find(
        (s) =>
          s.categoryId === category._id &&
          normalise(s.titleEn) === normalise(dish.groupEn!),
      );
      const subId = sub?._id ?? `${category._id}-sub-${slug(dish.groupEn)}`;

      if (!sub && !newSubcategories.has(subId)) {
        newSubcategories.set(subId, {
          _id: subId,
          _type: "subcategory",
          titleEn: dish.groupEn,
          titleFr: dish.groupFr || dish.groupEn,
          ...defined({ ...groupTranslations[dish.groupEn] }),
          category: { _type: "reference", _ref: category._id },
          order: subcategories.length + newSubcategories.size + 1,
        });
        console.log(`  + sub-section "${dish.groupEn}" (${subId})`);
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
      // Left out for an item filed elsewhere in the Studio — see above.
      ...(elsewhere
        ? {}
        : { category: { _type: "reference", _ref: category._id }, subcategory }),
      available: dish.available,
      ...(dish.price === null ? {} : { price: dish.price }),
    });

    if (match) {
      // Only what actually differs, so the dry run reads as the change itself
      // and a no-op run writes nothing at all.
      const diff = Object.fromEntries(
        Object.entries(fields).filter(([key, value]) => !same(match[key], value)),
      );
      const unset = (
        dish.price === null ? ["price"] : PRICE_NOTE_FIELDS
      ).filter((field) => match[field] !== undefined);

      if (Object.keys(diff).length === 0 && unset.length === 0) {
        console.log(`  = ${dish.nameEn} (${match._id}) already up to date`);
        unchanged += 1;
        continue;
      }

      console.log(
        `  ~ ${dish.nameEn} (${match._id})${
          match._id === id ? "" : ` — already in the Studio as "${match.nameEn}"`
        }${
          elsewhere
            ? `, filed under ${sectionName.get(match.categoryId!)} — left there`
            : ""
        }`,
      );
      for (const [key, value] of Object.entries(diff)) {
        console.log(`      ${key}: ${show(match[key])} → ${show(value)}`);
      }
      for (const field of unset) {
        console.log(`      ${field}: ${show(match[field])} → cleared`);
      }

      changed += 1;
      itemMutations.push((t) =>
        t.patch(match._id, {
          ...(Object.keys(diff).length ? { set: diff } : {}),
          // A price note and a price are alternatives: whichever this item
          // does not have has to come off, or the old one shows next to the
          // new.
          ...(unset.length ? { unset } : {}),
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

    added += 1;
    console.log(
      `  + ${dish.nameEn} (${id}) in ${category.titleEn}${
        dish.available === false ? " — not available yet" : ""
      }`,
    );
    // Nothing matched, but a one-word name is not allowed to match on its
    // word alone — so say what it might have been rather than quietly putting
    // a second copy of the same dish on the menu.
    for (const near of relatedDishes(dish.nameEn, dishes)) {
      console.log(
        `      ? the dataset already has "${near.nameEn}" (${near._id}) in ${
          sectionName.get(near.categoryId ?? "") ?? "no section"
        } — if that is this dish, set \`existing\` on it and re-run`,
      );
    }
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
    `\n${added} added, ${changed} updated, ${unchanged} already right, ${skipped} skipped, ${newSubcategories.size} sub-sections added${
      dryRun ? " — nothing written." : "."
    }`,
  );

  if (skipped) {
    console.log(
      "Settle the skipped ones with `existing` in NEW_ITEMS before applying.",
    );
  }

  if (dryRun || (!itemMutations.length && !newSubcategories.size)) return;

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
