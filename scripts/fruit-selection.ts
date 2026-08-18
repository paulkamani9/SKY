/**
 * Moves the fruit list off the sections and onto one document.
 *
 *   npm run migrate:fruit -- --dry-run   report what would change
 *   npm run migrate:fruit                apply it
 *
 * The list turns with the season and is the same fruit whichever section it is
 * read under, so it becomes a single "Today's fruit selection" document. Each
 * section that printed it gets `showFruits`, and its own copy is cleared so
 * there is only ever one list to edit.
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

const FRUIT_FIELDS = [
  "fruitsEn",
  "fruitsFr",
  "fruitsIt",
  "fruitsDe",
  "fruitsRu",
] as const;

type Section = {
  _id: string;
  titleEn: string;
} & Partial<Record<(typeof FRUIT_FIELDS)[number], string>>;

async function main() {
  console.log(
    `${dryRun ? "Dry run" : "Applying"} — project ${projectId}, dataset ${dataset}\n`,
  );

  const sections = await client.fetch<Section[]>(
    `*[_type == "category" && defined(fruitsEn)]{_id, titleEn, ${FRUIT_FIELDS.join(", ")}}`,
  );

  if (sections.length === 0) {
    console.log("No section carries a fruit list — nothing to move.");
    return;
  }

  // Every section carries the same list today; take the first and report any
  // that disagree rather than silently picking a winner.
  const [source, ...rest] = sections;
  for (const other of rest) {
    if (other.fruitsEn !== source.fruitsEn) {
      console.warn(
        `  ! ${other.titleEn} lists different fruit — "${source.titleEn}" wins:\n      ${other.fruitsEn}`,
      );
    }
  }

  const fruits = Object.fromEntries(
    FRUIT_FIELDS.map((field) => [field, source[field]]).filter(
      ([, value]) => value !== undefined,
    ),
  );

  console.log(`  fruit-selection ← ${source.titleEn}`);
  for (const [field, value] of Object.entries(fruits)) {
    console.log(`      ${field}: ${value}`);
  }
  for (const section of sections) {
    console.log(
      `  section ${section.titleEn} (${section._id}) → showFruits: true, fruit fields cleared`,
    );
  }

  if (dryRun) return;

  let tx = client.transaction().createOrReplace({
    _id: "fruit-selection",
    _type: "fruitSelection",
    ...fruits,
  });

  for (const section of sections) {
    tx = tx.patch(section._id, {
      set: { showFruits: true },
      unset: [...FRUIT_FIELDS],
    });
  }

  await tx.commit();
  console.log("\nDone. The list now lives in Today → Today's fruit selection.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
