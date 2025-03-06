import { revalidateTag } from "next/cache";

import { getCropTag, getGlobalTag } from "@/lib/dataCache";

export function getTraitGlobalTag() {
  return getGlobalTag("traits");
}

export function getCropTraitTag(cropId: number) {
  return getCropTag("traits", cropId);
}

export function revalidateTraitCache(id: number) {
  revalidateTag(getTraitGlobalTag());
  revalidateTag(getCropTraitTag(id));
}
