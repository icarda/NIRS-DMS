import { z } from "zod";

export const cropCommonNameSchema = z.object({
  commonName: z.string().min(1, "Common name is required"),
});

export const cropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cropImageUrl: z.string().nullable().optional(),
  description: z.string().optional(),
});

export type CropSchema = z.infer<typeof cropSchema>;
export type CropCommonNameSchema = z.infer<typeof cropCommonNameSchema>;
