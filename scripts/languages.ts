/**
 * Pushes the menu's prose into Sanity: the descriptions, intros and footnotes
 * from the master menu, in all five languages, plus the fruit lists and the
 * wide-tile setting.
 *
 *   npm run migrate:languages -- --dry-run   report what would change
 *   npm run migrate:languages                apply it
 *
 * Unlike `npm run seed`, it never touches a price, a photo, a name, an order, a
 * reference or an availability switch — only the wording, which src/lib
 * (menuContent.ts + menuTranslations.ts) is the master copy of. It will
 * overwrite wording edited in the Studio, so make those edits in the master
 * file too, or re-apply them after running this. Safe to re-run.
 *
 * Requires SANITY_WRITE_TOKEN in .env.local.
 */
import { createClient } from "@sanity/client";

import { menuCategories, menuSettings } from "../src/lib/menuContent";
import {
  categoryTranslations,
  dishTranslations,
  groupTranslations,
  settingsTranslations,
} from "../src/lib/menuTranslations";

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

type Patch = { id: string; label: string; fields: Record<string, unknown> };

/** Drops undefined values, so an untranslated field is never written as null. */
function defined(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined),
  );
}

async function collect(): Promise<Patch[]> {
  const patches: Patch[] = [];

  const settingsId = await client.fetch<string | null>(
    `*[_type == "settings"][0]._id`,
  );
  if (settingsId) {
    patches.push({
      id: settingsId,
      label: "settings",
      fields: defined({
        ...settingsTranslations,
        noticeEn: menuSettings.noticeEn,
        noticeFr: menuSettings.noticeFr,
      }),
    });
  }

  const categoryIds = new Set(
    await client.fetch<string[]>(`*[_type == "category"]._id`),
  );
  for (const category of menuCategories) {
    if (!categoryIds.has(category._id)) {
      console.warn(`  ! no section ${category._id} in Sanity — skipped`);
      continue;
    }
    patches.push({
      id: category._id,
      label: `section ${category.titleEn}`,
      fields: defined({
        ...categoryTranslations[category._id],
        introEn: category.introEn,
        introFr: category.introFr,
        footnoteEn: category.footnoteEn,
        footnoteFr: category.footnoteFr,
        fruitsEn: category.fruitsEn,
        fruitsFr: category.fruitsFr,
        // Written for every section, not just the ones turning it on, so the
        // field always reflects the master file rather than a half-set state.
        wideTiles: Boolean(category.wideTiles),
      }),
    });
  }

  // Sub-sections were created by the earlier migration with generated ids, so
  // they are matched on the English title they were named after.
  const subcategories = await client.fetch<{ _id: string; titleEn: string }[]>(
    `*[_type == "subcategory"]{_id, titleEn}`,
  );
  for (const sub of subcategories) {
    const translation = groupTranslations[sub.titleEn];
    if (!translation) {
      console.warn(`  ! no translation for sub-section "${sub.titleEn}"`);
      continue;
    }
    patches.push({
      id: sub._id,
      label: `sub-section ${sub.titleEn}`,
      fields: defined({ ...translation }),
    });
  }

  const dishIds = new Set(await client.fetch<string[]>(`*[_type == "dish"]._id`));
  for (const category of menuCategories) {
    for (const dish of category.dishes) {
      if (!dishIds.has(dish._id)) {
        console.warn(`  ! no item ${dish._id} in Sanity — skipped`);
        continue;
      }
      const fields = defined({
        ...dishTranslations[dish._id],
        descriptionEn: dish.descriptionEn,
        descriptionFr: dish.descriptionFr,
      });
      if (Object.keys(fields).length === 0) continue;
      patches.push({ id: dish._id, label: `item ${dish.nameEn}`, fields });
    }
  }

  return patches;
}

async function main() {
  console.log(
    `${dryRun ? "Dry run" : "Applying"} — project ${projectId}, dataset ${dataset}\n`,
  );

  const patches = await collect();

  for (const patch of patches) {
    const keys = Object.keys(patch.fields);
    console.log(`  ${patch.label} (${patch.id}) → ${keys.join(", ")}`);
  }

  const fieldCount = patches.reduce(
    (n, p) => n + Object.keys(p.fields).length,
    0,
  );
  console.log(
    `\n${patches.length} documents, ${fieldCount} fields${
      dryRun ? " would be written." : " to write."
    }`,
  );

  if (dryRun) return;

  // One transaction: the menu is either fully translated or untouched, never
  // half-Italian because the connection dropped in the middle.
  let tx = client.transaction();
  for (const patch of patches) tx = tx.patch(patch.id, { set: patch.fields });
  await tx.commit();

  console.log("Done. The site picks the change up within a minute.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
