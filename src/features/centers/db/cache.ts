import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getCenterGlobalTag() {
  return getGlobalTag("centers");
}

export function getCenterIdTag(id: number) {
  return getIdTag("centers", id);
}

export function revalidateCenterCache(id: number) {
  revalidateTag(getCenterGlobalTag());
  revalidateTag(getCenterIdTag(id));
}
