import { z } from "zod";

export const cropTraitSchema = z.object({
  traitName: z.string().min(1, "Trait name is required"),
  traitVariable: z.string().min(1, "Trait variable is required"),
  entity: z.string(),
  methodDescription: z.string(),
  minimumAllowed: z.number().int().optional(),
  maximumAllowed: z.number().int().optional(),
  unit: z.string(),
  cropId: z.number().min(1, "Crop is required"),
});

export type CropTraitSchema = z.infer<typeof cropTraitSchema>;
