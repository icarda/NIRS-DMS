import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getTrialGlobalTag() {
  return getGlobalTag("traits");
}

export function getTrialIdTag(id: string | number) {
  return getIdTag("traits", id);
}

export function getTrialMetadataConfigGlobalTag() {
  return getGlobalTag("trialMetadataConfig");
}

export function getTrialMetadataConfigTag(name: string) {
  return getIdTag("trialMetadataConfig", name);
}

export function revalidateTrialCache(id: number | string) {
  revalidateTag(getTrialGlobalTag());
  revalidateTag(getTrialIdTag(id));
}

export function revalidateTrialMetadataConfigCache(name: string) {
  revalidateTag(getTrialMetadataConfigGlobalTag());
  revalidateTag(getTrialMetadataConfigTag(name));
}
