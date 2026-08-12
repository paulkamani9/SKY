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
            // Items grouped by section, so editing a group means opening one
            // list rather than filtering 85 items.
            //
            // Every section offers all three routes, because only five of the
            // eleven are grouped at all. Drilling straight into sub-sections
            // dead-ended on the other six — Breakfast & Brunch showed "No
            // documents of this type" and its items were unreachable here.
            S.listItem()
              .title("Items by section")
              .child(
                S.documentTypeList("category")
                  .title("Menu sections")
                  .child((rawId) => {
                    // Selecting an edited section hands back a draft id, which
                    // matches no reference — items point at published ids.
                    const categoryId = rawId.replace(/^drafts\./, "");

                    return S.list()
                      .title("Items")
                      .items([
                        S.listItem()
                          .id("by-subsection")
                          .title("By sub-section")
                          .child(
                            S.documentList()
                              .title("Sub-sections")
                              .filter(
                                '_type == "subcategory" && category._ref == $categoryId',
                              )
                              .params({ categoryId })
                              .defaultOrdering([
                                { field: "order", direction: "asc" },
                              ])
                              .child((rawSubId) =>
                                S.documentList()
                                  .title("Items")
                                  .filter(
                                    '_type == "dish" && subcategory._ref == $subcategoryId',
                                  )
                                  .params({
                                    subcategoryId: rawSubId.replace(
                                      /^drafts\./,
                                      "",
                                    ),
                                  })
                                  .defaultOrdering([
                                    { field: "order", direction: "asc" },
                                  ]),
                              ),
                          ),
                        S.listItem()
                          .id("ungrouped")
                          .title("Items without a sub-section")
                          .child(
                            S.documentList()
                              .title("Ungrouped items")
                              .filter(
                                '_type == "dish" && category._ref == $categoryId && !defined(subcategory)',
                              )
                              .params({ categoryId })
                              .defaultOrdering([
                                { field: "order", direction: "asc" },
                              ]),
                          ),
                        S.divider(),
                        S.listItem()
                          .id("all-in-section")
                          .title("All items in this section")
                          .child(
                            S.documentList()
                              .title("Items")
                              .filter(
                                '_type == "dish" && category._ref == $categoryId',
                              )
                              .params({ categoryId })
                              .defaultOrdering([
                                { field: "order", direction: "asc" },
                              ]),
                          ),
                      ]);
                  }),
              ),
            S.documentTypeListItem("dish").title("All items"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
