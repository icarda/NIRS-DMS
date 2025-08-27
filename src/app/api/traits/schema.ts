import { z } from "zod";

/**
 * Query filters for Trait data
 */
export const TraitFilterSchema = z.object({
  crop: z.string().optional().describe("Crop name"),
  qualityLab: z.string().optional().describe("Quality lab name"),
  nirModel: z.string().optional().describe("NIR model name"),
  species: z.string().optional().describe("Species name"),
  plantingYear: z
    .string()
    .regex(/^\d{4}$/)
    .optional()
    .describe("Planting year (YYYY)"),
  startDate: z
    .string()
    .date()
    .optional()
    .describe("Sample Date: Start date (YYYY-MM-DD)"),
  endDate: z
    .string()
    .date()
    .optional()
    .describe("Sample Date: End date (YYYY-MM-DD)"),
  physiologicalStage: z
    .string()
    .optional()
    .describe("Physiological stage name"),
  productType: z.string().optional().describe("Product type name"),
  traitName: z
    .string()
    .min(1)
    .describe("Trait name(s), required. Supports comma-separated values"),
});

/**
 * A single trait measurement for a sample
 */
export const TraitDataPointSchema = z.object({
  traitName: z.string().describe("Name of the trait"),
  measuredValue: z
    .number()
    .nullable()
    .describe("Measured value from wet chemistry"),
  predictedValue: z
    .number()
    .nullable()
    .describe("Predicted value (if available)"),
  year: z.number().describe("Year of measurement"),
});

/**
 * A sample entry with all traits
 */
export const TraitSampleSchema = z.object({
  sampleId: z.number().describe("Unique sample ID"),
  crop: z.string().nullable().describe("Crop name"),
  qualityLab: z.string().nullable().describe("Quality lab name"),
  nirModel: z.string().nullable().describe("NIR model used"),
  species: z.string().nullable().describe("Species name"),
  plantingDate: z.string().nullable().describe("Planting date (YYYY-MM-DD)"),
  physiologicalStage: z.string().nullable().describe("Physiological stage"),
  productType: z.string().nullable().describe("Product type"),
  traits: z
    .array(TraitDataPointSchema)
    .describe("List of traits for this sample"),
});

/**
 * API response schema: array of samples
 */
export const TraitResponseSchema = z.array(TraitSampleSchema);
