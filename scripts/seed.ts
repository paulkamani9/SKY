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
import { createClient } from "@sanity/client";

import { menuCategories, menuSettings } from "../src/lib/menuContent";

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

/** Uploads a placeholder photo and returns a Sanity image reference. */
async function uploadPhoto(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${filename}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, {
    filename: `${filename}.jpg`,
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
      order: sectionIndex + 1,
      hidden: false,
    });

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
        order: dishIndex + 1,
        available: true,
        ...(image ? { image } : {}),
      });

      itemCount += 1;
    }
  }

  await tx.commit();
  console.log(
    `\nDone — ${menuCategories.length} sections, ${itemCount} items, settings.`,
  );
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
