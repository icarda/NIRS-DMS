import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import {
  CropCommonNameTable,
  CropTable,
  PhysiologicalStageTable,
  ProductTypeTable,
  SpeciesTable,
} from "@/drizzle/schema";
import { CropsFilterSchema } from "./schema";

function normalize(v: string | null | undefined) {
  return v ? v.toLowerCase() : undefined;
}

/**
 * Get Crops
 * @description Returns crops with optional filters, including related common names, species, product types, and physiological stages.
 * @params CropsFilterSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Validate + normalize query params
  const parsed = CropsFilterSchema.safeParse({
    commonName: normalize(searchParams.get("commonName") || undefined),
    species: normalize(searchParams.get("species") || undefined),
    productType: normalize(searchParams.get("productType") || undefined),
    physiologicalStage: normalize(
      searchParams.get("physiologicalStage") || undefined
    ),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { commonName, species, productType, physiologicalStage } = parsed.data;

  const conds: any[] = [];
  if (commonName)
    conds.push(eq(sql`lower(${CropCommonNameTable.commonName})`, commonName));
  if (species) conds.push(eq(sql`lower(${SpeciesTable.name})`, species));
  if (productType)
    conds.push(eq(sql`lower(${ProductTypeTable.name})`, productType));
  if (physiologicalStage)
    conds.push(
      eq(sql`lower(${PhysiologicalStageTable.name})`, physiologicalStage)
    );

  // One query joining everything
  const rows = await db
    .select({
      id: CropTable.id,
      name: CropTable.name,
      description: CropTable.description,
      cropImageUrl: CropTable.cropImageUrl,
      commonName: CropCommonNameTable.commonName,
      species: SpeciesTable.name,
      productType: ProductTypeTable.name,
      physiologicalStage: PhysiologicalStageTable.name,
    })
    .from(CropTable)
    .leftJoin(CropCommonNameTable, eq(CropCommonNameTable.cropId, CropTable.id))
    .leftJoin(SpeciesTable, eq(SpeciesTable.cropId, CropTable.id))
    .leftJoin(ProductTypeTable, eq(ProductTypeTable.cropId, CropTable.id))
    .leftJoin(
      PhysiologicalStageTable,
      eq(PhysiologicalStageTable.cropId, CropTable.id)
    )
    .where(conds.length ? and(...conds) : undefined);

  // Group rows per crop
  const grouped = Object.values(
    rows.reduce(
      (acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            name: row.name,
            description: row.description,
            cropImageUrl: row.cropImageUrl,
            commonNames: [],
            species: [],
            productTypes: [],
            physiologicalStages: [],
          };
        }
        if (
          row.commonName &&
          !acc[row.id].commonNames.includes(row.commonName)
        ) {
          acc[row.id].commonNames.push(row.commonName);
        }
        if (row.species && !acc[row.id].species.includes(row.species)) {
          acc[row.id].species.push(row.species);
        }
        if (
          row.productType &&
          !acc[row.id].productTypes.includes(row.productType)
        ) {
          acc[row.id].productTypes.push(row.productType);
        }
        if (
          row.physiologicalStage &&
          !acc[row.id].physiologicalStages.includes(row.physiologicalStage)
        ) {
          acc[row.id].physiologicalStages.push(row.physiologicalStage);
        }
        return acc;
      },
      {} as Record<number, any>
    )
  );

  return NextResponse.json(grouped);
}
