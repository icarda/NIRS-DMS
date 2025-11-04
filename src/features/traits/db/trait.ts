import { and, eq, SQL } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import {
  CropTable,
  CropTraitTable,
  NirModelTable,
  OtherIdsTable,
  PhysiologicalStageTable,
  ProductTypeTable,
  QualityLabTable,
  StudyTable,
  TraitTable,
  TrialTable,
} from "@/drizzle/schema";
import {
  getTraitGlobalTag,
  getTraitTag,
  revalidateTraitCache,
} from "./cache/trait";

export interface TraitFilters {
  studyCode?: string;
  trial?: string;
  crop?: string;
  sampleId?: string;
  trait?: string;
  year?: number;
  location?: string;
  qualityLab?: string;
  nirModel?: string;
  limit?: number;
  offset?: number;
}

export type TraitFilteredResult = {
  traitId: number;
  traitName: string;
  measuredValue: number;
  predictedValue: number | null;
  year: number;
  sampleId: string;
  studyCode: string | null;
  trialName: string | null;
  location: string | null;
  cropName: string | null;
  unit: string | null;
  qualityLabName: string | null;
  nirModelName: string | null;
};

export async function getTraitsFiltered(
  filters: TraitFilters
): Promise<TraitFilteredResult[]> {
  const conditions: (SQL | undefined)[] = [];

  if (filters.sampleId !== undefined) {
    conditions.push(eq(TraitTable.sampleId, filters.sampleId));
  }
  if (filters.trait !== undefined) {
    conditions.push(eq(TraitTable.traitName, filters.trait));
  }
  if (filters.year !== undefined) {
    conditions.push(eq(TraitTable.year, filters.year));
  }

  if (filters.studyCode !== undefined) {
    conditions.push(eq(StudyTable.studyCode, filters.studyCode));
  }
  if (filters.trial !== undefined) {
    conditions.push(eq(TrialTable.name, filters.trial));
  }
  if (filters.crop !== undefined) {
    conditions.push(eq(CropTable.name, filters.crop));
  }
  if (filters.location !== undefined) {
    conditions.push(eq(TrialTable.location, filters.location));
  }
  if (filters.qualityLab !== undefined) {
    conditions.push(eq(QualityLabTable.name, filters.qualityLab));
  }
  if (filters.nirModel !== undefined) {
    conditions.push(eq(NirModelTable.name, filters.nirModel));
  }

  const whereClause =
    conditions.length > 0
      ? and(...conditions.filter((c): c is SQL => !!c))
      : undefined;

  try {
    const query = db
      .select({
        traitId: TraitTable.id,
        traitName: TraitTable.traitName,
        measuredValue: TraitTable.measuredValue,
        predictedValue: TraitTable.predictedValue,
        year: TraitTable.year,
        sampleId: TraitTable.sampleId,
        studyCode: StudyTable.studyCode,
        trialName: TrialTable.name,
        location: TrialTable.location,
        cropName: CropTable.name,
        qualityLabName: QualityLabTable.name,
        nirModelName: NirModelTable.name,
        unit: CropTraitTable.unit,
      })
      .from(TraitTable)
      .leftJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
      .leftJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .leftJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
      .leftJoin(
        QualityLabTable,
        eq(StudyTable.qualityLabId, QualityLabTable.id)
      )
      .leftJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))
      .leftJoin(CropTraitTable, eq(TraitTable.cropTraitId, CropTraitTable.id))
      .where(whereClause)
      .limit(filters.limit ?? 1000)
      .offset(filters.offset ?? 0)

      .orderBy(TraitTable.studyId, TraitTable.sampleId, TraitTable.traitName);

    const results = await query;

    return results as TraitFilteredResult[];
  } catch (error: any) {
    console.error("Error fetching filtered Trait data:", error);
    throw new Error(`Database error fetching Trait data: ${error.message}`);
  }
}

export async function getWetChemistryData() {
  "use cache";
  cacheTag(getTraitGlobalTag());
  const result = await db
    .selectDistinct({
      sample_id: TraitTable.sampleId,
      crop_name: CropTable.name,
      trait_name: TraitTable.traitName,
      measured_value: TraitTable.measuredValue,
      predicted_value: TraitTable.predictedValue,
      trait_unit: CropTraitTable.unit,
      study_code: StudyTable.studyCode,
      sample_date: StudyTable.sampleDate,
      germplasm_id: OtherIdsTable.gid,
      product_type: ProductTypeTable.name,
      // study_metadata: StudyTable.additionalMetadata,
      trial_name: TrialTable.name,
      trial_planting_date: TrialTable.plantingDate,
      // trial_metadata: TrialTable.additionalMetadata,
      quality_lab_name: QualityLabTable.name,
      physiological_stage: PhysiologicalStageTable.name,
    })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(CropTraitTable, eq(TraitTable.cropTraitId, CropTraitTable.id))
    .innerJoin(
      ProductTypeTable,
      eq(StudyTable.productTypeId, ProductTypeTable.id)
    )
    .innerJoin(
      PhysiologicalStageTable,
      eq(StudyTable.physiologicalStageId, PhysiologicalStageTable.id)
    )
    .innerJoin(OtherIdsTable, eq(TraitTable.sampleId, OtherIdsTable.sampleId))
    .orderBy(TraitTable.sampleId);

  return result;
}

export async function getTraits({ cropTraitId }: { cropTraitId: number }) {
  "use cache";
  cacheTag(getTraitTag(cropTraitId));
  const traits = await db.query.TraitTable.findMany({
    where: eq(TraitTable.cropTraitId, cropTraitId),
  });
  return traits;
}

export async function insertTraitBatch(
  data: (typeof TraitTable.$inferInsert)[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx.insert(TraitTable).values(data);

  if (data.length > 0) revalidateTraitCache(data[0].cropTraitId);
}

export async function insertTrait(data: typeof TraitTable.$inferInsert) {
  const [newTrait] = await db
    .insert(TraitTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [TraitTable.id],
      set: data,
    });

  if (newTrait == null) throw new Error("Failed to create trait");
  revalidateTraitCache(newTrait.cropTraitId);

  return newTrait;
}

export async function deleteTrait({ id }: { id: number }) {
  const [deletedTrait] = await db
    .delete(TraitTable)
    .where(eq(TraitTable.id, id))
    .returning();

  if (deletedTrait == null) throw new Error("Failed to delete trait");
  revalidateTraitCache(deletedTrait.cropTraitId);

  return deletedTrait;
}
