import { z } from "zod";

export const PhysiologicalStageFilterSchema = z.object({
  crop: z.string().optional().describe("Filter stages by crop name"),
});
