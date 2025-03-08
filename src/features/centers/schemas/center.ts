import { z } from "zod";

export const centerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
});

export type CenterSchema = z.infer<typeof centerSchema>;
