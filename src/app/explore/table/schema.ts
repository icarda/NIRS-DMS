import { z } from "zod";

import { QUALITY_LABS } from "./constants";

export const columnSchema = z.object({
  id: z.string(),
  qualityLab: z.enum(QUALITY_LABS),
  germplasmId: z.string(),
  year: z.number(),
  starch: z.number(),
  protein: z.number(),
  hrd: z.number(),
  irrigation: z.boolean(),
  date: z.date(),
});

export type ColumnSchema = z.infer<typeof columnSchema>;
