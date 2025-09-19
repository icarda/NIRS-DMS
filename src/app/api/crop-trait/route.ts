import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CropTable, CropTraitTable } from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth/require-auth";
import { CropTraitsFilterSchema, CropTraitsResponseSchema } from "./schema";

function normalize(v: string | null) {
  return v ? v.toLowerCase() : null;
}

/**
 * Get crop traits
 * @description Returns all traits associated with a given crop
 * @params CropTraitsFilterSchema
 * @response CropTraitsResponseSchema
 * @security BearerAuth
 * @openapi
 */
export async function GET(req: Request) {
  const { error } = await requireAuth(req, ["read:data"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const crop = normalize(searchParams.get("crop"));

  if (!crop) {
    return NextResponse.json(
      { error: "Missing required parameter: crop" },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      id: CropTraitTable.id,
      traitName: CropTraitTable.traitName,
      entity: CropTraitTable.entity,
      methodDescription: CropTraitTable.methodDescription,
      unit: CropTraitTable.unit,
      min: CropTraitTable.minimumAllowed,
      max: CropTraitTable.maximumAllowed,
      variable: CropTraitTable.traitVariable,
      crop: CropTable.name,
    })
    .from(CropTraitTable)
    .innerJoin(CropTable, eq(CropTraitTable.cropId, CropTable.id))
    .where(eq(sql`lower(${CropTable.name})`, crop));

  return NextResponse.json(rows);
}
