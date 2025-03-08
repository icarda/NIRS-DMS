import { z } from "zod";

export const physiologicalStageSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  cropId: z.number().min(1, "Crop is required"),
});
