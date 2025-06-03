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
  commonName: string
) {
  const cropCommonNames = await db
    .insert(CropCommonNameTable)
    .values({ cropId, commonName })
    .returning();

  if (cropCommonNames == null)
    throw new Error("Failed to create crop common names");

  revalidateCropCommonNamesCache({ cropId });

  return cropCommonNames;
}

export async function updateCropCommonName(
  id: number,
  data: Partial<typeof CropCommonNameTable.$inferInsert>
) {
  const updatedCommonName = await db
    .update(CropCommonNameTable)
    .set({ commonName: data.commonName })
    .where(eq(CropCommonNameTable.id, id))
    .returning();

  if (updatedCommonName == null)
    throw new Error("Failed to update crop common name");

  revalidateCropCommonNamesCache({ cropId: updatedCommonName[0].cropId });

  return updatedCommonName;
}

export async function deleteCropCommonName(id: number) {
  const deletedCommonName = await db
    .delete(CropCommonNameTable)
    .where(eq(CropCommonNameTable.id, id))
    .returning();

  if (deletedCommonName == null)
    throw new Error("Failed to delete crop common name");

  revalidateCropCommonNamesCache({ cropId: deletedCommonName[0].cropId });

  return deletedCommonName;
}
