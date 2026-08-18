import { defineField, defineType } from "sanity";

import { TRANSLATION_GROUP, translated } from "./translations";

/**
 * A named group of items inside a section — "Premium Gelato" under Gelato &
 * Sorbets, "Iced & Chilled Coffee" under Coffee.
 *
 * This used to be free text typed onto every item (groupEn/groupFr), which
 * meant renaming a group was an edit to every item in it, and a typo silently
 * split one group into two. As documents they are named once and picked from a
 * list.
 *
 * They carry no order of their own: a group's heading appears on the menu where
 * its first item sits, so the order of the items is the only order there is.
 */
export const subcategory = defineType({
  name: "subcategory",
  title: "Group inside a section",
  type: "document",
  groups: [
    { name: "group", title: "Group", default: true },
    TRANSLATION_GROUP,
  ],
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      group: "group",
      description:
        "The small heading printed above this run of items on the menu.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleFr",
      title: "Title (French)",
      type: "string",
      group: "group",
      validation: (r) => r.required(),
    }),
    ...translated("title", "Title"),
    defineField({
      name: "category",
      title: "Menu section",
      type: "reference",
      to: [{ type: "category" }],
      group: "group",
      description: "The section this group sits inside.",
      validation: (r) => r.required(),
    }),
    // Superseded by item order — see the note above.
    defineField({ name: "order", type: "number", hidden: true }),
  ],
  preview: {
    select: {
      title: "titleEn",
      section: "category.titleEn",
    },
    prepare: ({ title, section }) => ({
      title,
      // "in Coffee" rather than the bare section name, so this list cannot be
      // mistaken for the Menu sections list it sits next to.
      subtitle: section ? `in ${section}` : "Not in a section",
    }),
  },
});
