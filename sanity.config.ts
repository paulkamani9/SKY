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
            S.documentTypeListItem("subcategory").title("Sub-sections"),
            S.divider(),
            // Items grouped by section, then by sub-section, so editing a
            // group means opening one list rather than filtering 85 items.
            S.listItem()
              .title("Items by section")
              .child(
                S.documentTypeList("category")
                  .title("Menu sections")
                  .child((categoryId) =>
                    S.documentList()
                      .title("Sub-sections")
                      .filter(
                        '_type == "subcategory" && category._ref == $categoryId',
                      )
                      .params({ categoryId })
                      .defaultOrdering([{ field: "order", direction: "asc" }])
                      .child((subcategoryId) =>
                        S.documentList()
                          .title("Items")
                          .filter(
                            '_type == "dish" && subcategory._ref == $subcategoryId',
                          )
                          .params({ subcategoryId })
                          .defaultOrdering([
                            { field: "order", direction: "asc" },
                          ]),
                      ),
                  ),
              ),
            S.documentTypeListItem("dish").title("All items"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
