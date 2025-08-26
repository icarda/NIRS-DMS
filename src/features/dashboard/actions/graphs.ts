"use server";

import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirsDataTable,
  QualityLabTable,
  StudyTable,
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

export async function getSpectralData(filters: DashboardFilters) {
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

  const rows = await db
    .select({
      sampleId: NirsDataTable.sampleId,
      wavelength: NirsDataTable.wavelength,
      value: NirsDataTable.value,
    })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .where(where.length ? and(...where) : undefined);

  return rows;
}
