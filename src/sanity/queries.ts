import { groq } from "next-sanity";

import { imageScales } from "@/lib/imageScale";

import { client, urlFor } from "./client";

export type { Lang } from "@/lib/i18n";

export type Layout = "grid" | "list";

/**
 * A value written in every language. English and French are the two the menu
 * was written in and are required everywhere; the other three are translations
 * that may not have been filled in yet, and `pick` falls back when they are
 * missing. See lib/i18n.
 */
type Translated<K extends string> = Record<`${K}En` | `${K}Fr`, string> &
  Partial<Record<`${K}It` | `${K}De` | `${K}Ru`, string>>;

/** The same, for values that are optional in every language. */
type MaybeTranslated<K extends string> = Partial<
  Record<`${K}En` | `${K}Fr` | `${K}It` | `${K}De` | `${K}Ru`, string>
>;

/**
 * View model handed to the UI. Images are already resolved to plain URLs here,
 * so components don't care whether a photo came from Sanity or from the
 * placeholder photo set.
 */
export type Dish = Translated<"name"> &
  /** Description, price note, and the section sub-heading this item sits under
      ("Premium Gelato") — all optional, all translated. */
  MaybeTranslated<"description" | "priceNote" | "group"> & {
  _id: string;
  /** Null for items priced on selection — show the price note instead. */
  price: number | null;
  available: boolean;
  imageUrl: string | null;
  imageUrlLarge: string | null;
  /**
   * Candidate widths for the tile, so a phone can pick a sharp one. A single
   * 600px source was not enough: the tile magnifies each cut-out with a CSS
   * `scale()`, which adds no pixels, so an item at 1.7x needed ~834 device px
   * on a DPR-3 phone and got 600. See DishCard for the matching `sizes`.
   */
  imageSrcSet?: string | null;
  /**
   * Linear scale that evens out how much of its tile each cut-out paints.
   * Measured on the server; 1 means "leave it alone". See lib/imageScale.
   */
  imageScale?: number;
};

export type Category = Translated<"title"> &
  /** `fruits` is one comma-separated line — the fruits on the display table
      today, listed under the section so a guest composing their own bowl or
      blend can see what there is to choose from. */
  MaybeTranslated<"intro" | "footnote" | "fruits"> & {
  _id: string;
  layout: Layout;
  /**
   * One item per row on a phone, two on anything wider. For sections of a few
   * showpiece items — the fruit bowls — where the standard two-up grid shrank
   * each photo to a thumbnail.
   */
  wideTiles?: boolean;
  /** Widths for the section banner, or null when the section has no photo. */
  bannerSrcSet?: string | null;
  bannerUrl?: string | null;
  dishes: Dish[];
};

export type Settings = MaybeTranslated<"tagline" | "notice"> & {
  name: string;
  currency: string;
  logoUrl: string | null;
};

type SanityImage = { asset?: { _ref?: string } } | null;

type RawDish = Omit<Dish, "imageUrl" | "imageUrlLarge"> & { image?: SanityImage };
type RawCategory = Omit<Category, "dishes" | "bannerSrcSet" | "bannerUrl"> & {
  dishes: RawDish[];
  banner?: SanityImage;
};
type RawSettings = Omit<Settings, "logoUrl"> & { logo?: SanityImage };

const menuQuery = groq`*[_type == "category" && hidden != true] | order(order asc) {
  _id,
  titleEn, titleFr, titleIt, titleDe, titleRu,
  introEn, introFr, introIt, introDe, introRu,
  footnoteEn, footnoteFr, footnoteIt, footnoteDe, footnoteRu,
  fruitsEn, fruitsFr, fruitsIt, fruitsDe, fruitsRu,
  banner,
  wideTiles,
  "layout": coalesce(layout, "grid"),
  // Unavailable items are dropped here rather than styled as sold out, so a
  // guest never reads about something they cannot order. They stay in the
  // Studio untouched — flipping "Available today" back on restores them.
  // "!= false" rather than "== true" so items predating the field still show.
  "dishes": *[_type == "dish" && category._ref == ^._id && available != false]
    | order(coalesce(subcategory->order, 0) asc, order asc) {
    _id,
    nameEn, nameFr, nameIt, nameDe, nameRu,
    descriptionEn, descriptionFr, descriptionIt, descriptionDe, descriptionRu,
    price,
    priceNoteEn, priceNoteFr, priceNoteIt, priceNoteDe, priceNoteRu,
    // The sub-section is the source of truth; the legacy free-text group is
    // the fallback for any item not yet migrated onto a reference.
    "groupEn": coalesce(subcategory->titleEn, groupEn),
    "groupFr": coalesce(subcategory->titleFr, groupFr),
    "groupIt": subcategory->titleIt,
    "groupDe": subcategory->titleDe,
    "groupRu": subcategory->titleRu,
    "available": coalesce(available, true),
    image
  }
}[count(dishes) > 0]`;

const settingsQuery = groq`*[_type == "settings"][0]{
  name, currency, logo,
  taglineEn, taglineFr, taglineIt, taglineDe, taglineRu,
  noticeEn, noticeFr, noticeIt, noticeDe, noticeRu
}`;

function hasAsset(image: SanityImage | undefined): boolean {
  return Boolean(image?.asset?._ref);
}

/**
 * A 64px PNG of the same image, used only for measuring.
 *
 * Width only — deliberately. Asking for width AND height requests a square,
 * and Sanity honours that by cropping a square out of a non-square asset
 * (`?rect=0,308,528,528` on a 528x1143 sundae). The probe then measured a
 * zoomed crop while the tile displayed the whole image, so tall subjects were
 * read as far larger than they render and never got scaled up. This must stay
 * in step with imageUrl's geometry below.
 *
 * PNG because the measurement is of the alpha channel — auto("format") would
 * happily serve a JPEG and flatten every cut-out onto opaque white.
 */
function probeUrl(image: SanityImage): string {
  return urlFor(image!).width(64).format("png").url();
}

/**
 * Tile widths offered to the browser. Width only, for the same reason as the
 * probe above: adding a height would make Sanity crop a square out of a tall
 * asset. The top end covers a 2-column phone grid at DPR 3 with a cut-out
 * scaled up to MAX_SCALE.
 */
const TILE_WIDTHS = [400, 600, 900, 1200];

/**
 * Banner widths. Wider than the tile set because a banner spans the full
 * viewport on a phone and the whole container on desktop, so it needs a
 * retina-sized source at the top end.
 */
const BANNER_WIDTHS = [800, 1400, 2000];

function resolveBanner(banner?: SanityImage) {
  if (!hasAsset(banner)) return { bannerUrl: null, bannerSrcSet: null };

  return {
    bannerUrl: urlFor(banner!).width(1400).quality(76).auto("format").url(),
    bannerSrcSet: BANNER_WIDTHS.map(
      (w) => `${urlFor(banner!).width(w).quality(76).auto("format").url()} ${w}w`,
    ).join(", "),
  };
}

/** A dish plus the throwaway URL used to measure it. */
type ResolvedDish = Dish & { probe?: string };

function resolveDish(raw: RawDish): ResolvedDish {
  const { image, ...rest } = raw;
  const price = typeof rest.price === "number" ? rest.price : null;

  if (!hasAsset(image)) {
    return { ...rest, price, imageUrl: null, imageUrlLarge: null };
  }

  return {
    ...rest,
    price,
    probe: probeUrl(image!),
    // Width only, no height/crop. Forcing a 4:3 box here cut into every photo
    // — a cut-out lost its edges and a tall shot lost its subject — and the
    // grid does not need it: the tile is square and the image is drawn with
    // object-contain, so whatever shape arrives is shown whole.
    imageUrl: urlFor(image!).width(600).quality(72).auto("format").url(),
    imageSrcSet: TILE_WIDTHS.map(
      (w) => `${urlFor(image!).width(w).quality(72).auto("format").url()} ${w}w`,
    ).join(", "),
    imageUrlLarge: urlFor(image!).width(1400).quality(80).auto("format").url(),
  };
}

// A hiccup at Sanity should degrade gracefully, not 500 on a screen a guest is
// holding at the table.
export async function getMenu(): Promise<Category[]> {
  try {
    const raw = await client.fetch<RawCategory[]>(
      menuQuery,
      {},
      { next: { revalidate: 60 } },
    );

    const categories = (raw ?? []).map(({ banner, ...c }) => ({
      ...c,
      ...resolveBanner(banner),
      dishes: c.dishes.map(resolveDish),
    }));

    // Measure every cut-out once per revalidation, then hand the browser a
    // plain number. Scales are cached by URL, so in practice this only does
    // work for images that changed since the last render.
    const probes = categories.flatMap((c) =>
      c.dishes.map((d) => d.probe).filter((p): p is string => Boolean(p)),
    );
    const scales = await imageScales(probes);

    return categories.map((c) => ({
      ...c,
      dishes: c.dishes.map(({ probe, ...dish }) => ({
        ...dish,
        imageScale: probe ? (scales.get(probe) ?? 1) : 1,
      })),
    }));
  } catch (error) {
    console.error("Failed to load menu from Sanity", error);
    return [];
  }
}

export async function getSettings(): Promise<Settings | null> {
  try {
    const raw = await client.fetch<RawSettings | null>(
      settingsQuery,
      {},
      { next: { revalidate: 60 } },
    );
    if (!raw) return null;

    const { logo, ...rest } = raw;
    return {
      ...rest,
      logoUrl: hasAsset(logo)
        ? urlFor(logo!).width(120).height(120).fit("crop").url()
        : null,
    };
  } catch (error) {
    console.error("Failed to load settings from Sanity", error);
    return null;
  }
}
