import { z } from "zod";

export const QualityLabsFilterSchema = z.object({
  country: z.string().optional().describe("Country where the lab is located"),
  center: z.string().optional().describe("Center to which the lab belongs"),
});

export const QualityLabsResponseSchema = z.array(
  z.object({
    name: z.string().describe("Name of the quality lab"),
    country: z.string().describe("Country where the lab is located"),
    center: z.string().describe("Center to which the lab belongs"),
  })
);
