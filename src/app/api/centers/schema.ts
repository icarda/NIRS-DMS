import { z } from "zod";

export const CenterSchema = z.object({
  id: z.number(),
  name: z.string(),
  acronym: z.string(),
});

export const CenterResponseSchema = z.array(CenterSchema);
