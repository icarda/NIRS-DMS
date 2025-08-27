import { z } from "zod";

export const ProductTypeFilterSchema = z.object({
  crop: z.string().optional().describe("Filter product types by crop name"),
});
