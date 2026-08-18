"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig, defineType } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemas";
import { soldOutActions } from "@/sanity/soldOut";
import { FRUIT_SELECTION_ID, SETTINGS_ID, structure } from "@/sanity/structure";

const SINGLETONS = [SETTINGS_ID, "fruitSelection"];

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      // Singletons are opened from the structure, never created from "+".
      ...prev.filter((t) => !SINGLETONS.includes(t.schemaType)),
      // Creating an item from inside a section files it under that section, so
      // nobody has to pick it back out of a list of eleven.
      {
        id: "dish-in-section",
        title: "Item in this section",
        schemaType: "dish",
        parameters: [
          defineType({ name: "categoryId", title: "Section", type: "string" }),
        ],
        value: ({ categoryId }: { categoryId: string }) => ({
          category: { _type: "reference", _ref: categoryId },
        }),
      },
    ],
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "settings" || context.schemaType === "fruitSelection") {
        return prev.filter(({ action }) =>
          ["publish", "discardChanges", "restore"].includes(action ?? ""),
        );
      }
      return context.schemaType === "dish" ? soldOutActions(prev) : prev;
    },
  },
  tools: (prev, { currentUser }) =>
    currentUser?.roles.some((r) => r.name === "administrator")
      ? prev
      : prev.filter((tool) => tool.name !== "vision"),
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});

// The fruit selection document is created by the structure the first time it is
// opened, exactly like Restaurant settings — see src/sanity/structure.ts.
export { FRUIT_SELECTION_ID };
