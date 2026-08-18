/**
 * Gives every section and item the sort key the Studio's drag-and-drop uses.
 *
 *   npm run migrate:order -- --dry-run   report what would change
 *   npm run migrate:order                apply it
 *
 * Ranks are written in the order the menu renders *today*, so nothing moves:
 * this is a change of how position is stored, not what it is. Verify with
 * `npm run menu:order` before and after — the diff must be empty.
 *
 * Deliberately not the plugin's own "Reset Order" menu item: for documents
 * that have no rank yet that ranks by whatever the list happens to show, which
 * is not the menu's order.
 *
 * Requires SANITY_WRITE_TOKEN in .env.local.
 */
import { createClient } from "@sanity/client";

import { orderRanks } from "../src/sanity/orderRank";

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

/** The ordering the menu used before ranks existed. */
const orderedQuery = `{
  "categories": *[_type == "category"] | order(order asc) { _id, titleEn },
  "dishes": *[_type == "dish"] {
    _id, nameEn, order,
    "categoryId": category._ref,
    "categoryOrder": category->order,
    "groupOrder": coalesce(subcategory->order, 0)
  }
}`;

type Section = { _id: string; titleEn: string };
type Item = {
  _id: string;
  nameEn: string;
  order?: number;
  categoryId?: string;
  categoryOrder?: number;
  groupOrder: number;
};

async function main() {
  console.log(
    `${dryRun ? "Dry run" : "Applying"} — project ${projectId}, dataset ${dataset}\n`,
  );

  const { categories, dishes } = await client.fetch<{
    categories: Section[];
    dishes: Item[];
  }>(orderedQuery);

  // Section by section, then the section's own item order: the same sequence
  // the menu query produced from the numeric fields.
  const ordered = [...dishes].sort(
    (a, b) =>
      (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0) ||
      a.groupOrder - b.groupOrder ||
      (a.order ?? 0) - (b.order ?? 0),
  );

  const sectionRanks = orderRanks(categories.length);
  const dishRanks = orderRanks(ordered.length);

  const patches = [
    ...categories.map((c, i) => ({
      id: c._id,
      label: `section ${c.titleEn}`,
      rank: sectionRanks[i],
    })),
    ...ordered.map((d, i) => ({
      id: d._id,
      label: `item ${d.nameEn}`,
      rank: dishRanks[i],
    })),
  ];

  for (const patch of patches) {
    console.log(`  ${patch.label} (${patch.id}) → ${patch.rank}`);
  }
  console.log(
    `\n${categories.length} sections, ${ordered.length} items${
      dryRun ? " would be ranked." : " to rank."
    }`,
  );

  if (dryRun) return;

  let tx = client.transaction();
  for (const patch of patches) {
    tx = tx.patch(patch.id, { set: { orderRank: patch.rank } });
  }
  await tx.commit();

  console.log("Done. Run `npm run menu:order` and diff it against before.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
