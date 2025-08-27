import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CenterTable, QualityLabTable } from "@/drizzle/schema";
import { QualityLabsFilterSchema, QualityLabsResponseSchema } from "./schema";

function normalize(v: string | null) {
  return v ? v.toLowerCase() : null;
}

/**
 * Get Quality Labs
 * @description Returns distinct quality labs, filtered by country and/or center.
 * @params QualityLabsFilterSchema
 * @response QualityLabsResponseSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = QualityLabsFilterSchema.safeParse({
    country: normalize(searchParams.get("country")) || undefined,
    center: normalize(searchParams.get("center")) || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { country, center } = parsed.data;

  const conds: any[] = [];
  if (country)
    conds.push(
      eq(sql`lower(${QualityLabTable.country})`, country.toLowerCase())
    );
  if (center)
    conds.push(eq(sql`lower(${CenterTable.name})`, center.toLowerCase()));

  const rows = await db
    .selectDistinct({
      name: QualityLabTable.name,
      country: QualityLabTable.country,
      center: CenterTable.name,
    })
    .from(QualityLabTable)
    .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
    .where(conds.length ? and(...conds) : undefined);

  return NextResponse.json(rows);
}
