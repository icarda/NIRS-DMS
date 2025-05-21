import {
  boolean,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import { id } from "../schemaHelpers";

const types = ["string", "number", "date", "boolean", "array"] as const;
export const trialMetadataTypes = pgEnum("type", types);
export type TrialMetadataType = (typeof types)[number];

export const TrialMetadataConfig = pgTable("trial_metadata_config", {
  id,
  label: text("label").notNull(),
  name: text("name").notNull().unique(),
  type: trialMetadataTypes().notNull().default("string"),
  defaultValue: text("default_value").notNull(),
  required: boolean("required").notNull().default(false),
  min: text("min"),
  max: text("max"),
  source: text("source").notNull().$type<"sql" | "json">(),
});
