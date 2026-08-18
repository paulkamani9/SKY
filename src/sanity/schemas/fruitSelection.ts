import { defineField, defineType } from "sanity";

import { TRANSLATION_GROUP, translated } from "./translations";

/**
 * The fruits on the display table today.
 *
 * A single document rather than a field on each section: the list turns with
 * the season, it is the same fruit whichever section a guest reads it under,
 * and two copies of it would eventually disagree. Sections opt in with "Show
 * today's fruit list" — today, Fruit Bowls and Smoothies.
 */
export const fruitSelection = defineType({
  name: "fruitSelection",
  title: "Today's fruit selection",
  type: "document",
  // Singleton: only one of these should ever exist.
  groups: [
    { name: "list", title: "Fruit list", default: true },
    TRANSLATION_GROUP,
  ],
  fields: [
    defineField({
      name: "fruitsEn",
      title: "Fruit list (English)",
      type: "text",
      rows: 3,
      group: "list",
      description:
        'Fruits separated by commas, e.g. "Papaya, Mango, Red Dragon Fruit". Guests see them as a row of chips under the sections that build a bowl or a blend, so they know what there is to choose from. Change it whenever the season does — this is the only place the menu names the fruit.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fruitsFr",
      title: "Fruit list (French)",
      type: "text",
      rows: 3,
      group: "list",
      description:
        "Leave empty and the English list is shown instead — useful when the season turns and there is no time to translate.",
    }),
    ...translated("fruits", "Fruit list", { type: "text", rows: 3 }),
  ],
  preview: {
    select: { fruits: "fruitsEn" },
    prepare: ({ fruits }) => ({
      title: "Today's fruit selection",
      subtitle: fruits || "No fruit listed yet",
    }),
  },
});
