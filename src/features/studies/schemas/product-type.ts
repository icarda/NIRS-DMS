import { z } from "zod";

export const productTypeSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  cropId: z.number().min(1, "Crop is required"),
});
