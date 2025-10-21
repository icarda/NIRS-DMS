"use server";

import { and, eq, gte, lte, SQL } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  CropTraitTable,
  NirModelTable,
  NirsDataTable,
  QualityLabTable,
  StudyTable,
  TraitTable,
  TrialTable,
} from "@/drizzle/schema";
import type { DashboardFilters } from "@/features/dashboard/actions/kpis";

const toInt = (v?: string) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

const yearBounds = (year?: string) => {
  const y = toInt(year);
  if (!y) return undefined;
  return { start: `${y}-01-01`, end: `${y}-12-31` };
};

export async function getSpectralData(
  filters: DashboardFilters,
  nirModel: string | null
) {
  const where = [];

  if (filters.crop) {
    where.push(eq(CropTable.name, filters.crop));
  }
  if (filters.qualityLab) {
    where.push(eq(QualityLabTable.name, filters.qualityLab));
  }
  if (filters.country) {
    where.push(eq(QualityLabTable.country, filters.country));
  }

  if (filters.year) {
    const y = yearBounds(filters.year);
    if (y) {
      where.push(gte(StudyTable.sampleDate, y.start));
      where.push(lte(StudyTable.sampleDate, y.end));
    }
  }

  if (nirModel) {
    where.push(eq(NirModelTable.name, nirModel));
  }

  const rows = await db
    .select({
      sampleId: NirsDataTable.sampleId,
      wavelength: NirsDataTable.wavelength,
      value: NirsDataTable.value,
      nirModelName: NirModelTable.name,
    })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(where.length ? and(...where) : undefined);

  return rows;
}

// Data shape your Histogram component wants
export type HistogramPoint = { key: string; value: number | null };

/** Get measured wet-chem values for a specific trait (e.g., "protein"). */
export async function getWetchemTraitValues(
  filters: DashboardFilters,
  traitName: string
): Promise<HistogramPoint[]> {
  const conds: SQL[] = [eq(TraitTable.traitName, traitName)];

  if (filters.crop) conds.push(eq(CropTable.name, filters.crop));
  if (filters.qualityLab)
    conds.push(eq(QualityLabTable.name, filters.qualityLab));
  if (filters.country) conds.push(eq(QualityLabTable.country, filters.country));

  const y = toInt(filters.year);
  if (y) conds.push(eq(TraitTable.year, y)); // use trait.year

  const rows = await db
    .select({
      sampleId: TraitTable.sampleId,
      value: TraitTable.measuredValue,
    })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(and(...conds));

  // Convert to the {key, value} shape your Histogram expects
  return rows.map((r) => ({
    key: `Sample ${r.sampleId}`,
    value: r.value,
  }));
}

// Distinct trait names (+ unit) available under current filters
export async function listWetchemTraits(filters: DashboardFilters) {
  const conds: SQL[] = [];
  if (filters.crop) conds.push(eq(CropTable.name, filters.crop));
  if (filters.qualityLab)
    conds.push(eq(QualityLabTable.name, filters.qualityLab));
  if (filters.country) conds.push(eq(QualityLabTable.country, filters.country));
  const y = toInt(filters.year);
  if (y) conds.push(eq(TraitTable.year, y));

  const rows = await db
    .select({
      traitName: TraitTable.traitName,
      unit: CropTraitTable.unit,
    })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(CropTraitTable, eq(TraitTable.cropTraitId, CropTraitTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .groupBy(TraitTable.traitName, CropTraitTable.unit)
    .orderBy(TraitTable.traitName);

  return rows.map((r) => ({
    value: r.traitName,
    label: r.unit
      ? `${capitalize(r.traitName)} (${r.unit})`
      : capitalize(r.traitName),
    unit: r.unit ?? "",
  }));
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export async function listNirModelsForFilters(filters: DashboardFilters) {
  const conds: SQL[] = [];
  if (filters.crop) conds.push(eq(CropTable.name, filters.crop));
  if (filters.qualityLab)
    conds.push(eq(QualityLabTable.name, filters.qualityLab));
  if (filters.country) conds.push(eq(QualityLabTable.country, filters.country));
  const y = yearBounds(filters.year);
  if (y) {
    conds.push(gte(StudyTable.sampleDate, y.start));
    conds.push(lte(StudyTable.sampleDate, y.end));
  }

  const rows = await db
    .select({
      id: NirModelTable.id,
      name: NirModelTable.name,
    })
    .from(StudyTable)
    .innerJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .groupBy(NirModelTable.id, NirModelTable.name)
    .orderBy(NirModelTable.name);

  return rows;
}

export async function getSpectralDataWithNIRModel(
  filters: DashboardFilters,
  nirModelName?: string
) {
  const conds: SQL[] = [];
  if (filters.crop) conds.push(eq(CropTable.name, filters.crop));
  if (filters.qualityLab)
    conds.push(eq(QualityLabTable.name, filters.qualityLab));
  if (filters.country) conds.push(eq(QualityLabTable.country, filters.country));
  const y = yearBounds(filters.year);
  if (y) {
    conds.push(gte(StudyTable.sampleDate, y.start));
    conds.push(lte(StudyTable.sampleDate, y.end));
  }
  if (nirModelName) conds.push(eq(NirModelTable.name, nirModelName));

  const rows = await db
    .select({
      sampleId: NirsDataTable.sampleId,
      wavelength: NirsDataTable.wavelength,
      value: NirsDataTable.value,
    })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(NirModelTable, eq(StudyTable.nirModelId, NirModelTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(conds.length ? and(...conds) : undefined);

  return rows;
}
