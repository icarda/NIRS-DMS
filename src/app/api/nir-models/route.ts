import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { NirModelTable } from "@/drizzle/schema";
import { NirModelFilterSchema } from "./schema";

function normalize(v: string | null | undefined) {
  return v ? v.toLowerCase() : undefined;
}

/**
 * Get NIR Models
 * @description Returns NIR models with optional filters (manufacturer, type, name).
 * @params NirModelFilterSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = NirModelFilterSchema.safeParse({
    manufacturer: normalize(searchParams.get("manufacturer") || undefined),
    type: normalize(searchParams.get("type") || undefined),
    name: normalize(searchParams.get("name") || undefined),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { manufacturer, type, name } = parsed.data;

  const conds: any[] = [];
  if (manufacturer)
    conds.push(eq(sql`lower(${NirModelTable.manufacturer})`, manufacturer));
  if (type) conds.push(eq(sql`lower(${NirModelTable.type})`, type));
  if (name) conds.push(eq(sql`lower(${NirModelTable.name})`, name));

  const rows = await db
    .select({
      id: NirModelTable.id,
      name: NirModelTable.name,
      type: NirModelTable.type,
      wavelengthRange: NirModelTable.wavelengthRange,
      resolution: NirModelTable.resolution,
      manufacturer: NirModelTable.manufacturer,
    })
    .from(NirModelTable)
    .where(conds.length ? and(...conds) : undefined);

  return NextResponse.json(rows);
}
