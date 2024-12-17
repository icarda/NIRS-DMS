import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/data/env/server";
import * as schema from "./schema";

const sql = postgres(env.DATABASE_URL);
export const db = drizzle(sql, { schema, logger: true });
