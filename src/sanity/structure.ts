import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { ConfigContext } from "sanity";
import type { ItemChild, StructureBuilder } from "sanity/structure";

export const SETTINGS_ID = "settings";
export const FRUIT_SELECTION_ID = "fruit-selection";

/**
 * The Studio menu, arranged by how often the owner does the job rather than by
 * document type.
 *
 *   Today               what changes this week: sold out, and the fruit
 *   Sections & items    the everyday door — a section, then its items
 *   Search all items    one flat list when you know the name
 *   Setup               the things set once: settings, sections, groups
 *
 * The previous version offered four routes to the same 85 items and three more
 * once you picked a section. Every list below leads somewhere different.
 */
export const structure = (S: StructureBuilder, context: ConfigContext) =>
  S.list()
    .title("Menu")
    .items([
      S.listItem()
        .title("Today")
        .id("today")
        .child(
          S.list()
            .title("Today")
            .items([
              S.listItem()
                .title("Sold out right now")
                .id("sold-out")
                .child(
                  S.documentList()
                    .title("Sold out right now")
                    .schemaType("dish")
                    .filter('_type == "dish" && available == false')
                    // An empty list is the answer here, not a dead end: it
                    // means everything on the menu is on.
                    .defaultOrdering([{ field: "nameEn", direction: "asc" }]),
                ),
              S.listItem()
                .title("Today's fruit selection")
                .id(FRUIT_SELECTION_ID)
                .child(
                  S.document()
                    .schemaType("fruitSelection")
                    .documentId(FRUIT_SELECTION_ID)
                    .title("Today's fruit selection"),
                ),
            ]),
        ),

      S.divider(),

      // Sections in menu order; each one opens its own items, in menu order,
      // draggable. What this list looks like is what the guest sees.
      S.listItem()
        .title("Sections & items")
        .id("sections-and-items")
        .child(
          S.documentTypeList("category")
            .title("Sections & items")
            .defaultOrdering([{ field: "orderRank", direction: "asc" }])
            .child((rawId) => {
              // A section being edited hands back a draft id, which matches no
              // reference — items point at published ids.
              const categoryId = rawId.replace(/^drafts\./, "");

              return orderableDocumentListDeskItem({
                type: "dish",
                // Unique per section: the plugin keys its list state on this.
                id: `dish-${categoryId}`,
                title: "Items",
                filter: "category._ref == $categoryId",
                params: { categoryId },
                // The plugin's own create button files the new item under no
                // section, leaving the owner to find this one in a list of
                // eleven. These two do the obvious thing instead.
                createIntent: false,
                menuItems: [
                  S.menuItem()
                    .title("New item in this section")
                    .intent({
                      type: "create",
                      params: [
                        { type: "dish", template: "dish-in-section" },
                        { categoryId },
                      ],
                    })
                    .serialize(),
                  S.menuItem()
                    .title("Edit this section")
                    .intent({
                      type: "edit",
                      params: { type: "category", id: categoryId },
                    })
                    .serialize(),
                ],
                S,
                context,
                // The helper builds a list *item*; what belongs here is the
                // pane it points at. It always sets a concrete pane, never a
                // resolver — which the wider ListItemChild type cannot say.
              }).child as ItemChild;
            }),
        ),

      S.listItem()
        .title("Search all items")
        .id("all-items")
        .child(
          S.documentTypeList("dish")
            .title("All items")
            .defaultOrdering([{ field: "nameEn", direction: "asc" }]),
        ),

      S.divider(),

      S.listItem()
        .title("Setup")
        .id("setup")
        .child(
          S.list()
            .title("Setup")
            .items([
              S.listItem()
                .title("Restaurant settings")
                .id(SETTINGS_ID)
                .child(
                  S.document()
                    .schemaType("settings")
                    .documentId(SETTINGS_ID)
                    .title("Restaurant settings"),
                ),
              // Titles, intros, banners, layout — and the order the sections
              // run in, by dragging.
              orderableDocumentListDeskItem({
                type: "category",
                id: "categories",
                title: "Menu sections",
                S,
                context,
              }),
              S.documentTypeListItem("subcategory").title(
                "Groups inside sections",
              ),
            ]),
        ),
    ]);
