/**
 * Prints the menu in render order: one line per section, one per item.
 *
 *   npm run menu:order > before.txt
 *   …migrate…
 *   npm run menu:order > after.txt && diff before.txt after.txt
 *
 * The ordering migration rewrites how order is stored, which is exactly the
 * kind of change that can scramble a menu silently. This is the check that it
 * did not: the diff must be empty.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  useCdn: false,
});

/**
 * `order` is read when a document has no rank yet, so this prints the same
 * sequence before and after the migration. Once every document is ranked the
 * coalesce falls away on its own.
 */
const query = `*[_type == "category" && hidden != true]
  | order(coalesce(orderRank, "9") asc, order asc) {
    titleEn,
    "items": *[_type == "dish" && category._ref == ^._id && available != false]
      | order(coalesce(orderRank, "9") asc, coalesce(subcategory->order, 0) asc, order asc) {
        nameEn,
        "group": coalesce(subcategory->titleEn, groupEn, "")
      }
  }`;

type Row = { titleEn: string; items: { nameEn: string; group: string }[] };

async function main() {
  const sections = await client.fetch<Row[]>(query);

  for (const section of sections) {
    console.log(`## ${section.titleEn}`);
    for (const item of section.items) {
      console.log(`   ${item.group ? `[${item.group}] ` : ""}${item.nameEn}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
