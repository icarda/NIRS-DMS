import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_TRUST_HOST: z.string().default("false"),
    AUTH_SECRET: z.string(),
    GOOGLE_API_KEY: z.string(),
    GOOGLE_EMAIL: z.string().email(),
    GOOGLE_APP_PASSWORD: z.string(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
