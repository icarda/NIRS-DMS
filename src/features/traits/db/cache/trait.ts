import { revalidateTag } from "next/cache";

import { getCropTraitTag, getGlobalTag } from "@/lib/dataCache";

export function getTraitGlobalTag() {
  return getGlobalTag("traits");
}

export function getTraitTag(cropTraitId: number) {
  return getCropTraitTag("traits", cropTraitId);
}

export function revalidateTraitCache(id?: number) {
  revalidateTag(getTraitGlobalTag());
  if (id == null) return;
  revalidateTag(getTraitTag(id));
}
