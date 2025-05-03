import { z } from "zod";

export const cropCommonNameSchema = z.array(
  z.object({
    commonName: z.string().min(1, "Common name is required"),
  })
);

export const cropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cropImageUrl: z.string(),
  description: z.string().optional(),
  commonNames: cropCommonNameSchema,
});

export type CropSchema = z.infer<typeof cropSchema>;
