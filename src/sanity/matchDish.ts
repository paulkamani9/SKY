/**
 * Recognising an item the Studio already has.
 *
 * Most of the menu is in Sanity under the ids the seeder gave it, so matching
 * is just the id. The exception is an item added by hand in the Studio and
 * never written back to src/lib: it carries a generated id and whatever name
 * was typed into the box, which may not be the name the master file uses for
 * the same dish — "The Croque Monsieur" here, "Croque monsieur sandwich"
 * there. Failing to recognise one of those puts the dish on the menu twice.
 *
 * Used by scripts/new-items.ts.
 */

/** Lowercase, unaccented, punctuation as spaces. */
export function normalise(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * The words that carry the name. Articles and the restaurant's own name are
 * dropped, so they cannot be the reason two names for one dish look different.
 */
const FILLER = new Set([
  "the", "a", "an", "our", "of", "and", "with",
  "le", "la", "les", "l", "de", "du", "des", "et",
  "sky",
]);

export function words(name: string): string[] {
  return normalise(name)
    .split(" ")
    .filter((word) => word && !FILLER.has(word));
}

function isSubset(inner: string[], outer: string[]): boolean {
  const set = new Set(outer);
  return inner.every((word) => set.has(word));
}

export type Candidate = {
  _id: string;
  nameEn?: string;
  categoryId?: string;
};

export type Match<T extends Candidate> =
  /** One document, confidently. */
  | { id: string; candidates?: undefined }
  /** Several, none of them more likely — for a human to settle. */
  | { id?: undefined; candidates: T[] }
  /** Nothing like it in the dataset: this item is new. */
  | { id?: undefined; candidates?: undefined };

/**
 * The document in `dishes` that is already this item, if there is one.
 *
 * Tried in order of how sure it is: the master file's own id, then the exact
 * name within the section the item belongs to, then the exact name anywhere,
 * then a name whose significant words are a subset of the other's — first in
 * the section, then anywhere. Ties are never broken by guessing: more than one
 * candidate at the level that matched is returned for a human to settle.
 *
 * Word-subset matching is not tried on one-word names, in either direction: it
 * would make "Melon" a match for every dish with "melon" in its name, and
 * "Mango" a match for The Mango Sovereign.
 */
export function matchDish<T extends Candidate>(
  masterId: string,
  nameEn: string,
  categoryId: string,
  dishes: T[],
): Match<T> {
  if (dishes.some((dish) => dish._id === masterId)) return { id: masterId };

  const target = normalise(nameEn);
  const targetWords = words(nameEn);

  const exact = dishes.filter((dish) => normalise(dish.nameEn ?? "") === target);
  const subset =
    targetWords.length >= 2
      ? dishes.filter((dish) => {
          const other = words(dish.nameEn ?? "");
          if (other.length < 2) return false;
          return isSubset(targetWords, other) || isSubset(other, targetWords);
        })
      : [];

  for (const tier of [
    exact.filter((dish) => dish.categoryId === categoryId),
    exact,
    subset.filter((dish) => dish.categoryId === categoryId),
    subset,
  ]) {
    if (tier.length === 1) return { id: tier[0]._id };
    if (tier.length > 1) return { candidates: tier };
  }

  return {};
}

/**
 * Documents worth a second look before an item is added as new.
 *
 * Matching deliberately refuses to act on a one-word name — "Melon" cannot be
 * allowed to claim any dish with "melon" in it. But when nothing matched and
 * something in the dataset shares every word of the name, the person running
 * the script should see it before a second copy of the dish goes on the menu.
 * Reported, never acted on: settle it with `existing`.
 */
export function relatedDishes<T extends Candidate>(
  nameEn: string,
  dishes: T[],
): T[] {
  const targetWords = words(nameEn);
  if (targetWords.length === 0) return [];

  return dishes.filter((dish) => {
    const other = words(dish.nameEn ?? "");
    return other.length > 0 && isSubset(targetWords, other);
  });
}
