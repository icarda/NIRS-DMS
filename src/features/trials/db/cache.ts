import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getTrialGlobalTag() {
  return getGlobalTag("traits");
}

export function getTrialIdTag(id: number) {
  return getIdTag("traits", id);
}
export function revalidateTrialCache(id: number) {
  revalidateTag(getTrialGlobalTag());
  revalidateTag(getTrialIdTag(id));
}
