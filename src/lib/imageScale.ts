import sharp from "sharp";

/**
 * How much of its tile a cut-out should paint, and the guard rails around it.
 *
 * Cut-outs arrive at wildly different subject sizes — measured across the
 * uploaded set, painted area ran from 11% of the frame to 75%, a 6.5x spread
 * that reads as some items being far bigger than others even though every tile
 * is identical. Fitting by bounding box does not fix it: a disc fills its box,
 * a pineapple does not.
 *
 * So each image is measured — decoded small, opaque pixels counted — and scaled
 * so every subject paints roughly the same share of its tile. Area scales with
 * the square of the linear scale, hence the sqrt.
 *
 * This runs on the server. It used to run in the browser against a canvas,
 * which worked in dev and silently did nothing in production: cdn.sanity.io
 * only sends CORS headers for origins on the project allowlist, so the canvas
 * was tainted everywhere else and every image fell back to natural size.
 * Server-side there is no origin to allow, and the browser ships zero decodes.
 */
const TARGET_COVERAGE = 0.38;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.7;
/** No subject may span more than this share of its tile, so none is clipped. */
const FILL_LIMIT = 0.94;
/** Decode size. Coverage is a ratio, so a thumbnail measures as well as a full frame. */
const SAMPLE = 64;
/** Below this alpha a pixel counts as background. */
const ALPHA_FLOOR = 16;

/**
 * Measured scale per probe URL. Sanity asset URLs are content-addressed, so a
 * URL never points at different pixels and this can be kept for the life of
 * the server process.
 */
const cache = new Map<string, number>();

async function measure(url: string): Promise<number> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`probe ${response.status}`);

  const input = Buffer.from(await response.arrayBuffer());

  // Same fit the tile uses — contain, centred, transparent margin — so the
  // measurement describes what actually gets painted on screen.
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .resize(SAMPLE, SAMPLE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let painted = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < width * height; i += 1) {
    // Alpha only: a subject cut out on transparency is what we are sizing.
    if (data[i * channels + (channels - 1)] <= ALPHA_FLOOR) continue;

    painted += 1;
    const x = i % width;
    const y = (i - x) / width;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (maxX < 0) return 1;

  const coverage = painted / (width * height);
  if (coverage <= 0.01) return 1;

  const extent = Math.max(maxX - minX + 1, maxY - minY + 1) / Math.max(width, height);

  // A tall, thin subject — a sundae glass — has little painted area but already
  // spans the tile, so equalising area alone would push it past the edge and
  // crop it. Its own bounds are the ceiling.
  const fits = FILL_LIMIT / extent;
  let scale = Math.sqrt(TARGET_COVERAGE / coverage);
  scale = Math.min(scale, MAX_SCALE, fits);
  scale = Math.max(scale, MIN_SCALE);

  return Number(scale.toFixed(3));
}

/** Never throws: an unmeasurable image keeps its natural size. */
export async function imageScale(url: string): Promise<number> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  let scale = 1;
  try {
    scale = await measure(url);
  } catch {
    scale = 1;
  }

  cache.set(url, scale);
  return scale;
}

/** Resolves scales for many images at once, a few at a time. */
export async function imageScales(urls: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(urls)];
  const out = new Map<string, number>();
  const CONCURRENCY = 8;

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    const scales = await Promise.all(batch.map((u) => imageScale(u)));
    batch.forEach((u, n) => out.set(u, scales[n]));
  }

  return out;
}
