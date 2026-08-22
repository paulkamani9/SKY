import type { Dish } from "@/sanity/queries";

/**
 * The languages the menu is served in, in the order the switcher lists them.
 *
 * Every translatable value is stored as one field per language, suffixed with
 * the language's capitalised code — nameEn, nameFr, nameIt, nameDe, nameRu. It
 * is repetitive in the Studio, but it keeps a single item in a single document:
 * staff turn one thing off when it runs out, and there is no per-language
 * publish state to get out of step.
 */
export const LANGS = ["en", "fr", "it", "de", "ru"] as const;

export type Lang = (typeof LANGS)[number];

const SUFFIX: Record<Lang, string> = {
  en: "En",
  fr: "Fr",
  it: "It",
  de: "De",
  ru: "Ru",
};

/** Endonyms — a guest looking for their language is looking for its own name. */
export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  it: "Italiano",
  de: "Deutsch",
  ru: "Русский",
};

export const strings = {
  en: {
    soldOut: "Sold out",
    menu: "Menu",
    close: "Close",
    sections: "Menu sections",
    language: "Language",
    fruits: "Fruits available",
    empty: "The menu is being updated. Please ask a member of staff.",
    vat: "All prices include VAT.",
  },
  fr: {
    soldOut: "Épuisé",
    menu: "Carte",
    close: "Fermer",
    sections: "Sections de la carte",
    language: "Langue",
    fruits: "Fruits disponibles",
    empty:
      "La carte est en cours de mise à jour. Merci de demander au personnel.",
    vat: "Tous les prix sont TVA comprise.",
  },
  it: {
    soldOut: "Esaurito",
    menu: "Menù",
    close: "Chiudi",
    sections: "Sezioni del menù",
    language: "Lingua",
    fruits: "Frutta disponibile",
    empty: "Il menù è in aggiornamento. Chieda pure a un membro del personale.",
    vat: "Tutti i prezzi includono l'IVA.",
  },
  de: {
    soldOut: "Ausverkauft",
    menu: "Speisekarte",
    close: "Schließen",
    sections: "Bereiche der Karte",
    language: "Sprache",
    fruits: "Verfügbare Früchte",
    empty:
      "Die Karte wird gerade aktualisiert. Bitte fragen Sie unser Personal.",
    vat: "Alle Preise inklusive MwSt.",
  },
  ru: {
    soldOut: "Закончилось",
    menu: "Меню",
    close: "Закрыть",
    sections: "Разделы меню",
    language: "Язык",
    fruits: "Доступные фрукты",
    empty: "Меню обновляется. Пожалуйста, обратитесь к персоналу.",
    vat: "Все цены включают НДС.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof strings)["en"]) {
  return strings[lang][key];
}

/** True for anything stored on a device or reported by the browser. */
export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

/**
 * Reads one translatable value off a document — pick(lang, dish, "name")
 * returns dish.nameRu, dish.nameEn or dish.nameFr, in that order.
 *
 * The fallback chain matters: only English and French are guaranteed to be
 * filled in, so an Italian guest reading an item nobody has translated yet sees
 * the English line rather than a blank space where the dish should be.
 */
export function pick(
  lang: Lang,
  source: Record<string, unknown> | null | undefined,
  field: string,
): string {
  if (!source) return "";

  const read = (l: Lang) => {
    const value = source[`${field}${SUFFIX[l]}`];
    return typeof value === "string" ? value.trim() : "";
  };

  return read(lang) || read("en") || read("fr");
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
  return pick(lang, dish, "priceNote") || null;
}

/** Price notes are prose, so they shouldn't use the tabular price styling. */
export function isNumericPrice(dish: Dish): boolean {
  return typeof dish.price === "number";
}

/**
 * The fruit list is typed as one comma-separated line per language, because
 * that is what it is: a sentence's worth of fruit, edited in one box. The menu
 * draws it as chips.
 */
export function fruitList(
  lang: Lang,
  source: Record<string, unknown> | null | undefined,
): string[] {
  return pick(lang, source, "fruits")
    .split(",")
    .map((fruit) => fruit.trim())
    .filter(Boolean);
}
