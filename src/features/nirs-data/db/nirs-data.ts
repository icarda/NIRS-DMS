import { and, eq, gte, lte, sql, SQL } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirModelTable,
  NirsDataTable,
  OtherIdsTable,
  QualityLabTable,
  SpeciesTable,
  StudyTable,
  TrialSpeciesTable,
  TrialTable,
} from "@/drizzle/schema";
import { revalidateNIRSDataCache } from "./cache";

export interface NirsDataFilters {
  studyCode?: string;
  trial?: string;
  crop?: string;
  species?: string;
  sampleId?: string;
  gid?: string;
  plotId?: string;
  location?: string;
  qualityLab?: string;
  nirModel?: string;
  year?: number;
  minWavelength?: number;
  maxWavelength?: number;
  limit?: number;
  offset?: number;
}

export type NirsDataFilteredResult = {
  nirsId: number;
  wavelength: number;
  value: number;
  sampleId: string;
  plotId: string | null;
  gid: string | null;
  studyCode: string | null;
  studySampleDate: Date | null;
  program: string | null;
  requesterName: string | null;
  requesterEmail: string | null;
  trial: string | null;
  location: string | null;
  plantingDate: Date | null;
  irrigation: boolean | null;
  crop: string | null;
  species: string | null;
  qualityLab: string | null;
  nirModel: string | null;
};

export async function getNirsDataFiltered(
  filters: NirsDataFilters
): Promise<NirsDataFilteredResult[]> {
  const conditions: (SQL | undefined)[] = [];

  if (filters.sampleId !== undefined) {
    conditions.push(eq(NirsDataTable.sampleId, filters.sampleId));
  }
  if (filters.minWavelength !== undefined) {
    conditions.push(gte(NirsDataTable.wavelength, filters.minWavelength));
  }
  if (filters.maxWavelength !== undefined) {
    conditions.push(lte(NirsDataTable.wavelength, filters.maxWavelength));
  }

  if (filters.gid !== undefined) {
    conditions.push(eq(OtherIdsTable.gid, filters.gid));
  }
  if (filters.plotId !== undefined) {
    conditions.push(eq(OtherIdsTable.plotId, filters.plotId));
  }

  if (filters.studyCode !== undefined) {
    conditions.push(eq(StudyTable.studyCode, filters.studyCode));
  }
  if (filters.year !== undefined) {
    conditions.push(
      sql`date_part('year', ${StudyTable.sampleDate}) = ${filters.year}`
    );
  }

  if (filters.trial !== undefined) {
    conditions.push(eq(TrialTable.name, filters.trial));
  }
  if (filters.location !== undefined) {
    conditions.push(eq(TrialTable.location, filters.location));
  }

  if (filters.crop !== undefined) {
    conditions.push(eq(CropTable.name, filters.crop));
  }
  if (filters.qualityLab !== undefined) {
    conditions.push(eq(QualityLabTable.name, filters.qualityLab));
  }
  if (filters.nirModel !== undefined) {
    conditions.push(eq(NirModelTable.name, filters.nirModel));
  }
  if (filters.species !== undefined) {
    conditions.push(eq(SpeciesTable.name, filters.species));
  }

  const whereClause =
    conditions.length > 0
      ? and(...conditions.filter((c): c is SQL => !!c))
      : undefined;

  try {
    const query = db
      .select({
        nirsId: NirsDataTable.id,
        wavelength: NirsDataTable.wavelength,
        value: NirsDataTable.value,
        sampleId: NirsDataTable.sampleId,
        plotId: OtherIdsTable.plotId,
        gid: OtherIdsTable.gid,
        studyCode: StudyTable.studyCode,
        studySampleDate: StudyTable.sampleDate,
        program: StudyTable.program,
        requesterName: StudyTable.requesterName,
        requesterEmail: StudyTable.requesterEmail,
        trial: TrialTable.name,
        location: TrialTable.location,
        plantingDate: TrialTable.plantingDate,
        irrigation: TrialTable.irrigation,
        crop: CropTable.name,
        species: SpeciesTable.name,
        qualityLab: QualityLabTable.name,
        nirModel: NirModelTable.name,
      })
      .from(NirsDataTable)
      .leftJoin(
        OtherIdsTable,
        and(
          eq(NirsDataTable.studyId, OtherIdsTable.studyId),
          eq(NirsDataTable.sampleId, OtherIdsTable.sampleId)
        )
      )
      .leftJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
      .leftJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .leftJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
      .leftJoin(
        QualityLabTable,
        eq(StudyTable.qualityLabId, QualityLabTable.id)
      )
      .leftJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))

      .leftJoin(TrialSpeciesTable, eq(TrialTable.id, TrialSpeciesTable.trialId))
      .leftJoin(SpeciesTable, eq(TrialSpeciesTable.speciesId, SpeciesTable.id))
      .where(whereClause)
      .limit(filters.limit ?? 500)
      .offset(filters.offset ?? 0)
      .orderBy(
        NirsDataTable.studyId,
        NirsDataTable.sampleId,
        NirsDataTable.wavelength
      );

    const results = await query;
    return results as NirsDataFilteredResult[];
  } catch (error: any) {
    console.error("Error fetching filtered NIRS data:", error);
    throw new Error(`Database error fetching NIRS data: ${error.message}`);
  }
}

export async function insertNirsDataBatch(
  data: (typeof NirsDataTable.$inferInsert)[],
  trx: Omit<typeof db, "$client"> = db,
  batchSize = 5000
) {
  if (!data?.length) return;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await trx.insert(NirsDataTable).values(batch).onConflictDoNothing();
  }

  revalidateNIRSDataCache(data[0].studyId);
}
export async function getDistinctSampleIdsForStudy(
  studyId: number
): Promise<string[]> {
  if (isNaN(studyId) || studyId <= 0) {
    return [];
  }
  try {
    const results = await db
      .selectDistinct({ sampleId: NirsDataTable.sampleId })
      .from(NirsDataTable)
      .where(eq(NirsDataTable.studyId, studyId));

    return results.map((r) => r.sampleId);
  } catch (error) {
    throw new Error(
      "Database error fetching existing sample IDs for consistency check."
    );
  }
}
