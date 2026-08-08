import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { dish } from "./dish";
import { settings } from "./settings";

export const schemaTypes: SchemaTypeDefinition[] = [settings, category, dish];
