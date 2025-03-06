import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getStudyGlobalTag() {
  return getGlobalTag("studies");
}

export function getStudyIdTag(id: string | number) {
  return getIdTag("studies", id);
}

export function revalidateStudyCache(id: string | number) {
  revalidateTag(getStudyGlobalTag());
  revalidateTag(getStudyIdTag(id));
}
