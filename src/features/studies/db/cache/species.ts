import { revalidateTag } from "next/cache";

import { getCropIdTag } from "@/features/crops/db/cache/crop";
import { getGlobalTag, getIdTag, getTrialTag } from "@/lib/dataCache";

export function getSpeciesGlobalTag() {
  return getGlobalTag("species");
}

export function getSpeciesIdTag(id: number) {
  return getIdTag("species", id);
}

export function getSpeciesTrialIdTag(trialId: number) {
  return getTrialTag("species", trialId);
}

export function getSpeciesSampleIdTag(sampleId: number) {
  return getTrialTag("species", sampleId);
}

export function revalidateSpeciesCache(
  id: number,
  {
    trialId,
    sampleId,
    cropId,
  }: { trialId?: number; sampleId?: number; cropId?: number } = {}
) {
  revalidateTag(getSpeciesGlobalTag());
  revalidateTag(getSpeciesIdTag(id));
  if (trialId != null) revalidateTag(getSpeciesTrialIdTag(trialId));
  if (sampleId != null) revalidateTag(getSpeciesSampleIdTag(sampleId));
  if (cropId != null) revalidateTag(getCropIdTag(cropId));
}
