import { relations } from "drizzle-orm";
import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CenterTable } from "./center";
import { CropTable } from "./crop";
import { NirModelTable } from "./nir-model";
import { NirsDataTable } from "./nirs-data";
import { QualityLabTable } from "./quality-lab";
import { TraitTable } from "./trait";
import { TrialSpeciesTable, TrialTable } from "./trial";

export const StudyTable = pgTable(
  "study",
  {
    id,
    trialId: integer("trial_id")
      .notNull()
      .references(() => TrialTable.id, { onDelete: "cascade" }),
    studyCode: text("study_code").notNull().unique(),
    productTypeId: integer("product_type_id")
      .notNull()
      .references(() => ProductTypeTable.id, { onDelete: "cascade" }),
    program: text("program").notNull(),
    nirModelId: integer("nir_model_id")
      .notNull()
      .references(() => NirModelTable.id, { onDelete: "cascade" }),
    requesterName: text("requester_name"),
    requesterEmail: text("requester_email"),
    sampleDate: date("sample_date").notNull(),
    physiologicalStageId: integer("physiological_stage_id")
      .notNull()
      .references(() => PhysiologicalStageTable.id, { onDelete: "cascade" }),
    additionalMetadata: jsonb("additional_metadata").default({}),
    qualityLabId: integer("quality_lab_id")
      .notNull()
      .references(() => QualityLabTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    {
      studyCodeUnique: uniqueIndex("study_code_unique").on(table.studyCode),
    },
    uniqueIndex("study_lab_unique").on(table.qualityLabId, table.studyCode),
  ]
);

export const SpeciesTable = pgTable(
  "species",
  {
    id,

    cropId: integer("crop_id")
      .notNull()
      .references(() => CropTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    {
      speciesUnique: uniqueIndex("species_unique").on(table.cropId, table.name),
    },
  ]
);

export const ProductTypeTable = pgTable("product_type", {
  id,
  name: text("name").notNull().unique(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => CropTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
});

export const PhysiologicalStageTable = pgTable("physiological_stage", {
  id,
  name: text("name").notNull().unique(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => CropTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
});

export const studyRelations = relations(StudyTable, ({ one, many }) => ({
  trial: one(TrialTable, {
    fields: [StudyTable.trialId],
    references: [TrialTable.id],
  }),
  productType: one(ProductTypeTable, {
    fields: [StudyTable.productTypeId],
    references: [ProductTypeTable.id],
  }),
  nirModel: one(NirModelTable, {
    fields: [StudyTable.nirModelId],
    references: [NirModelTable.id],
  }),
  physiologicalStage: one(PhysiologicalStageTable, {
    fields: [StudyTable.physiologicalStageId],
    references: [PhysiologicalStageTable.id],
  }),
  qualityLab: one(QualityLabTable, {
    fields: [StudyTable.qualityLabId],
    references: [QualityLabTable.id],
  }),
  traits: many(TraitTable),
  nirsData: many(NirsDataTable),
}));

export const speciesRelations = relations(SpeciesTable, ({ one, many }) => ({
  crop: one(CropTable, {
    fields: [SpeciesTable.cropId],
    references: [CropTable.id],
  }),
  trialSpecies: many(TrialSpeciesTable),
}));

export const productTypeRelations = relations(
  ProductTypeTable,
  ({ one, many }) => ({
    crop: one(CropTable, {
      fields: [ProductTypeTable.cropId],
      references: [CropTable.id],
    }),
    studies: many(StudyTable),
  })
);

export const physiologicalStageRelations = relations(
  PhysiologicalStageTable,
  ({ one, many }) => ({
    crop: one(CropTable, {
      fields: [PhysiologicalStageTable.cropId],
      references: [CropTable.id],
    }),
    studies: many(StudyTable),
  })
);
