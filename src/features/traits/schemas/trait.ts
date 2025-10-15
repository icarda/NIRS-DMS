import { z } from "zod";

export const traitSchema = z.object({
  traitName: z.string().min(1, "Trait name is required"),
  measuredValue: z.number(),
  predictedValue: z.number().nullable(),
  year: z.number().int().min(1900, "Invalid year"),
  studyId: z.number().min(1, "Study is required"),
  cropTraitId: z.number().min(1, "Crop is required"),
  sampleId: z.string().min(1, "Sample ID is required"),
});

export type TraitSchema = z.infer<typeof traitSchema>;
