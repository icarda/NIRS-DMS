import { revalidateTag } from "next/cache";

import { getCropTag, getGlobalTag, getUserTag } from "@/lib/dataCache";

export function getStudyAccessGlobalTag() {
  return getGlobalTag("studyAccess");
}

export function getUserStudyAccesssTag(userId?: number) {
  if (userId == null) return getStudyAccessGlobalTag();
  return getUserTag("studyAccess", userId);
}

export function revalidateStudyAccessCache(userId: number) {
  revalidateTag(getStudyAccessGlobalTag());
  revalidateTag(getUserStudyAccesssTag(userId));
}
