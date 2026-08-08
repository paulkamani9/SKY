import { groq } from "next-sanity";

import { client, urlFor } from "./client";

export type Lang = "en" | "fr";

export type Layout = "grid" | "list";

/**
 * View model handed to the UI. Images are already resolved to plain URLs here,
 * so components don't care whether a photo came from Sanity or from the
 * placeholder photo set.
 */
export type Dish = {
  _id: string;
  nameEn: string;
  nameFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  /** Null for items priced on selection — show the price note instead. */
  price: number | null;
  priceNoteEn?: string;
  priceNoteFr?: string;
  /** Optional heading within a section, e.g. "Premium Gelato". */
  groupEn?: string;
  groupFr?: string;
  available: boolean;
  imageUrl: string | null;
  imageUrlLarge: string | null;
};

export type Category = {
  _id: string;
  titleEn: string;
  titleFr: string;
  introEn?: string;
  introFr?: string;
  footnoteEn?: string;
  footnoteFr?: string;
  layout: Layout;
  dishes: Dish[];
};

export type Settings = {
  name: string;
  taglineEn?: string;
  taglineFr?: string;
  currency: string;
  logoUrl: string | null;
  noticeEn?: string;
  noticeFr?: string;
};

type SanityImage = { asset?: { _ref?: string } } | null;

type RawDish = Omit<Dish, "imageUrl" | "imageUrlLarge"> & { image?: SanityImage };
type RawCategory = Omit<Category, "dishes"> & { dishes: RawDish[] };
type RawSettings = Omit<Settings, "logoUrl"> & { logo?: SanityImage };

const menuQuery = groq`*[_type == "category" && hidden != true] | order(order asc) {
  _id,
  titleEn,
  titleFr,
  introEn,
  introFr,
  footnoteEn,
  footnoteFr,
  "layout": coalesce(layout, "grid"),
  "dishes": *[_type == "dish" && references(^._id)] | order(order asc) {
    _id,
    nameEn,
    nameFr,
    descriptionEn,
    descriptionFr,
    price,
    priceNoteEn,
    priceNoteFr,
    groupEn,
    groupFr,
    "available": coalesce(available, true),
    image
  }
}[count(dishes) > 0]`;

const settingsQuery = groq`*[_type == "settings"][0]{
  name, taglineEn, taglineFr, currency, logo, noticeEn, noticeFr
}`;

function hasAsset(image: SanityImage | undefined): boolean {
  return Boolean(image?.asset?._ref);
}

function resolveDish(raw: RawDish): Dish {
  const { image, ...rest } = raw;
  const price = typeof rest.price === "number" ? rest.price : null;

  if (!hasAsset(image)) {
    return { ...rest, price, imageUrl: null, imageUrlLarge: null };
  }

  return {
    ...rest,
    price,
    imageUrl: urlFor(image!)
      .width(600)
      .height(450)
      .fit("crop")
      .quality(72)
      .auto("format")
      .url(),
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
    return (raw ?? []).map((c) => ({ ...c, dishes: c.dishes.map(resolveDish) }));
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
