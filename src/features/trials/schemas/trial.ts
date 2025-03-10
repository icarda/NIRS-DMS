import { z } from "zod";

export const trialFertilizerSchema = z.object({
  fertilizerType: z.string().min(1, "Fertilizer type is required"),
  fertilizerAmount: z.number(),
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
