import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CropTable, SpeciesTable } from "@/drizzle/schema";
import { SpeciesFilterSchema } from "./schema";

function normalize(v: string | null | undefined) {
  return v ? v.toLowerCase() : undefined;
}

/**
 * Get Species
 * @description Returns species, optionally filtered by crop name.
 * @params SpeciesFilterSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = SpeciesFilterSchema.safeParse({
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
      id: SpeciesTable.id,
      name: SpeciesTable.name,
      cropId: SpeciesTable.cropId,
      cropName: CropTable.name,
    })
    .from(SpeciesTable)
    .innerJoin(CropTable, eq(SpeciesTable.cropId, CropTable.id))
    .where(conds.length ? and(...conds) : undefined);

  return NextResponse.json(rows);
}
