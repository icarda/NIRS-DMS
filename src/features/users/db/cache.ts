import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: number) {
  return getIdTag("users", id);
}

export function revalidateUserCache(id: number) {
  revalidateTag(getUserGlobalTag());
  revalidateTag(getUserIdTag(id));
}
