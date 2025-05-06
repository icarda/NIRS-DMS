import { revalidateTag } from "next/cache";

import { getCropTag, getGlobalTag } from "@/lib/dataCache";

export function getPhysiologicalStageGlobalTag() {
  return getGlobalTag("productTypes");
}

export function getCropPhysiologicalStageTag(cropId?: number) {
  if (cropId == null) return getPhysiologicalStageGlobalTag();
  return getCropTag("productTypes", cropId);
}

export function revalidatePhysiologicalStageCache(id: number) {
  revalidateTag(getPhysiologicalStageGlobalTag());
  revalidateTag(getCropPhysiologicalStageTag(id));
}
