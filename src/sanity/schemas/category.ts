import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

import { TRANSLATION_GROUP, translated } from "./translations";

export const category = defineType({
  name: "category",
  title: "Menu section",
  type: "document",
  groups: [
    { name: "section", title: "Section", default: true },
    TRANSLATION_GROUP,
    { name: "appearance", title: "How it looks" },
  ],
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      group: "section",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleFr",
      title: "Title (French)",
      type: "string",
      group: "section",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "introEn",
      title: "Intro line (English)",
      type: "text",
      rows: 2,
      group: "section",
      description:
        'Optional line under the section title, e.g. "Served daily until 13:00."',
    }),
    defineField({
      name: "introFr",
      title: "Intro line (French)",
      type: "text",
      rows: 2,
      group: "section",
    }),
    defineField({
      name: "footnoteEn",
      title: "Footnote (English)",
      type: "text",
      rows: 2,
      group: "section",
      description:
        'Optional small print after the items, e.g. "Milk alternatives available for an additional Rs 50."',
    }),
    defineField({
      name: "footnoteFr",
      title: "Footnote (French)",
      type: "text",
      rows: 2,
      group: "section",
    }),
    defineField({
      name: "showFruits",
      title: "Show today's fruit list",
      type: "boolean",
      group: "section",
      description:
        "Prints the fruits from Today → Today's fruit selection as chips under this section. On for the sections where a guest picks their own fruit.",
      initialValue: false,
    }),

    ...translated("title", "Title"),
    ...translated("intro", "Intro line", { type: "text", rows: 2 }),
    ...translated("footnote", "Footnote", { type: "text", rows: 2 }),

    defineField({
      name: "banner",
      title: "Section banner",
      type: "image",
      group: "appearance",
      description:
        "Wide photo behind the section heading, running the full width of the screen. Landscape, at least 2000px wide — the title sits over the lower third, so keep that area free of anything important. Optional: without one the section just shows its heading.",
      options: { hotspot: true },
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      group: "appearance",
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
      group: "appearance",
      description:
        "Photo grid only. For short sections of showpiece items — the fruit bowls — where two columns shrink each photo to a thumbnail. Off gives the usual two-up phone grid.",
      initialValue: false,
    }),
    defineField({
      name: "hidden",
      title: "Hide this section",
      type: "boolean",
      group: "appearance",
      description:
        "Takes the section and all its items off the menu. Nothing is deleted.",
      initialValue: false,
    }),
    // Sections are dragged into order under Setup → Menu sections.
    orderRankField({ type: "category", hidden: true }),
    defineField({ name: "order", type: "number", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: "titleEn",
      subtitle: "titleFr",
      hidden: "hidden",
      media: "banner",
    },
    prepare: ({ title, subtitle, hidden, media }) => ({
      title: `${title}${hidden ? " — HIDDEN" : ""}`,
      subtitle,
      media,
    }),
  },
});
