import { z } from "zod";

export const nirModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string(),
  wavelengthRange: z.string(),
  resolution: z.string(),
  manufacturer: z.string(),
});

export type NirModelSchema = z.infer<typeof nirModelSchema>;
