/**
 * One-off migration: free-text sub-groups → sub-section documents.
 *
 *   npm run migrate:subcategories -- --dry-run   report what would change
 *   npm run migrate:subcategories                apply it
 *
 * For every distinct groupEn within a section it creates one `subcategory`
 * document, then points each dish at the matching one. Ids are derived from the
 * section id and a slug of the group name, so re-running updates the same
 * documents instead of creating a second set.
 *
 * Only dishes with a group and no subcategory reference are touched. Items
 * already migrated, and items that legitimately have no group, are left alone.
 *
 * Requires SANITY_WRITE_TOKEN in .env.local.
 */
import { createClient } from "@sanity/client";

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

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type Row = {
  _id: string;
  order?: number;
  groupEn?: string;
  groupFr?: string;
  categoryId?: string;
  categoryTitle?: string;
  hasSubcategory: boolean;
};

async function migrate() {
  const rows = await client.fetch<Row[]>(
    `*[_type == "dish"] | order(order asc) {
      _id, order, groupEn, groupFr,
      "categoryId": category._ref,
      "categoryTitle": category->titleEn,
      "hasSubcategory": defined(subcategory)
    }`,
  );

  // Group name → the sub-section document it becomes. Keyed by section so the
  // same name under two sections stays two distinct groups.
  const subcategories = new Map<
    string,
    { _id: string; titleEn: string; titleFr: string; categoryId: string; order: number }
  >();
  const assignments: { dishId: string; subcategoryId: string }[] = [];
  let skipped = 0;

  for (const row of rows) {
    if (!row.groupEn || !row.categoryId) {
      skipped += 1;
      continue;
    }

    const key = `${row.categoryId}::${row.groupEn}`;
    let existing = subcategories.get(key);

    if (!existing) {
      existing = {
        _id: `${row.categoryId}-sub-${slug(row.groupEn)}`,
        titleEn: row.groupEn,
        titleFr: row.groupFr || row.groupEn,
        categoryId: row.categoryId,
        // First appearance wins, which preserves the order the groups already
        // read in on the menu.
        order: subcategories.size + 1,
      };
      subcategories.set(key, existing);
    }

    if (!row.hasSubcategory) {
      assignments.push({ dishId: row._id, subcategoryId: existing._id });
    }
  }

  // Renumber per section, so each section's groups run 1..n.
  const perCategory = new Map<string, number>();
  for (const sub of subcategories.values()) {
    const next = (perCategory.get(sub.categoryId) ?? 0) + 1;
    perCategory.set(sub.categoryId, next);
    sub.order = next;
  }

  console.log(
    `${rows.length} items — ${subcategories.size} sub-sections, ${assignments.length} items to link, ${skipped} without a group (left alone)`,
  );
  for (const sub of subcategories.values()) {
    console.log(`  ${sub.order}. ${sub.titleEn}  →  ${sub._id}`);
  }

  if (dryRun) {
    console.log("\nDry run — nothing written.");
    return;
  }

  const tx = client.transaction();

  for (const sub of subcategories.values()) {
    tx.createOrReplace({
      _id: sub._id,
      _type: "subcategory",
      titleEn: sub.titleEn,
      titleFr: sub.titleFr,
      category: { _type: "reference", _ref: sub.categoryId },
      order: sub.order,
    });
  }

  for (const { dishId, subcategoryId } of assignments) {
    tx.patch(dishId, {
      set: { subcategory: { _type: "reference", _ref: subcategoryId } },
    });
  }

  await tx.commit();
  console.log(
    `\nDone — ${subcategories.size} sub-sections created, ${assignments.length} items linked.`,
  );
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
