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

function andsafe(...conds: SQL[]) {
  return conds.length ? and(...conds) : undefined;
}

export async function getNirsFilterOptions(filters: DashboardFilters) {
  const yb = yearBounds(filters.year);

  const condsFor = (
    exclude?: "crop" | "qualityLab" | "country" | "year"
  ): SQL[] => {
    const conds: SQL[] = [];
    if (filters.crop && exclude !== "crop") {
      conds.push(eq(CropTable.name, filters.crop));
    }
    if (filters.qualityLab && exclude !== "qualityLab") {
      conds.push(eq(QualityLabTable.name, filters.qualityLab));
    }
    if (filters.country && exclude !== "country") {
      conds.push(eq(QualityLabTable.country, filters.country));
    }
    if (yb && exclude !== "year") {
      conds.push(gte(StudyTable.sampleDate, yb.start));
      conds.push(lte(StudyTable.sampleDate, yb.end));
    }
    return conds;
  };

  // CROPS
  const cropsRows = await db
    .select({ name: CropTable.name })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(andsafe(...condsFor("crop")))
    .groupBy(CropTable.name)
    .orderBy(CropTable.name);

  // LABS
  const labsRows = await db
    .select({ name: QualityLabTable.name })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(andsafe(...condsFor("qualityLab")))
    .groupBy(QualityLabTable.name)
    .orderBy(QualityLabTable.name);

  // COUNTRIES
  const countriesRows = await db
    .select({ country: QualityLabTable.country })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(andsafe(...condsFor("country")))
    .groupBy(QualityLabTable.country)
    .orderBy(QualityLabTable.country);

  // YEARS (from Study.sampleDate)
  const yearExpr = sql<number>`extract(year from ${StudyTable.sampleDate})`;
  const yearsRows = await db
    .select({ year: yearExpr })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(andsafe(...condsFor("year")))
    .groupBy(yearExpr)
    .orderBy(yearExpr);

  return {
    crops: cropsRows.map((r) => r.name).filter(Boolean) as string[],
    qualityLabs: labsRows.map((r) => r.name).filter(Boolean) as string[],
    countries: countriesRows.map((r) => r.country).filter(Boolean) as string[],
    years: yearsRows.map((r) => String(r.year)).filter(Boolean) as string[],
  };
}
