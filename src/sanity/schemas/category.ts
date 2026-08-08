import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Menu section",
  type: "document",
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
