import { revalidateTag } from "next/cache";

import { getGlobalTag, getTrialTag } from "@/lib/dataCache";

export function getSpeciesGlobalTag() {
  return getGlobalTag("species");
}

export function getSpeciesIdTag(id: number) {
  return getTrialTag("species", id);
}

export function getSpeciesTrialIdTag(trialId: number) {
  return getTrialTag("species", trialId);
}

export function getSpeciesSampleIdTag(sampleId: number) {
  return getTrialTag("species", sampleId);
}

export function revalidateSpeciesCache(
  id: number,
  { trialId, sampleId }: { trialId?: number; sampleId?: number } = {}
) {
  revalidateTag(getSpeciesGlobalTag());
  revalidateTag(getSpeciesIdTag(id));
  if (trialId != null) revalidateTag(getSpeciesTrialIdTag(trialId));
  if (sampleId != null) revalidateTag(getSpeciesSampleIdTag(sampleId));
}
