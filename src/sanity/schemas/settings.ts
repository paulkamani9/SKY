import { defineField, defineType } from "sanity";

import { TRANSLATION_FIELDSET, translated } from "./translations";

export const settings = defineType({
  name: "settings",
  title: "Restaurant settings",
  type: "document",
  // Singleton: only one of these should ever exist.
  fieldsets: [TRANSLATION_FIELDSET],
  fields: [
    defineField({
      name: "name",
      title: "Restaurant name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "taglineEn",
      title: "Tagline (English)",
      type: "string",
      description: "Optional short line under the name.",
    }),
    defineField({
      name: "taglineFr",
      title: "Tagline (French)",
      type: "string",
    }),
    defineField({
      name: "currency",
      title: "Currency symbol",
      type: "string",
      initialValue: "Rs",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Optional. Shown at the top of the menu.",
      options: { hotspot: true },
    }),
    defineField({
      name: "noticeEn",
      title: "Notice (English)",
      type: "text",
      rows: 2,
      description:
        "Optional banner, e.g. 'Prices include VAT' or 'Kitchen closes at 22:00'.",
    }),
    defineField({
      name: "noticeFr",
      title: "Notice (French)",
      type: "text",
      rows: 2,
    }),
    ...translated("tagline", "Tagline"),
    ...translated("notice", "Notice", { type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({ title: title || "Restaurant settings" }),
  },
});
