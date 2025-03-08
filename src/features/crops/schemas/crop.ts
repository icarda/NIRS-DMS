import { z } from "zod";

export const cropCommonNameSchema = z.object({
  commonName: z.string().min(1, "Common name is required"),
});

export const cropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cropImageUrl: z.string().url(),
  description: z.string().optional(),
  commonNames: z.array(cropCommonNameSchema),
});

export type CropSchema = z.infer<typeof cropSchema>;
