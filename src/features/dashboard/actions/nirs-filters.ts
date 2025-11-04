"use server";

import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirsDataTable,
  QualityLabTable,
  StudyTable,
  TrialTable,
} from "@/drizzle/schema";

export type DashboardFilters = {
  crop: string;
  qualityLab: string;
  year: string;
  country: string;
};

const toInt = (v?: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

const yearBounds = (year?: string) => {
  const y = toInt(year);
  if (!y) return undefined;
  return { start: `${y}-01-01`, end: `${y}-12-31` };
};

function andsafe(...conds: (SQL | undefined)[]) {
  return conds.length ? and(...conds.filter(Boolean)) : undefined;
}

export async function getNirsFilterOptions(filters: DashboardFilters) {
  const yb = yearBounds(filters.year);

  const makeConds = (...conds: SQL[]) => andsafe(...conds);

  // CROPS: independent
  const cropsRows = await db
    .select({ name: CropTable.name })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .groupBy(CropTable.name)
    .orderBy(CropTable.name);

  // LABS: depend only on Crop
  const labsRows = await db
    .select({ name: QualityLabTable.name })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(filters.crop ? eq(CropTable.name, filters.crop) : undefined)
    .groupBy(QualityLabTable.name)
    .orderBy(QualityLabTable.name);

  // COUNTRIES: depend on Crop + Lab
  const countriesRows = await db
    .select({ country: QualityLabTable.country })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(
      andsafe(
        filters.crop ? eq(CropTable.name, filters.crop) : undefined,
        filters.qualityLab
          ? eq(QualityLabTable.name, filters.qualityLab)
          : undefined
      )
    )
    .groupBy(QualityLabTable.country)
    .orderBy(QualityLabTable.country);

  // YEARS: depend on Crop + Lab + Country
  const yearExpr = sql<number>`extract(year from ${StudyTable.sampleDate})`;
  const yearsRows = await db
    .select({ year: yearExpr })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(
      andsafe(
        filters.crop ? eq(CropTable.name, filters.crop) : undefined,
        filters.qualityLab
          ? eq(QualityLabTable.name, filters.qualityLab)
          : undefined,
        filters.country
          ? eq(QualityLabTable.country, filters.country)
          : undefined
      )
    )
    .groupBy(yearExpr)
    .orderBy(yearExpr);

  return {
    crops: cropsRows.map((r) => r.name).filter(Boolean) as string[],
    qualityLabs: labsRows.map((r) => r.name).filter(Boolean) as string[],
    countries: countriesRows.map((r) => r.country).filter(Boolean) as string[],
    years: yearsRows.map((r) => String(r.year)).filter(Boolean) as string[],
  };
}
