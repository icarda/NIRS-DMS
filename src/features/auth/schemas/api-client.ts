import { z } from "zod";

export const apiClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  type: z.enum(["public", "confidential"], {
    errorMap: () => ({ message: "Client type is required" }),
  }),
  scopes: z.string(),
  description: z.string().optional(),
});

export type ApiClientSchema = z.infer<typeof apiClientSchema>;
