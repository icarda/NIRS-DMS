import { z } from "zod";

export const qualityLabSchema = z.object({
  centerId: z.number().min(1, "Center is required"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  country: z.string().optional(),
});

export type QualityLabSchema = z.infer<typeof qualityLabSchema>;
