import { revalidateTag } from "next/cache";

import { getCropIdTag } from "@/features/crops/db/cache/crop";
import { getGlobalTag, getIdTag, getSpeciesTag, getTrialTag } from "@/lib/dataCache";

export function getSpeciesGlobalTag() {
  return getGlobalTag("species");
}

export function getSpeciesIdTag(id: number) {
  return getIdTag("species", id);
}

export function getSpeciesTrialIdTag(trialId: number) {
  return getSpeciesTag("species", trialId);
}

export function getSpeciesSampleIdTag(sampleId: string) {
  return getSpeciesTag("sample", sampleId);
}

export function revalidateSpeciesCache(
  id: number,
  {
    trialId,
    sampleId,
    cropId,
  }: { trialId?: number; sampleId?: string; cropId?: number } = {}
) {
  revalidateTag(getSpeciesGlobalTag());
  revalidateTag(getSpeciesIdTag(id));
  if (trialId != null) revalidateTag(getSpeciesTrialIdTag(trialId));
  if (sampleId != null) revalidateTag(getSpeciesSampleIdTag(sampleId));
  if (cropId != null) revalidateTag(getCropIdTag(cropId));
}
