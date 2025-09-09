import { z } from "zod";

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
});

export const TokenRequestSchema = z.object({
  grant_type: z.enum(["client_credentials", "refresh_token"]),
  client_id: z.string().min(1, "client_id is required"),
  client_secret: z.string().optional(),
  refresh_token: z.string().optional(),
});
