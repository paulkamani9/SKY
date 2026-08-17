import { defineField, type FieldDefinition } from "sanity";

/**
 * Italian, German and Russian fields for a translatable value.
 *
 * English and French stay at the top of every form — they are what the menu was
 * written in and what staff proof-read. The other three are folded into one
 * collapsed fieldset, so adding three languages did not turn a five-field item
 * form into a twenty-field wall that nobody wants to scroll past to reach the
 * price and the "Available today" switch.
 */
export const TRANSLATION_FIELDSET = {
  name: "translations",
  title: "Italiano · Deutsch · Русский",
  description:
    "Left empty, the English line is shown instead — a missing translation never leaves a blank space on the menu.",
  options: { collapsible: true, collapsed: true },
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

  return LANGUAGES.map(({ suffix, label }) =>
    type === "text"
      ? defineField({
          name: `${name}${suffix}`,
          title: `${title} (${label})`,
          type: "text",
          rows,
          fieldset: "translations",
        })
      : defineField({
          name: `${name}${suffix}`,
          title: `${title} (${label})`,
          type: "string",
          fieldset: "translations",
        }),
  );
}
