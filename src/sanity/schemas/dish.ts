import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

import { TRANSLATION_GROUP, translated } from "./translations";

export const dish = defineType({
  name: "dish",
  title: "Menu item",
  type: "document",
  /*
   * Three tabs, in the order the work happens: what the guest reads and pays,
   * then the other languages, then where it sits in the menu — which is set
   * once when the item is created and rarely touched again.
   */
  groups: [
    { name: "item", title: "Item", default: true },
    TRANSLATION_GROUP,
    { name: "placement", title: "Where it sits" },
  ],
  fields: [
    defineField({
      name: "nameEn",
      title: "Name (English)",
      type: "string",
      group: "item",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "nameFr",
      title: "Name (French)",
      type: "string",
      group: "item",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "descriptionEn",
      title: "Description (English)",
      type: "text",
      rows: 3,
      group: "item",
      description:
        "The line a guest reads on the back of the tile, or under the name in a list section.",
    }),
    defineField({
      name: "descriptionFr",
      title: "Description (French)",
      type: "text",
      rows: 3,
      group: "item",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      group: "item",
      description:
        'Numbers only — "Rs" comes from Restaurant settings. Leave empty for anything priced on the day, then fill in the price note below.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "priceNoteEn",
      title: "Price note (English)",
      type: "string",
      group: "item",
      description:
        'Shown where the price would go, for items with no fixed price — "Based on selection", "As priced".',
    }),
    defineField({
      name: "priceNoteFr",
      title: "Price note (French)",
      type: "string",
      group: "item",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      group: "item",
      options: { hotspot: true },
      description:
        "A cut-out photo on a transparent background (PNG), roughly square, subject centred with a little air around it, at least 1200px. A photo with a white background will show as a white box on the page — see docs/photo-briefs.md. Optional: without one the item shows as text on a SKY plate.",
    }),
    defineField({
      name: "available",
      title: "Available today",
      type: "boolean",
      group: "item",
      description:
        "Turn off when it runs out and the item disappears from the menu. It stays here — turn it back on to bring it back.",
      initialValue: true,
    }),

    defineField({
      name: "showImageInList",
      title: "Show the photo in a compact list",
      type: "boolean",
      group: "placement",
      description:
        "Sections set to \"Compact list\" normally print names and prices only. Turn this on for an item whose photo is worth the space anyway — an affogato among the coffees. Ignored in photo-grid sections, which always show the picture.",
      initialValue: false,
    }),

    ...translated("name", "Name"),
    ...translated("description", "Description", { type: "text" }),
    ...translated("priceNote", "Price note"),

    defineField({
      name: "category",
      title: "Menu section",
      type: "reference",
      to: [{ type: "category" }],
      group: "placement",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Group inside the section",
      type: "reference",
      to: [{ type: "subcategory" }],
      group: "placement",
      description:
        'Optional heading within the section, e.g. "Premium Gelato". Leave empty for items that sit directly under the section title.',
      // Only offer sub-sections belonging to the section already chosen above,
      // so a Coffee item can never be filed under a Gelato group.
      options: {
        filter: ({ document }) => {
          const ref = (
            document as { category?: { _ref?: string } } | undefined
          )?.category?._ref;
          if (!ref) return { filter: "false" };
          return {
            filter: "category._ref == $categoryId",
            params: { categoryId: ref },
          };
        },
      },
    }),
    // Position is dragged in "Sections & items", not typed. The rank field is
    // hidden by the plugin; `order` is what it replaced, kept only so nothing
    // is lost if we ever need to read the old numbers.
    orderRankField({ type: "dish", hidden: true }),
    defineField({ name: "order", type: "number", hidden: true }),
    // Superseded by the sub-section reference. Kept so pre-migration data is
    // never lost, and read at render time only when an item has no reference.
    defineField({ name: "groupEn", title: "Sub-group (legacy)", type: "string", hidden: true }),
    defineField({ name: "groupFr", title: "Sub-group (legacy, FR)", type: "string", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: "nameEn",
      section: "category.titleEn",
      group: "subcategory.titleEn",
      legacyGroup: "groupEn",
      media: "image",
      price: "price",
      priceNote: "priceNoteEn",
      available: "available",
    },
    prepare: ({
      title,
      section,
      group,
      legacyGroup,
      media,
      price,
      priceNote,
      available,
    }) => {
      const path = [section ?? "No section", group ?? legacyGroup]
        .filter(Boolean)
        .join(" › ");
      return {
        title: `${title}${available === false ? " — SOLD OUT" : ""}`,
        subtitle: `${path} · ${price ? `Rs ${price}` : (priceNote ?? "no price")}`,
        media,
      };
    },
  },
});
