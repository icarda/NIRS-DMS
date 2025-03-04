import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import {
  PhysiologicalStageTable,
  ProductTypeTable,
  SpeciesTable,
} from "./study";
import { CropTraitTable } from "./trait";
import { TrialTable } from "./trial";

export const CropTable = pgTable("crop", {
  id,
  name: text("name").notNull().unique(),
  cropImageUrl: text("crop_image_url"),
  description: text("description"),
  createdAt,
  updatedAt,
});

export const CropCommonNameTable = pgTable("crop_common_name", {
  id,
  cropId: integer("crop_id")
    .notNull()
    .references(() => CropTable.id, { onDelete: "cascade" }),
  commonName: text("common_name").notNull().unique(),
  createdAt,
  updatedAt,
});

export const cropRelations = relations(CropTable, ({ many }) => ({
  commonNames: many(CropCommonNameTable),
  species: many(SpeciesTable),
  productTypes: many(ProductTypeTable),
  physiologicalStages: many(PhysiologicalStageTable),
  trials: many(TrialTable),
  cropTraits: many(CropTraitTable),
}));

export const cropCommonNameRelations = relations(
  CropCommonNameTable,
  ({ one }) => ({
    crop: one(CropTable, {
      fields: [CropCommonNameTable.cropId],
      references: [CropTable.id],
    }),
  })
);
