import { z } from "zod";

export const wetChemistryColumnSchema = z.object({
  sample_id: z.number().int().positive(),
  crop_name: z.string().min(1),
  trait_name: z.string().min(1),
  measured_value: z.number().nullable(),
  predicted_value: z.number().nullable(),
  trait_unit: z.string().min(1),
  study_code: z.string().min(1),
  species: z.string().min(1),
  sample_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  program: z.string().min(1),
  requester_name: z.string().nullable(),
  requester_email: z.string().email().nullable(),
  germplasm_id: z.number().int().positive(),
  product_type: z.string().min(1),
  trial_name: z.string().min(1),
  trial_planting_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  trial_soil_type: z.string().min(1),
  trial_location: z.string().min(1),
  trial_latitude: z.number().min(-90).max(90),
  trial_longitude: z.number().min(-180).max(180),
  quality_lab_name: z.string().min(1),
});

export const trialColumnSchema = z.object({
  trial_name: z.string().min(1),
  trial_planting_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  trial_soil_type: z.string().min(1),
  trial_location: z.string().min(1),
  trial_latitude: z.number().min(-90).max(90),
  trial_longitude: z.number().min(-180).max(180),
  crop: z.object({
    name: z.string().min(1),
  }),
});

export const studyColumnSchema = z.object({
  study_code: z.string().min(1),
  program: z.string().min(1),
  product_type: z.object({
    name: z.string().min(1),
  }),
  nir_model: z.object({
    name: z.string().min(1),
  }),
  physiological_stage: z.object({
    name: z.string().min(1),
  }),
  quality_lab: z.object({
    name: z.string().min(1),
  }),
  sample_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  requester_name: z.string().min(1).optional(),
  requester_email: z.string().email().optional(),
  additional_metadata: z.record(z.unknown()).optional(),
});

const additionalMetadataSchema = z.record(
  z.union([
    z.number().optional(),
    z.string().optional(),
    z.boolean().optional(),
  ])
);

export const studyEditFormSchema = z.object({
  qualityLab: z.string(),
  nirModel: z.string(),
  physiologicalStage: z.string(),
  program: z.string(),

  additionalMetadata: additionalMetadataSchema,

  requesterName: z.string().optional(),
  requesterEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export const trialEditFormSchema = z.object({
  id: z.number().int().positive(),
  crop: z.string(),
  soilType: z.string(),
  location: z.string(),
  coordinates: z.string(),
  irrigation: z.boolean(),
  additionalMetadata: additionalMetadataSchema,

  fertilizers: z.array(
    z.object({
      type: z.string(),
      amount: z.number(),
    })
  ),
});

export const trialEditSchema = z.object({
  cropId: z.number(),
  soilType: z.string(),
  location: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  irrigation: z.boolean(),
  additionalMetadata: additionalMetadataSchema,

  fertilizers: z.array(
    z.object({
      type: z.string(),
      amount: z.number(),
    })
  ),
});

export type StudyColumnSchema = z.infer<typeof studyColumnSchema> &
  Record<string, any>;

export type TrialColumnSchema = z.infer<typeof trialColumnSchema> &
  Record<string, any>;

export type WetChemistryColumnSchema = z.infer<
  typeof wetChemistryColumnSchema
> &
  Record<string, any>;

export type StudyEditFormSchema = z.infer<typeof studyEditFormSchema>;
