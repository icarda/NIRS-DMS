import { z } from "zod";

// Query params
export const CropTraitsFilterSchema = z.object({
  crop: z.string().min(1, "Crop is required"),
});

// Response
export const CropTraitsResponseSchema = z.array(
  z.object({
    id: z.number(),
    traitName: z.string(),
    entity: z.string(),
    methodDescription: z.string(),
    unit: z.string(),
    min: z.number().nullable(),
    max: z.number().nullable(),
    variable: z.string(),
    crop: z.string(),
  })
);

export type CropTraitsFilter = z.infer<typeof CropTraitsFilterSchema>;
export type CropTraitsResponse = z.infer<typeof CropTraitsResponseSchema>;
