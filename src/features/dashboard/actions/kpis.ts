"use server";

import { and, countDistinct, eq, gte, lte, type SQL } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirsDataTable,
  QualityLabTable,
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

const pick = (rows: Array<{ count: number }>) => rows[0]?.count ?? 0;

export async function getDashboardKpis(filters: DashboardFilters) {
  const common: SQL<unknown>[] = [];

  if (filters.crop) {
    common.push(eq(CropTable.name, filters.crop));
  }

  if (filters.country) {
    common.push(eq(QualityLabTable.country, filters.country));
  }

  if (filters.qualityLab) {
    common.push(eq(QualityLabTable.name, filters.qualityLab));
  }

  const y = yearBounds(filters.year);
  const nirsConds: SQL<unknown>[] = [...common];
  if (y) {
    nirsConds.push(gte(StudyTable.sampleDate, y.start));
    nirsConds.push(lte(StudyTable.sampleDate, y.end));
  }

  const traitYear = toInt(filters.year);
  const wcConds: SQL<unknown>[] = [...common];
  if (traitYear) wcConds.push(eq(TraitTable.year, traitYear));

  const nirsSamplesQ = db
    .select({ count: countDistinct(NirsDataTable.sampleId) })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id));
  const nirsSamplesP = nirsConds.length
    ? nirsSamplesQ.where(and(...nirsConds))
    : nirsSamplesQ;

  const nirsCropsQ = db
    .select({ count: countDistinct(TrialTable.cropId) })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id));
  const nirsCropsP = nirsConds.length
    ? nirsCropsQ.where(and(...nirsConds))
    : nirsCropsQ;

  const nirsSpeciesQ = db
    .select({ count: countDistinct(NirsDataTable.speciesId) })
    .from(NirsDataTable)
    .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id));
  const nirsSpeciesP = nirsConds.length
    ? nirsSpeciesQ.where(and(...nirsConds))
    : nirsSpeciesQ;

  const wcSamplesQ = db
    .select({ count: countDistinct(TraitTable.sampleId) })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id));
  const wcSamplesP = wcConds.length
    ? wcSamplesQ.where(and(...wcConds))
    : wcSamplesQ;

  const wcCropsQ = db
    .select({ count: countDistinct(TrialTable.cropId) })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id));
  const wcCropsP = wcConds.length ? wcCropsQ.where(and(...wcConds)) : wcCropsQ;

  const wcSpeciesQ = db
    .select({ count: countDistinct(TrialSpeciesTable.speciesId) })
    .from(TraitTable)
    .innerJoin(StudyTable, eq(TraitTable.studyId, StudyTable.id))
    .innerJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CropTable, eq(TrialTable.cropId, CropTable.id))
    .innerJoin(TrialSpeciesTable, eq(TrialSpeciesTable.trialId, TrialTable.id));
  const wcSpeciesP = wcConds.length
    ? wcSpeciesQ.where(and(...wcConds))
    : wcSpeciesQ;

  const [
    nirsSamplesR,
    nirsCropsR,
    nirsSpeciesR,
    wcSamplesR,
    wcCropsR,
    wcSpeciesR,
  ] = await Promise.all([
    nirsSamplesP,
    nirsCropsP,
    nirsSpeciesP,
    wcSamplesP,
    wcCropsP,
    wcSpeciesP,
  ]);

  return {
    nirs: {
      samples: pick(nirsSamplesR),
      crops: pick(nirsCropsR),
      species: pick(nirsSpeciesR),
    },
    wetchem: {
      samples: pick(wcSamplesR),
      crops: pick(wcCropsR),
      species: pick(wcSpeciesR),
    },
  };
}
