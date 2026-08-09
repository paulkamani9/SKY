import { defineField, defineType } from "sanity";

/**
 * A named group of items inside a section — "Premium Gelato" under Gelato &
 * Sorbets, "Iced & Chilled Coffee" under Coffee.
 *
 * This used to be free text typed onto every item (groupEn/groupFr), which
 * meant renaming a group was an edit to every item in it, a typo silently
 * split one group into two, and the order groups appeared in was whatever the
 * item order happened to imply. As documents they are named once, ordered
 * explicitly, and picked from a list.
 */
export const subcategory = defineType({
  name: "subcategory",
  title: "Sub-section",
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
      name: "category",
      title: "Menu section",
      type: "reference",
      to: [{ type: "category" }],
      description: "The section this group sits inside.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Order within section",
      type: "number",
      description: "Lower numbers appear first.",
      validation: (r) => r.required().integer(),
      initialValue: 1,
    }),
  ],
  orderings: [
    {
      name: "orderAsc",
      title: "Menu order",
      by: [
        { field: "category.order", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "titleEn",
      section: "category.titleEn",
      order: "order",
    },
    prepare: ({ title, section, order }) => ({
      title: `${order}. ${title}`,
      subtitle: section ?? "No section",
    }),
  },
});
