import { z } from "zod";

export const qualityLabSchema = z.object({
  centerId: z.number().min(1, "Center is required"),
  name: z.string().min(1, "Name is required"),
  location: z.string(),
  country: z.string(),
});

export type QualityLabSchema = z.infer<typeof qualityLabSchema>;
