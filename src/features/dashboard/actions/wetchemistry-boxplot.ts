"use server";

import { and, eq, gte, lte, type SQL } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  QualityLabTable,
  SpeciesTable,
  StudyTable,
  TraitTable,
  TrialSpeciesTable,
  TrialTable,
} from "@/drizzle/schema";

export type DashboardFilters = {
  crop: string;
  qualityLab: string;
  year: string;
  country: string;
};

export type GroupBy = "crop" | "species" | "qualityLab";

const toInt = (v?: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

const yearBounds = (year?: string) => {
  const y = toInt(year);
  if (!y) return undefined;
  return { start: `${y}-01-01`, end: `${y}-12-31` };
};

type Row = { group: string; value: number | null };

export async function getWetchemBoxplotData(
  filters: DashboardFilters,
  traitName: string,
  groupBy: GroupBy
) {
  const conds: SQL[] = [eq(TraitTable.traitName, traitName)];

  if (filters.crop) conds.push(eq(CropTable.name, filters.crop));
  if (filters.qualityLab)
    conds.push(eq(QualityLabTable.name, filters.qualityLab));
  if (filters.country) conds.push(eq(QualityLabTable.country, filters.country));
  const y = yearBounds(filters.year);
  if (y) {
    conds.push(gte(StudyTable.sampleDate, y.start));
    conds.push(lte(StudyTable.sampleDate, y.end));
  }

  // Build the base join chain, then add group join by switch
  let rows: Row[] = [];

  if (groupBy === "crop") {
    rows = await db
      .select({
        group: CropTable.name,
        value: TraitTable.measuredValue,
      })
      .from(TraitTable)
      .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
      .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .innerJoin(
        QualityLabTable,
        eq(StudyTable.qualityLabId, QualityLabTable.id)
      )
      .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
      .where(and(...conds));
  } else if (groupBy === "qualityLab") {
    rows = await db
      .select({
        group: QualityLabTable.name,
        value: TraitTable.measuredValue,
      })
      .from(TraitTable)
      .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
      .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .innerJoin(
        QualityLabTable,
        eq(StudyTable.qualityLabId, QualityLabTable.id)
      )
      .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
      .where(and(...conds));
  } else {
    // species: via trial_species
    rows = await db
      .select({
        group: SpeciesTable.name,
        value: TraitTable.measuredValue,
      })
      .from(TraitTable)
      .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
      .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .innerJoin(
        TrialSpeciesTable,
        eq(TrialSpeciesTable.trialId, TrialTable.id)
      )
      .innerJoin(SpeciesTable, eq(TrialSpeciesTable.speciesId, SpeciesTable.id))
      .innerJoin(
        QualityLabTable,
        eq(StudyTable.qualityLabId, QualityLabTable.id)
      )
      .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
      .where(and(...conds));
  }

  // Group rows and compute stats in TS (quartiles aren’t native SQL)
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    if (r.value == null || !Number.isFinite(r.value)) continue;
    if (!groups.has(r.group)) groups.set(r.group, []);
    groups.get(r.group)!.push(r.value);
  }

  const out = Array.from(groups.entries())
    .map(([group, arr]) => {
      arr.sort((a, b) => a - b);
      const n = arr.length;
      if (n === 0) return null;

      const min = arr[0];
      const max = arr[n - 1];
      const mean = arr.reduce((s, v) => s + v, 0) / n;

      const q1 = quantile(arr, 0.25);
      const median = quantile(arr, 0.5);
      const q3 = quantile(arr, 0.75);

      return { group, min, q1, median, q3, max, mean, n };
    })
    .filter(Boolean) as {
    group: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
    n: number;
  }[];

  // Sort groups alphabetically for stable x-axis
  out.sort((a, b) => a.group.localeCompare(b.group));
  return out;
}

// Linear interpolation quantile (inclusive)
function quantile(sorted: number[], p: number) {
  const n = sorted.length;
  if (n === 1) return sorted[0];
  const idx = (n - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const h = idx - lo;
  return (1 - h) * sorted[lo] + h * sorted[hi];
}
