import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { dish } from "./dish";
import { settings } from "./settings";
import { subcategory } from "./subcategory";

export const schemaTypes: SchemaTypeDefinition[] = [
  settings,
  category,
  subcategory,
  dish,
];
