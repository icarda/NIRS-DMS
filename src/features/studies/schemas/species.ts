import { z } from "zod";

export const speciesSchema = z.object({
  name: z.string().min(1, "Species name is required"),
});
