import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getAuthGlobalTag() {
  return getGlobalTag("auth-clients");
}

export function getAuthIdTag(id: string) {
  return getIdTag("auth-clients", id);
}

export function revalidateAuthCache(id: string) {
  revalidateTag(getAuthGlobalTag());
  revalidateTag(getAuthIdTag(id));
}
