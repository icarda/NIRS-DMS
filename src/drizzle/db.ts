import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/data/env/server";
import * as schema from "./schema";

const globalForDrizzle = global as unknown as {
  drizzle: ReturnType<typeof drizzle<typeof schema>>;
};

const sql = postgres(env.DATABASE_URL);
export const db =
  globalForDrizzle.drizzle || drizzle(sql, { schema, logger: true });

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.drizzle = db;
}
