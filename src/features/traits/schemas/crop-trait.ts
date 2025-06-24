import { z } from "zod";

export const cropTraitSchema = z.object({
  traitVariable: z.string().min(1, {
    message: "Trait variable is required",
  }),
  traitName: z.string().min(1, {
    message: "Trait name is required",
  }),
  entity: z.string().min(1, {
    message: "Entity is required",
  }),
  methodDescription: z.string().min(1, {
    message: "Method description is required",
  }),
  unit: z.string().min(1, {
    message: "Unit is required",
  }),
  minimumAllowed: z.number().nullable().optional(),
  maximumAllowed: z.number().nullable().optional(),
});

export type CropTraitSchema = z.infer<typeof cropTraitSchema>;
