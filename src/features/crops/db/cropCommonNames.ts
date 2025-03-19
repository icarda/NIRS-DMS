import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropCommonNameTable, CropTable } from "@/drizzle/schema";
import {
  getCropCommonNamesCropTag,
  revalidateCropCommonNamesCache,
} from "./cache/cropCommonNames";

export async function getCropCommonNames(cropId: number) {
  "use cache";
  cacheTag(getCropCommonNamesCropTag(cropId));
  const cropCommonNames = await db.query.CropTable.findFirst({
    where: eq(CropTable.id, cropId),
  });
  return cropCommonNames;
}

export async function insertCropCommonNames(
  cropId: number,
  commonNames: string[]
) {
  const cropCommonNames = await db
    .insert(CropCommonNameTable)
    .values(commonNames.map((commonName) => ({ cropId, commonName })))
    .returning();

  if (cropCommonNames == null)
    throw new Error("Failed to create crop common names");

  revalidateCropCommonNamesCache({ cropId });

  return cropCommonNames;
}
