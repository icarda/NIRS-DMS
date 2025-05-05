import { revalidateTag } from "next/cache";

import { getCropTag, getGlobalTag } from "@/lib/dataCache";

export function getProductTypeGlobalTag() {
  return getGlobalTag("productTypes");
}

export function getCropProductTypesTag(cropId?: number) {
  if (cropId == null) return getProductTypeGlobalTag();
  return getCropTag("productTypes", cropId);
}

export function revalidateProductTypeCache(id: number) {
  revalidateTag(getProductTypeGlobalTag());
  revalidateTag(getCropProductTypesTag(id));
}
