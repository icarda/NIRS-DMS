import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getNirModelGlobalTag() {
  return getGlobalTag("nirModels");
}

export function getNirModelIdTag(id: number) {
  return getIdTag("nirModels", id);
}

export function revalidateNirModelCache(id: number) {
  revalidateTag(getNirModelGlobalTag());
  revalidateTag(getNirModelIdTag(id));
}
