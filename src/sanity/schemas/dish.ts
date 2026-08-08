import { defineField, defineType } from "sanity";

export const dish = defineType({
  name: "dish",
  title: "Item",
  type: "document",
  fields: [
    defineField({
      name: "nameEn",
      title: "Name (English)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "nameFr",
      title: "Name (French)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "descriptionEn",
      title: "Description (English)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "descriptionFr",
      title: "Description (French)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description:
        "Numbers only — the currency symbol comes from settings. Leave empty for items priced on selection, then fill in the note below.",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "priceNoteEn",
      title: "Price note (English)",
      type: "string",
      description:
        'Shown instead of a price, e.g. "Based on selection" or "As priced".',
    }),
    defineField({
      name: "priceNoteFr",
      title: "Price note (French)",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Menu section",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "groupEn",
      title: "Sub-group (English)",
      type: "string",
      description:
        'Optional heading within the section, e.g. "Premium Gelato" or "Iced & Chilled Coffee". Items sharing a sub-group are listed together.',
    }),
    defineField({
      name: "groupFr",
      title: "Sub-group (French)",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Order within section",
      type: "number",
      initialValue: 1,
      validation: (r) => r.required().integer(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "available",
      title: "Available today",
      type: "boolean",
      description:
        "Turn off when it runs out. The item shows as sold out instead of disappearing.",
      initialValue: true,
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
    select: {
      title: "nameEn",
      section: "category.titleEn",
      media: "image",
      price: "price",
      priceNote: "priceNoteEn",
      available: "available",
    },
    prepare: ({ title, section, media, price, priceNote, available }) => ({
      title: `${title}${available === false ? " — SOLD OUT" : ""}`,
      subtitle: `${section ?? "No section"} · ${price ?? priceNote ?? "no price"}`,
      media,
    }),
  },
});
