import { z } from "zod";

export const AuthClientResponseSchema = z.object({
  client_id: z.string(),
  client_secret: z.string().optional(),
});

export const AuthClientRequestSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  description: z.string().optional(),
  type: z.enum(["public", "confidential"], {
    errorMap: () => ({
      message: "Client type must be either 'public' or 'confidential'",
    }),
  }),
  scopes: z.string().optional(),
});
