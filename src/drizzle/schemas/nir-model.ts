import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StudyTable } from "./study";

export const NirModelTable = pgTable("nir_model", {
  id,
  name: text("name").notNull().unique(),
  type: text("type"),
  wavelengthRange: text("wavelength_range"),
  resolution: text("resolution"),
  manufacturer: text("manufacturer"),
  createdAt,
  updatedAt,
});

export const nirModelRelations = relations(NirModelTable, ({ many }) => ({
  studies: many(StudyTable),
}));
