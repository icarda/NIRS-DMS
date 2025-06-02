import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CropTable } from "./crop";
import { StudyTable } from "./study";

export const TraitTable = pgTable(
  "trait",
  {
    id,
    traitName: text("trait_name").notNull(),
    measuredValue: doublePrecision("measured_value").notNull(),
    predictedValue: doublePrecision("predicted_value"),
    year: integer("year").notNull(),
    studyId: integer("study_id")
      .notNull()
      .references(() => StudyTable.id, { onDelete: "cascade" }),
    cropTraitId: integer("crop_trait_id")
      .notNull()
      .references(() => CropTraitTable.id, { onDelete: "cascade" }),
    sampleId: integer("sample_id").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    {
      sampleStudyUnique: uniqueIndex("trait_sample_study_unique").on(
        table.studyId,
        table.sampleId
      ),
    },
    uniqueIndex("trait_sample_unique").on(table.cropTraitId, table.sampleId),
  ]
);

export const CropTraitTable = pgTable(
  "crop_trait",
  {
    id,
    cropId: integer("crop_id")
      .notNull()
      .references(() => CropTable.id, { onDelete: "cascade" }),
    traitName: text("trait_name").notNull(),
    traitVariable: text("trait_variable").notNull(),
    entity: text("entity").notNull(),
    methodDescription: text("method_description").notNull(),
    unit: text("unit").notNull(),
    minimumAllowed: integer("minimum_allowed"),
    maximumAllowed: integer("maximum_allowed"),
    createdAt,
    updatedAt,
  },
  (table) => [
    {
      cropTraitUnique: uniqueIndex("crop_trait_unique").on(
        table.cropId,
        table.traitVariable
      ),
    },
  ]
);

export const traitRelations = relations(TraitTable, ({ one }) => ({
  study: one(StudyTable, {
    fields: [TraitTable.studyId],
    references: [StudyTable.id],
  }),
  cropTrait: one(CropTraitTable, {
    fields: [TraitTable.cropTraitId],
    references: [CropTraitTable.id],
  }),
}));

export const cropTraitRelations = relations(CropTraitTable, ({ one }) => ({
  crop: one(CropTable, {
    fields: [CropTraitTable.cropId],
    references: [CropTable.id],
  }),
  trait: one(TraitTable, {
    fields: [CropTraitTable.id],
    references: [TraitTable.cropTraitId],
  }),
}));
