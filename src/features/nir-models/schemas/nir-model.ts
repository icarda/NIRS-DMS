import { z } from "zod";

export const nirModelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  type: z.enum(["Benchtop", "Portable"]),
  wavelengthRange: z
    .string()
    .regex(/\d+-\d+/, "Must be a valid range (eg. 400-1000)"),
  resolution: z.string().regex(/^\d*\.?\d+$/, "Must be a valid number"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
});

export type NirModelSchema = z.infer<typeof nirModelSchema>;
