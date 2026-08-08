"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemas";

const SINGLETON_ID = "settings";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // The singleton is created from the structure below, never from "+ Create".
    templates: (prev) => prev.filter((t) => t.schemaType !== "settings"),
  },
  document: {
    actions: (prev, { schemaType }) =>
      schemaType === "settings"
        ? prev.filter(({ action }) =>
            ["publish", "discardChanges", "restore"].includes(action ?? ""),
          )
        : prev,
  },
  tools: (prev, { currentUser }) =>
    currentUser?.roles.some((r) => r.name === "administrator")
      ? prev
      : prev.filter((tool) => tool.name !== "vision"),
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Menu")
          .items([
            S.listItem()
              .title("Restaurant settings")
              .id(SINGLETON_ID)
              .child(
                S.document()
                  .schemaType("settings")
                  .documentId(SINGLETON_ID)
                  .title("Restaurant settings"),
              ),
            S.divider(),
            S.documentTypeListItem("category").title("Menu sections"),
            S.documentTypeListItem("dish").title("Dishes"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
