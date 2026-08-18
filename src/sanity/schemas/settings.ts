import { defineField, defineType } from "sanity";

import { TRANSLATION_GROUP, translated } from "./translations";

export const settings = defineType({
  name: "settings",
  title: "Restaurant settings",
  type: "document",
  // Singleton: only one of these should ever exist.
  groups: [
    { name: "basics", title: "Restaurant", default: true },
    TRANSLATION_GROUP,
  ],
  fields: [
    defineField({
      name: "name",
      title: "Restaurant name",
      type: "string",
      group: "basics",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "taglineEn",
      title: "Tagline (English)",
      type: "string",
      group: "basics",
      description: "The small line under the name at the top of the menu.",
    }),
    defineField({
      name: "taglineFr",
      title: "Tagline (French)",
      type: "string",
      group: "basics",
    }),
    defineField({
      name: "currency",
      title: "Currency symbol",
      type: "string",
      group: "basics",
      description: "Printed before every price on the menu.",
      initialValue: "Rs",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "basics",
      description: "Optional. Shown as a round badge at the top of the menu.",
      options: { hotspot: true },
    }),
    defineField({
      name: "noticeEn",
      title: "Notice (English)",
      type: "text",
      rows: 2,
      group: "basics",
      description:
        "Optional line about the menu as a whole, e.g. 'Prices include VAT'.",
    }),
    defineField({
      name: "noticeFr",
      title: "Notice (French)",
      type: "text",
      rows: 2,
      group: "basics",
    }),
    ...translated("tagline", "Tagline"),
    ...translated("notice", "Notice", { type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({ title: title || "Restaurant settings" }),
  },
});
