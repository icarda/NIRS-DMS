import { defineConfig } from "drizzle-kit";

import { env } from "@/data/env/server";

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
