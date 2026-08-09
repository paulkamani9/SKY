/*
 * Read by both builds of the Studio, which expose environment variables under
 * different prefixes:
 *
 *   Next.js (the embedded Studio at /studio) inlines NEXT_PUBLIC_* only.
 *   The Sanity CLI (the hosted Studio at sky-menu.sanity.studio) inlines
 *   SANITY_STUDIO_* only — it ignores NEXT_PUBLIC_*, which is why the first
 *   deploy booted to "Missing environment variable".
 *
 * So each value is read under both names. Keep the two pairs in .env.local in
 * sync; none of them are secret (they are public identifiers either way).
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_STUDIO_API_VERSION ||
  "2024-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET (or SANITY_STUDIO_DATASET for the hosted Studio)",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID (or SANITY_STUDIO_PROJECT_ID for the hosted Studio)",
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
