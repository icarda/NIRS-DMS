import { z } from "zod";

export const SpeciesFilterSchema = z.object({
  crop: z.string().optional().describe("Filter species by crop name"),
});
