import { and, eq, gte, lte, sql, SQL } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirModelTable,
  NirsDataTable,
  PhysiologicalStageTable,
  ProductTypeTable,
  QualityLabTable,
  SpeciesTable,
  StudyTable,
  TrialTable,
} from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth/require-auth";
import { NirsFilterSchema, NirsResponseSchema } from "./schema";

function andsafe(conds: SQL[]) {
  return conds.length ? and(...conds) : undefined;
}

function normalize(v: string | null) {
  return v ? v.toLowerCase() : null;
}

/**
 * Get NIRS data per sample
 * @description Returns spectral NIR data grouped by sampleId
 * @params NirsFilterSchema
 * @response NirsResponse
 * @security BearerAuth
 * @openapi
 */
export async function GET(req: Request) {
  const { error } = await requireAuth(req, ["read:data"]);
  if (error) return error;
  const { searchParams } = new URL(req.url);

  const crop = normalize(searchParams.get("crop"));
  const qualityLab = normalize(searchParams.get("qualityLab"));
  const nirModel = normalize(searchParams.get("nirModel"));
  const species = normalize(searchParams.get("species"));
  const plantingYear = searchParams.get("plantingYear");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const physiologicalStage = normalize(searchParams.get("physiologicalStage"));
  const productType = normalize(searchParams.get("productType"));

  const conds: SQL[] = [];

  if (crop) conds.push(eq(sql`lower(${CropTable.name})`, crop));
  if (qualityLab)
    conds.push(eq(sql`lower(${QualityLabTable.name})`, qualityLab));
  if (nirModel) conds.push(eq(sql`lower(${NirModelTable.name})`, nirModel));
  if (species) conds.push(eq(sql`lower(${SpeciesTable.name})`, species));
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

  const rows = await db
    .select({
      sampleId: NirsDataTable.sampleId,
      wavelength: NirsDataTable.wavelength,
      value: NirsDataTable.value,
      crop: CropTable.name,
      qualityLab: QualityLabTable.name,
      nirModel: NirModelTable.name,
      species: SpeciesTable.name,
      plantingDate: TrialTable.plantingDate,
      physiologicalStage: PhysiologicalStageTable.name,
      productType: ProductTypeTable.name,
    })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(SpeciesTable, eq(NirsDataTable.speciesId, SpeciesTable.id))
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
            species: row.species,
            plantingDate: row.plantingDate,
            physiologicalStage: row.physiologicalStage,
            productType: row.productType,
            nirsData: [],
          };
        }
        acc[row.sampleId].nirsData.push({
          wavelength: row.wavelength,
          value: row.value,
        });
        return acc;
      },
      {} as Record<number, any>
    )
  );

  return NextResponse.json(grouped);
}
