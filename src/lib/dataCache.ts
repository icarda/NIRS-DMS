export type ValidTags =
  | ReturnType<typeof getGlobalTag>
  | ReturnType<typeof getUserTag>
  | ReturnType<typeof getIdTag>
  | ReturnType<typeof getCenterTag>;

type CACHE_TAG =
  | "users"
  | "studies"
  | "centers"
  | "trials"
  | "crops"
  | "nirsData"
  | "nirModels"
  | "traits"
  | "qualityLabs"
  | "cropCommonNames"
  | "species"
  | "productTypes"
  | "physiologicalStages"
  | "cropTraits"
  | "trialFertilizers";

export function getGlobalTag(tag: CACHE_TAG) {
  return `global:${tag}` as const;
}

export function getUserTag(tag: CACHE_TAG, userId: number) {
  return `user:${userId}-${tag}` as const;
}

export function getIdTag(tag: CACHE_TAG, id: number | string) {
  return `id:${id}-${tag}` as const;
}

export function getCenterTag(tag: CACHE_TAG, centerId: number) {
  return `center:${centerId}-${tag}` as const;
}

export function getCropTag(tag: CACHE_TAG, cropId: number) {
  return `crop:${cropId}-${tag}` as const;
}
