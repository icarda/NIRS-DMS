import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { getCropIdTag } from "./crop";

export function getCropCommonNamesGlobalTag() {
  return getGlobalTag("cropCommonNames");
}

export function getCropCommonNamesCropTag(cropId: number) {
  return getIdTag("cropCommonNames", `crop:${cropId}`);
}

export function revalidateCropCommonNamesCache({ cropId }: { cropId: number }) {
  revalidateTag(getCropCommonNamesGlobalTag());
  revalidateTag(getCropCommonNamesCropTag(cropId));
  revalidateTag(getCropIdTag(cropId));
}
