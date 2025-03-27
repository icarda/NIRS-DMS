import { revalidateTag } from "next/cache";

import { getCenterTag, getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getQualityLabGlobalTag() {
  return getGlobalTag("qualityLabs");
}

export function getQualityLabsByCenterTag(center: string) {
  return getCenterTag("qualityLabs", center);
}

export function getQualityLabIdTag(id: number) {
  return getIdTag("qualityLabs", id);
}

export function revalidateQualityLabCache(id: number) {
  revalidateTag(getQualityLabGlobalTag());
  revalidateTag(getQualityLabIdTag(id));
}
