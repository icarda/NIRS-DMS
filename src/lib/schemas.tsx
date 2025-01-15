import { z } from "zod";

export const dashboardFilterSchema = z.object({
  crop: z.string().min(1, "Please select a crop"),
  qualityLab: z.string().min(1, "Please select a quality lab"),
  year: z.string().min(1, "Please select a year"),
  country: z.string().min(1, "Please select a country"),
  nirModel: z.string().min(1, "Please select a NIR model"),
});
