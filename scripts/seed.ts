/**
 * Pushes the menu in src/lib/menuContent.ts into Sanity.
 *
 *   npm run seed              seed content and upload the placeholder photos
 *   npm run seed -- --no-photos   seed text only
 *
 * Safe to re-run: every document uses a fixed _id, so a second run updates the
 * same documents rather than creating duplicates. It will overwrite Studio
 * edits to those documents, so only run it to (re)initialise the dataset.
 *
 * Requires SANITY_WRITE_TOKEN in .env.local — create one at sanity.io/manage
 * under API → Tokens with Editor permissions.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@sanity/client";

import { menuCategories, menuSettings } from "../src/lib/menuContent";
import { orderRanks } from "../src/sanity/orderRank";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!token) {
  throw new Error(
    "Missing SANITY_WRITE_TOKEN — create an Editor token at sanity.io/manage (API → Tokens)",
  );
}

const withPhotos = !process.argv.includes("--no-photos");

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

/** Sub-section ids are derived from the group name; see scripts/subcategories.ts. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const CONTENT_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/**
 * Uploads an image and returns a Sanity image reference.
 *
 * Two kinds of source: remote placeholder photos, and the cut-outs served from
 * /public, which arrive as root-relative paths like "/fruit/mango.svg". fetch()
 * cannot parse those — there is no origin to resolve them against in Node — so
 * they are read off disk instead.
 */
async function uploadPhoto(source: string, filename: string) {
  const isLocal = source.startsWith("/");
  // Extension drives the stored filename and content type; hard-coding .jpg
  // would mislabel every cut-out.
  const extension = (path.extname(isLocal ? source : ".jpg") || ".jpg")
    .toLowerCase()
    .split("?")[0];

  let buffer: Buffer;

  if (isLocal) {
    const onDisk = path.join(process.cwd(), "public", source);
    try {
      buffer = await readFile(onDisk);
    } catch {
      throw new Error(`Not found in public/: ${source}`);
    }
  } else {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Download failed (${response.status}) for ${filename}`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
  }

  const asset = await client.assets.upload("image", buffer, {
    filename: `${filename}${extension}`,
    contentType: CONTENT_TYPES[extension] ?? "image/jpeg",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function seed() {
  console.log(
    `Seeding ${dataset} — ${menuCategories.length} sections, photos ${
      withPhotos ? "on" : "off"
    }`,
  );

  const tx = client.transaction();

  // Sort keys for the Studio's drag-and-drop, in menu order. Dish ranks are one
  // sequence across the whole menu — the plugin ranks a document type as a
  // whole — so a section's items stay contiguous within it.
  const sectionRanks = orderRanks(menuCategories.length);
  const dishRanks = orderRanks(
    menuCategories.reduce((n, c) => n + c.dishes.length, 0),
  );
  let dishRankIndex = 0;

  // The fruits on the display table, named once for the whole menu.
  const fruitSource = menuCategories.find((c) => c.fruitsEn);
  if (fruitSource) {
    tx.createOrReplace({
      _id: "fruit-selection",
      _type: "fruitSelection",
      fruitsEn: fruitSource.fruitsEn,
      fruitsFr: fruitSource.fruitsFr,
    });
  }

  tx.createOrReplace({
    _id: "settings",
    _type: "settings",
    name: menuSettings.name,
    taglineEn: menuSettings.taglineEn,
    taglineFr: menuSettings.taglineFr,
    currency: menuSettings.currency,
    noticeEn: menuSettings.noticeEn,
    noticeFr: menuSettings.noticeFr,
  });

  let itemCount = 0;
  let subcategoryCount = 0;

  for (const [sectionIndex, category] of menuCategories.entries()) {
    tx.createOrReplace({
      _id: category._id,
      _type: "category",
      titleEn: category.titleEn,
      titleFr: category.titleFr,
      introEn: category.introEn,
      introFr: category.introFr,
      footnoteEn: category.footnoteEn,
      footnoteFr: category.footnoteFr,
      layout: category.layout,
      wideTiles: Boolean(category.wideTiles),
      showFruits: Boolean(category.fruitsEn),
      orderRank: sectionRanks[sectionIndex],
      order: sectionIndex + 1,
      hidden: false,
    });

    // One sub-section document per distinct group name in this section, in the
    // order the groups first appear. Ids match the migration script's scheme,
    // so seeding and migrating converge on the same documents.
    const subcategoryIds = new Map<string, string>();

    for (const dish of category.dishes) {
      if (!dish.groupEn || subcategoryIds.has(dish.groupEn)) continue;

      const id = `${category._id}-sub-${slug(dish.groupEn)}`;
      subcategoryIds.set(dish.groupEn, id);
      subcategoryCount += 1;

      tx.createOrReplace({
        _id: id,
        _type: "subcategory",
        titleEn: dish.groupEn,
        titleFr: dish.groupFr || dish.groupEn,
        category: { _type: "reference", _ref: category._id },
        order: subcategoryIds.size,
      });
    }

    for (const [dishIndex, dish] of category.dishes.entries()) {
      let image;

      if (withPhotos && dish.imageUrlLarge) {
        try {
          image = await uploadPhoto(dish.imageUrlLarge, dish._id);
          process.stdout.write(".");
        } catch (error) {
          console.warn(`\n  photo failed for ${dish._id}:`, error);
        }
      }

      tx.createOrReplace({
        _id: dish._id,
        _type: "dish",
        nameEn: dish.nameEn,
        nameFr: dish.nameFr,
        descriptionEn: dish.descriptionEn,
        descriptionFr: dish.descriptionFr,
        price: dish.price ?? undefined,
        priceNoteEn: dish.priceNoteEn,
        priceNoteFr: dish.priceNoteFr,
        groupEn: dish.groupEn,
        groupFr: dish.groupFr,
        category: { _type: "reference", _ref: category._id },
        ...(dish.groupEn && subcategoryIds.has(dish.groupEn)
          ? {
              subcategory: {
                _type: "reference",
                _ref: subcategoryIds.get(dish.groupEn)!,
              },
            }
          : {}),
        orderRank: dishRanks[dishRankIndex++],
        order: dishIndex + 1,
        available: true,
        ...(image ? { image } : {}),
      });

      itemCount += 1;
    }
  }

  await tx.commit();
  console.log(
    `\nDone — ${menuCategories.length} sections, ${subcategoryCount} sub-sections, ${itemCount} items, settings.`,
  );
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
