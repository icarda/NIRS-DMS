import {
  boolean,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import { id } from "../schemaHelpers";

const types = ["string", "number", "date", "boolean", "array"] as const;
export const studyMetadataTypes = pgEnum("type", types);
export type StudyMetadataType = (typeof types)[number];

export const StudyMetadataConfig = pgTable("study_metadata_config", {
  id,
  label: text("label").notNull(),
  name: text("name").notNull().unique(),
  type: studyMetadataTypes().notNull().default("string"),
  defaultValue: text("default_value").notNull(),
  required: boolean("required").notNull().default(false),
  min: text("min"),
  max: text("max"),
  source: text("source").notNull().$type<"sql" | "json">(),
});
