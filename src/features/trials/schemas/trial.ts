import { z } from "zod";

export const trialFertilizerSchema = z.object({
  type: z.string().min(1, "Fertilizer type is required"),
  amount: z.number().min(0, "Amount must be greater than 0"),
});

export const trialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  plantingDate: z.string().date(),
  soilType: z.string(),
  irrigation: z.boolean(),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  additionalMetadata: z.record(z.any()).optional(),
  speciesId: z.number().min(1, "Species is required"),
  cropId: z.number().min(1, "Crop is required"),
  fertilizers: z.array(trialFertilizerSchema),
});

export type TrialSchema = z.infer<typeof trialSchema>;

export const metadataConfigSchema = z.object({
  // id: z.number(),
  label: z.string().min(1, "Label is required"),
  name: z.string().min(1, "Name is required"),
  type: z
    .enum(["string", "number", "date", "boolean", "array"])
    .default("string"),
  defaultValue: z.string().default(""),
  required: z.boolean().default(false),
  min: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === null ? undefined : String(val)
    ),
  max: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === null ? undefined : String(val)
    ),
  source: z.enum(["sql", "json"]).default("json"),
});
export type MetadataConfigSchema = z.infer<typeof metadataConfigSchema>;
