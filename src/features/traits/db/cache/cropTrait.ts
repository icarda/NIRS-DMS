import { revalidateTag } from "next/cache";

import { getCropTag, getGlobalTag } from "@/lib/dataCache";

export function getCropTraitGlobalTag() {
  return getGlobalTag("cropTraits");
}

export function getCropCropTraitsTag(cropId: number) {
  return getCropTag("cropTraits", cropId);
}

export function revalidateCropTraitCache(id: number) {
  revalidateTag(getCropTraitGlobalTag());
  revalidateTag(getCropCropTraitsTag(id));
}
