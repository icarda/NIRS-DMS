import { z } from "zod";

/**
 * Query filters for NIRS data
 */
export const NirsFilterSchema = z.object({
  crop: z.string().optional().describe("Crop name"),
  qualityLab: z.string().optional().describe("Quality lab name"),
  nirModel: z.string().optional().describe("NIR model name"),
  species: z.string().optional().describe("Species name"),
  plantingYear: z
    .string()
    .regex(/^\d{4}$/)
    .optional()
    .describe("Planting year (YYYY)"),
  sampleDate: z
    .string()
    .date()
    .optional()
    .describe("Sample collection date (YYYY-MM-DD)"),
  physiologicalStage: z
    .string()
    .optional()
    .describe("Physiological stage name"),
  productType: z.string().optional().describe("Product type name"),
});

/**
 * Shape of a single spectral point
 */
export const NirsDataPointSchema = z.object({
  wavelength: z.number().describe("Wavelength (nm)"),
  value: z.number().describe("Measured absorbance/intensity"),
});

/**
 * Shape of one sample entry
 */
export const NirsSampleSchema = z.object({
  sampleId: z.number().describe("Unique sample ID"),
  nirsData: z
    .array(NirsDataPointSchema)
    .describe("Spectral values for this sample"),
  crop: z.string().nullable().describe("Crop name"),
  qualityLab: z.string().nullable().describe("Quality lab name"),
  nirModel: z.string().nullable().describe("NIR model used"),
  species: z.string().nullable().describe("Species name"),
  plantingDate: z.string().nullable().describe("Planting date (YYYY-MM-DD)"),
  physiologicalStage: z.string().nullable().describe("Physiological stage"),
  productType: z.string().nullable().describe("Product type"),
});

/**
 * API response schema (array of samples)
 */
export const NirsResponseSchema = z.array(NirsSampleSchema);
