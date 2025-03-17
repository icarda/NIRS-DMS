import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CropTable } from "./crop";
import { SpeciesTable, StudyTable } from "./study";

export const TrialTable = pgTable("trial", {
  id,
  name: text("name").notNull(),
  plantingDate: date("planting_date").notNull(),
  soilType: text("soil_type").notNull(),
  irrigation: boolean("irrigation").notNull(),
  location: text("location").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  additionalMetadata: jsonb("additional_metadata").default({}),
  speciesId: integer("species_id")
    .notNull()
    .references(() => SpeciesTable.id, { onDelete: "cascade" }),
  cropId: integer("crop_id")
    .notNull()
    .references(() => CropTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
});

export const TrialFertilizerTable = pgTable("trial_fertilizer", {
  id,
  trialId: integer("trial_id")
    .notNull()
    .references(() => TrialTable.id, { onDelete: "cascade" }),
  fertilizerType: text("fertilizer_type").notNull(),
  fertilizerAmount: doublePrecision("fertilizer_amount").notNull(),
  createdAt,
  updatedAt,
});

export const trialRelations = relations(TrialTable, ({ one, many }) => ({
  crop: one(CropTable, {
    fields: [TrialTable.cropId],
    references: [CropTable.id],
  }),
  species: one(SpeciesTable, {
    fields: [TrialTable.speciesId],
    references: [SpeciesTable.id],
  }),
  fertilizers: many(TrialFertilizerTable),
  studies: many(StudyTable),
}));

export const trialFertilizerRelations = relations(
  TrialFertilizerTable,
  ({ one }) => ({
    trial: one(TrialTable, {
      fields: [TrialFertilizerTable.trialId],
      references: [TrialTable.id],
    }),
  })
);
