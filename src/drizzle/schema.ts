import { count } from "console";

import {
  boolean,
  date,
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const centers = pgTable("center", {
  centerId: serial("center_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  acronym: varchar("acronym", { length: 50 }).notNull().unique(),
});

export const qualityLabs = pgTable("quality_lab", {
  qualityLabId: serial("quality_lab_id").primaryKey(),
  centerId: integer("center_id")
    .notNull()
    .references(() => centers.centerId, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull().unique(),
  location: varchar("location", { length: 255 }),
  country: varchar("country", { length: 100 }),
});

export const crops = pgTable("crop", {
  cropId: serial("crop_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  cropImageUrl: varchar("crop_image_url", { length: 255 }),
  description: text("description"),
});

export const cropCommonNames = pgTable("crop_common_name", {
  commonNameId: serial("common_name_id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
  commonName: varchar("common_name", { length: 100 }).notNull().unique(),
});

export const species = pgTable("species", {
  speciesId: serial("species_id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const productTypes = pgTable("product_type", {
  productTypeId: serial("product_type_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
});

export const physiologicalStages = pgTable("physiological_stage", {
  stageId: serial("stage_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
});

export const nirModels = pgTable("nir_model", {
  nirModelId: serial("nir_model_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }),
  wavelengthRange: varchar("wavelength_range", { length: 50 }),
  resolution: varchar("resolution", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
});

export const trials = pgTable("trial", {
  trialId: serial("trial_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  plantingDate: date("planting_date"),
  soilType: varchar("soil_type", { length: 100 }),
  irrigation: boolean("irrigation"),
  location: varchar("location", { length: 100 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  additionalMetadata: jsonb("additional_metadata").default({}),
  speciesId: integer("species_id")
    .notNull()
    .references(() => species.speciesId, { onDelete: "cascade" }),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
});

export const trialFertilizers = pgTable("trial_fertilizer", {
  trialFertilizerId: serial("trial_fertilizer_id").primaryKey(),
  trialId: integer("trial_id")
    .notNull()
    .references(() => trials.trialId, { onDelete: "cascade" }),
  fertilizerType: varchar("fertilizer_type", { length: 100 }).notNull(),
  fertilizerAmount: doublePrecision("fertilizer_amount"),
});

export const studies = pgTable(
  "study",
  {
    studyId: serial("study_id").primaryKey(),
    trialId: integer("trial_id")
      .notNull()
      .references(() => trials.trialId, { onDelete: "cascade" }),
    studyCode: varchar("study_code", { length: 100 }).notNull(),
    productTypeId: integer("product_type_id")
      .notNull()
      .references(() => productTypes.productTypeId, { onDelete: "cascade" }),
    nirModelId: integer("nir_model_id")
      .notNull()
      .references(() => nirModels.nirModelId, { onDelete: "cascade" }),
    requesterName: varchar("requester_name", { length: 100 }),
    requesterEmail: varchar("requester_email", { length: 100 }),
    sampleDate: date("sample_date"),
    physiologicalStageId: integer("physiological_stage_id")
      .notNull()
      .references(() => physiologicalStages.stageId, { onDelete: "cascade" }),
    additionalMetadata: jsonb("additional_metadata").default({}),
    qualityLabId: integer("quality_lab_id")
      .notNull()
      .references(() => qualityLabs.qualityLabId, { onDelete: "cascade" }),
  },
  (table) => [
    {
      studyCodeUnique: uniqueIndex("study_code_unique").on(table.studyCode),
      studyLabUnique: uniqueIndex("study_lab_unique").on(
        table.qualityLabId,
        table.studyCode
      ),
    },
  ]
);

export const cropTraits = pgTable("crop_trait", {
  cropTraitId: serial("crop_trait_id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.cropId, { onDelete: "cascade" }),
  traitName: varchar("trait_name", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }),
  methodDescription: text("method_description"),
  unit: varchar("unit", { length: 20 }),
  minimumAllowed: doublePrecision("minimum_allowed"),
  maximumAllowed: doublePrecision("maximum_allowed"),
});

export const trait = pgTable(
  "trait",
  {
    traitId: serial("trait_id").primaryKey(),
    measuredValue: doublePrecision("measured_value"),
    predictedValue: doublePrecision("predicted_value"),
    year: integer("year").notNull(),
    unit: varchar("unit", { length: 20 }),
    studyId: integer("study_id")
      .notNull()
      .references(() => studies.studyId, { onDelete: "cascade" }),
    cropTraitId: integer("crop_trait_id")
      .notNull()
      .references(() => cropTraits.cropTraitId, { onDelete: "cascade" }),
    sampleId: integer("sample_id").notNull(),
  },
  (table) => [
    {
      sampleStudyUnique: uniqueIndex("trait_sample_study_unique").on(
        table.studyId,
        table.sampleId
      ),
    },
  ]
);

export const nirsData = pgTable(
  "nirs_data",
  {
    nirsDataId: serial("nirs_data_id").primaryKey(),
    studyId: integer("study_id")
      .notNull()
      .references(() => studies.studyId, { onDelete: "cascade" }),
    sampleId: integer("sample_id").notNull(),
    gid: integer("gid").notNull(),
    plotId: integer("plot_id").notNull(),
    wavelength: integer("wavelength").notNull(),
    value: doublePrecision("value").notNull(),
  },
  (table) => [
    {
      sampleStudyFk: foreignKey({
        columns: [table.sampleId, table.studyId],
        foreignColumns: [trait.sampleId, trait.studyId],
      }),
    },
  ]
);

export const roles = pgEnum("role", ["USER", "ADMIN", "SUPERADMIN"]);

export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  role: roles().notNull().default("USER"),
  location: varchar("location", { length: 100 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  centerId: integer("center_id")
    .notNull()
    .references(() => centers.centerId),
  position: varchar("position", { length: 100 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
});

export const accounts = pgTable(
  "account",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);
