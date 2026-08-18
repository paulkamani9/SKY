import { defineField, type FieldDefinition } from "sanity";

/**
 * Italian, German and Russian fields for a translatable value.
 *
 * English and French stay on the main tab — they are what the menu was written
 * in and what staff proof-read. The other three sit behind a tab of their own,
 * so adding three languages did not turn a five-field item form into a
 * twenty-field wall to scroll past on the way to the price.
 */
export const TRANSLATION_GROUP = {
  name: "translations",
  title: "Other languages",
};

const LANGUAGES = [
  { suffix: "It", label: "Italian" },
  { suffix: "De", label: "German" },
  { suffix: "Ru", label: "Russian" },
] as const;

export function translated(
  name: string,
  title: string,
  options: { type?: "string" | "text"; rows?: number } = {},
): FieldDefinition[] {
  const { type = "string", rows = 3 } = options;

  return LANGUAGES.map(({ suffix, label }, index) => {
    // Said once per value rather than on all three, so the tab reads as three
    // languages and not nine warnings.
    const description =
      index === 0 ? "Leave empty to show the English line." : undefined;

    return type === "text"
      ? defineField({
          name: `${name}${suffix}`,
          title: `${title} (${label})`,
          type: "text",
          rows,
          group: "translations",
          description,
        })
      : defineField({
          name: `${name}${suffix}`,
          title: `${title} (${label})`,
          type: "string",
          group: "translations",
          description,
        });
  });
}
