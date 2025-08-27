import { z } from "zod";

export const NirModelFilterSchema = z.object({
  manufacturer: z.string().optional().describe("Manufacturer of the NIR model"),
  type: z.string().optional().describe("Type of the NIR model"),
  name: z.string().optional().describe("Name of the NIR model"),
});
