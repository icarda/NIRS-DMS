import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CenterTable } from "@/drizzle/schema";
import { CenterResponseSchema } from "./schema";

/**
 * Get Centers
 * @description Returns all centers with id, name, acronym, and country.
 * @response CenterResponseSchema
 * @openapi
 */
export async function GET() {
  const rows = await db
    .select({
      id: CenterTable.id,
      name: CenterTable.name,
      acronym: CenterTable.acronym,
    })
    .from(CenterTable);

  return NextResponse.json(rows);
}
