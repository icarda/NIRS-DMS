import { revalidateTag } from "next/cache";

import {
  getCenterTag,
  getGlobalTag,
  getIdTag,
  getStudyTag,
} from "@/lib/dataCache";

export function getNIRSDataGlobalTag() {
  return getGlobalTag("nirsData");
}

export function getNIRSDatasByCenterTag(centerId: number) {
  return getCenterTag("nirsData", centerId);
}

export function getNIRSDatasByStudyTag(studyId: number) {
  return getStudyTag("nirsData", studyId);
}

export function getNIRSDataIdTag(id: number) {
  return getIdTag("nirsData", id);
}

export function revalidateNIRSDataCache(studyId: number) {
  revalidateTag(getNIRSDataGlobalTag());
  revalidateTag(getNIRSDatasByStudyTag(studyId));
}
