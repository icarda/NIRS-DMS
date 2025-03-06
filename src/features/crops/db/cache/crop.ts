import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getCropGlobalTag() {
  return getGlobalTag("crops");
}

export function getCropIdTag(id: number) {
  return getIdTag("crops", id);
}

export function revalidateCropCache(id: number) {
  revalidateTag(getCropGlobalTag());
  revalidateTag(getCropIdTag(id));
}
