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

export function revalidateSpeciesCache(id: number, trialId: number) {
  revalidateTag(getSpeciesGlobalTag());
  revalidateTag(getSpeciesIdTag(id));
  revalidateTag(getSpeciesTrialIdTag(trialId));
}
