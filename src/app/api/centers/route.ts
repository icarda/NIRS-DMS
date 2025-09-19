import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CenterTable } from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth/require-auth";
import { CenterResponseSchema } from "./schema";

/**
 * Get Centers
 * @description Returns all centers with id, name, acronym, and country.
 * @response CenterResponseSchema
 * @security BearerAuth
 * @openapi
 */
export async function GET(req: Request) {
  const { error } = await requireAuth(req, ["read:data"]);
  if (error) return error;

  const rows = await db
    .select({
      id: CenterTable.id,
      name: CenterTable.name,
      acronym: CenterTable.acronym,
    })
    .from(CenterTable);

  return NextResponse.json(rows);
}
