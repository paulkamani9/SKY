import { defineField, defineType } from "sanity";

import { TRANSLATION_FIELDSET, translated } from "./translations";

export const category = defineType({
  name: "category",
  title: "Menu section",
  type: "document",
  fieldsets: [TRANSLATION_FIELDSET],
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleFr",
      title: "Title (French)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "introEn",
      title: "Intro line (English)",
      type: "text",
      rows: 2,
      description:
        'Optional line under the section title, e.g. "Served daily until 13:00."',
    }),
    defineField({
      name: "introFr",
      title: "Intro line (French)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "footnoteEn",
      title: "Footnote (English)",
      type: "text",
      rows: 2,
      description:
        'Optional small print after the items, e.g. "Milk alternatives available for an additional Rs 50."',
    }),
    defineField({
      name: "footnoteFr",
      title: "Footnote (French)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "fruitsEn",
      title: "Fruit list (English)",
      type: "text",
      rows: 2,
      description:
        'What is on the display table today — fruits separated by commas, e.g. "Papaya, Mango, Red Dragon Fruit". Shown as a row of chips under the items, so a guest building their own bowl or blend can see what there is to choose from. Edit this whenever the season changes; it is the one place the menu names the fruit, so nothing else has to be touched. Leave empty on sections that do not need it.',
    }),
    defineField({
      name: "fruitsFr",
      title: "Fruit list (French)",
      type: "text",
      rows: 2,
      description:
        "Leave empty and the English list is shown instead — useful when the season turns and there is no time to translate.",
    }),
    ...translated("title", "Title"),
    ...translated("intro", "Intro line", { type: "text", rows: 2 }),
    ...translated("footnote", "Footnote", { type: "text", rows: 2 }),
    ...translated("fruits", "Fruit list", { type: "text", rows: 2 }),
    defineField({
      name: "banner",
      title: "Section banner",
      type: "image",
      description:
        "Wide photo behind the section heading. Landscape, at least 2000px wide — the title sits over the lower third, so keep that area free of anything important. Optional: without one the section just shows its heading.",
      options: { hotspot: true },
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description:
        "Photo grid suits food with pictures. Compact list suits long drink lists where photos would only slow the page down.",
      options: {
        list: [
          { title: "Photo grid", value: "grid" },
          { title: "Compact list", value: "list" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "wideTiles",
      title: "One item per row on a phone",
      type: "boolean",
      description:
        "Photo grid only. For short sections of showpiece items — the fruit bowls — where two columns shrink each photo to a thumbnail. Off gives the usual two-up phone grid.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first.",
      validation: (r) => r.required().integer(),
      initialValue: 1,
    }),
    defineField({
      name: "hidden",
      title: "Hide this section",
      type: "boolean",
      description: "Hides the section and all its items from the menu.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      name: "orderAsc",
      title: "Menu order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "titleEn", subtitle: "titleFr", order: "order" },
    prepare: ({ title, subtitle, order }) => ({
      title: `${order}. ${title}`,
      subtitle,
    }),
  },
});
