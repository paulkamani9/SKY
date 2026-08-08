import type { Dish, Lang } from "@/sanity/queries";

export const strings = {
  en: {
    soldOut: "Sold out",
    menu: "Menu",
    close: "Close",
    sections: "Menu sections",
    empty: "The menu is being updated. Please ask a member of staff.",
  },
  fr: {
    soldOut: "Épuisé",
    menu: "Carte",
    close: "Fermer",
    sections: "Sections de la carte",
    empty:
      "La carte est en cours de mise à jour. Merci de demander au personnel.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof strings)["en"]) {
  return strings[lang][key];
}

/** Falls back to the other language rather than showing an empty line. */
export function pick(
  lang: Lang,
  en: string | undefined | null,
  fr: string | undefined | null,
): string {
  const primary = lang === "en" ? en : fr;
  const fallback = lang === "en" ? fr : en;
  return (primary || fallback || "").trim();
}

export function formatPrice(price: number, currency: string): string {
  const hasCents = !Number.isInteger(price);
  return `${currency} ${price.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Items priced on selection ("Based on selection", "As priced") carry a note
 * instead of a number. Returns null when there is neither.
 */
export function priceLabel(
  dish: Dish,
  lang: Lang,
  currency: string,
): string | null {
  if (typeof dish.price === "number") return formatPrice(dish.price, currency);
  const note = pick(lang, dish.priceNoteEn, dish.priceNoteFr);
  return note || null;
}

/** Price notes are prose, so they shouldn't use the tabular price styling. */
export function isNumericPrice(dish: Dish): boolean {
  return typeof dish.price === "number";
}
