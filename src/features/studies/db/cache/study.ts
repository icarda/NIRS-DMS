import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getStudyGlobalTag() {
  return getGlobalTag("studies");
}

export function getStudyIdTag(id: string | number) {
  return getIdTag("studies", id);
}

export function getStudyMetadataConfigGlobalTag() {
  return getGlobalTag("studyMetadataConfig");
}

export function getStudyMetadataConfigTag(name: string) {
  return getIdTag("studyMetadataConfig", name);
}

export function revalidateStudyCache(id: string | number) {
  revalidateTag(getStudyGlobalTag());
  revalidateTag(getStudyIdTag(id));
}

export function revalidateStudyMetadataConfigCache(name: string) {
  revalidateTag(getStudyMetadataConfigGlobalTag());
  revalidateTag(getStudyMetadataConfigTag(name));
}
