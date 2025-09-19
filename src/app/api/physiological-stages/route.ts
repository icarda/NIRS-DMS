import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CropTable, PhysiologicalStageTable } from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth/require-auth";
import { PhysiologicalStageFilterSchema } from "./schema";

function normalize(v: string | null | undefined) {
  return v ? v.toLowerCase() : undefined;
}

/**
 * Get Physiological Stages
 * @description Returns physiological stages, optionally filtered by crop name.
 * @params PhysiologicalStageFilterSchema
 * @security BearerAuth
 * @openapi
 */
export async function GET(req: Request) {
  const { error } = await requireAuth(req, ["read:data"]);
  if (error) return error;
  const { searchParams } = new URL(req.url);

  const parsed = PhysiologicalStageFilterSchema.safeParse({
    crop: normalize(searchParams.get("crop") || undefined),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { crop } = parsed.data;

  const conds: any[] = [];
  if (crop) conds.push(eq(sql`lower(${CropTable.name})`, crop));

  const rows = await db
    .select({
      id: PhysiologicalStageTable.id,
      name: PhysiologicalStageTable.name,
      cropId: PhysiologicalStageTable.cropId,
      cropName: CropTable.name,
    })
    .from(PhysiologicalStageTable)
    .innerJoin(CropTable, eq(PhysiologicalStageTable.cropId, CropTable.id))
    .where(conds.length ? and(...conds) : undefined);

  return NextResponse.json(rows);
}
