import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { CropTable, ProductTypeTable } from "@/drizzle/schema";
import { ProductTypeFilterSchema } from "./schema";

function normalize(v: string | null | undefined) {
  return v ? v.toLowerCase() : undefined;
}

/**
 * Get Product Types
 * @description Returns product types, optionally filtered by crop name.
 * @params ProductTypeFilterSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = ProductTypeFilterSchema.safeParse({
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
      id: ProductTypeTable.id,
      name: ProductTypeTable.name,
      cropId: ProductTypeTable.cropId,
      cropName: CropTable.name,
    })
    .from(ProductTypeTable)
    .innerJoin(CropTable, eq(ProductTypeTable.cropId, CropTable.id))
    .where(conds.length ? and(...conds) : undefined);

  return NextResponse.json(rows);
}
