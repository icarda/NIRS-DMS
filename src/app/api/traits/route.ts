import { and, eq, gte, inArray, lte, sql, SQL } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirModelTable,
  PhysiologicalStageTable,
  ProductTypeTable,
  QualityLabTable,
  StudyTable,
  TraitTable,
  TrialTable,
} from "@/drizzle/schema";
import { TraitFilterSchema, TraitResponseSchema } from "./schema";

function andsafe(conds: SQL[]) {
  return conds.length ? and(...conds) : undefined;
}

function normalize(v: string | null) {
  return v ? v.toLowerCase() : null;
}

/**
 * Get Trait data per sample
 *
 * @description Returns wet chemistry and predicted trait values,
 * grouped by sample ID, with contextual metadata (crop, quality lab,  etc).
 *
 * @params TraitFilterSchema
 * @response TraitResponseSchema
 * @openapi
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const crop = normalize(searchParams.get("crop"));
  const qualityLab = normalize(searchParams.get("qualityLab"));
  const nirModel = normalize(searchParams.get("nirModel"));
  const plantingYear = searchParams.get("plantingYear");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const physiologicalStage = normalize(searchParams.get("physiologicalStage"));
  const productType = normalize(searchParams.get("productType"));
  const traitNamesParam = searchParams.get("traitName"); // required

  if (!traitNamesParam) {
    return NextResponse.json(
      { error: "traitName is required (can be comma-separated)" },
      { status: 400 }
    );
  }

  const traitNames = traitNamesParam
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (traitNames.length === 0) {
    return NextResponse.json(
      { error: "No valid trait names provided" },
      { status: 400 }
    );
  }

  const conds: SQL[] = [];

  if (crop) conds.push(eq(sql`lower(${CropTable.name})`, crop));
  if (qualityLab)
    conds.push(eq(sql`lower(${QualityLabTable.name})`, qualityLab));
  if (nirModel) conds.push(eq(sql`lower(${NirModelTable.name})`, nirModel));
  if (plantingYear)
    conds.push(
      eq(sql`extract(year from ${TrialTable.plantingDate})`, plantingYear)
    );
  if (startDate) conds.push(gte(StudyTable.sampleDate, startDate));
  if (endDate) conds.push(lte(StudyTable.sampleDate, endDate));
  if (physiologicalStage)
    conds.push(
      eq(sql`lower(${PhysiologicalStageTable.name})`, physiologicalStage)
    );
  if (productType)
    conds.push(eq(sql`lower(${ProductTypeTable.name})`, productType));
  if (traitNames.length)
    conds.push(inArray(sql`lower(${TraitTable.traitName})`, traitNames));

  const rows = await db
    .select({
      sampleId: TraitTable.sampleId,
      traitName: TraitTable.traitName,
      measuredValue: TraitTable.measuredValue,
      predictedValue: TraitTable.predictedValue,
      year: TraitTable.year,
      crop: CropTable.name,
      qualityLab: QualityLabTable.name,
      nirModel: NirModelTable.name,
      plantingDate: TrialTable.plantingDate,
      physiologicalStage: PhysiologicalStageTable.name,
      productType: ProductTypeTable.name,
    })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))
    .innerJoin(
      PhysiologicalStageTable,
      eq(StudyTable.physiologicalStageId, PhysiologicalStageTable.id)
    )
    .innerJoin(
      ProductTypeTable,
      eq(StudyTable.productTypeId, ProductTypeTable.id)
    )
    .where(andsafe(conds));

  // Group by sampleId
  const grouped = Object.values(
    rows.reduce(
      (acc, row) => {
        if (!acc[row.sampleId]) {
          acc[row.sampleId] = {
            sampleId: row.sampleId,
            crop: row.crop,
            qualityLab: row.qualityLab,
            nirModel: row.nirModel,
            plantingDate: row.plantingDate,
            physiologicalStage: row.physiologicalStage,
            productType: row.productType,
            traits: [],
          };
        }
        acc[row.sampleId].traits.push({
          traitName: row.traitName,
          measuredValue: row.measuredValue,
          predictedValue: row.predictedValue,
          year: row.year,
        });
        return acc;
      },
      {} as Record<number, any>
    )
  );

  return NextResponse.json(grouped);
}
