import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropTraitTable } from "@/drizzle/schema";
import {
  getCropCropTraitsTag,
  revalidateCropTraitCache,
} from "./cache/cropTrait";

export async function getCropTraits({ cropId }: { cropId: number }) {
  "use cache";
  cacheTag(getCropCropTraitsTag(cropId));
  const cropTraits = await db.query.CropTraitTable.findMany({
    where: eq(CropTraitTable.cropId, cropId),
  });
  return cropTraits;
}

export async function insertCropTrait(
  data: typeof CropTraitTable.$inferInsert
) {
  const [newCropTrait] = await db
    .insert(CropTraitTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [CropTraitTable.id],
      set: data,
    });

  if (newCropTrait == null) throw new Error("Failed to create trait");
  revalidateCropTraitCache(newCropTrait.cropId);

  return newCropTrait;
}

export async function deleteCropTrait({ id }: { id: number }) {
  const [deletedCropTrait] = await db
    .delete(CropTraitTable)
    .where(eq(CropTraitTable.id, id))
    .returning();

  if (deletedCropTrait == null) throw new Error("Failed to delete trait");
  revalidateCropTraitCache(deletedCropTrait.cropId);

  return deletedCropTrait;
}
