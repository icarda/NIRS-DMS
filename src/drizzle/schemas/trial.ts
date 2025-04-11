import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
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
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  additionalMetadata: jsonb("additional_metadata").default({}),

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
  type: text("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  createdAt,
  updatedAt,
});

export const TrialSpeciesTable = pgTable(
  "trial_species",
  {
    trialId: integer("trial_id")
      .notNull()
      .references(() => TrialTable.id, { onDelete: "cascade" }),
    speciesId: integer("species_id")
      .notNull()
      .references(() => SpeciesTable.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [{ pk: primaryKey({ columns: [table.trialId, table.speciesId] }) }]
);

export const trialRelations = relations(TrialTable, ({ one, many }) => ({
  crop: one(CropTable, {
    fields: [TrialTable.cropId],
    references: [CropTable.id],
  }),
  fertilizers: many(TrialFertilizerTable),
  trialSpecies: many(TrialSpeciesTable),
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

export const trialSpeciesRelations = relations(
  TrialSpeciesTable,
  ({ one }) => ({
    trial: one(TrialTable, {
      fields: [TrialSpeciesTable.trialId],
      references: [TrialTable.id],
    }),
    species: one(SpeciesTable, {
      fields: [TrialSpeciesTable.speciesId],
      references: [SpeciesTable.id],
    }),
  })
);
