import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { TraitTable } from "@/drizzle/schema";

import "./cache/cropTrait";

import {
  getCropCropTraitsTag,
  revalidateCropTraitCache,
} from "./cache/cropTrait";

export async function getCropTraits({ cropId }: { cropId: number }) {
  "use cache";
  cacheTag(getCropCropTraitsTag(cropId));
  const cropTraits = await db.query.TraitTable.findMany({
    where: eq(TraitTable.cropId, cropId),
  });
  return cropTraits;
}

export async function insertCropTrait(data: typeof TraitTable.$inferInsert) {
  const [newCropTrait] = await db
    .insert(TraitTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [TraitTable.id],
      set: data,
    });

  if (newCropTrait == null) throw new Error("Failed to create trait");
  revalidateCropTraitCache(newCropTrait.cropId);

  return newCropTrait;
}

export async function deleteCropTrait({ id }: { id: number }) {
  const [deletedCropTrait] = await db
    .delete(TraitTable)
    .where(eq(TraitTable.id, id))
    .returning();

  if (deletedCropTrait == null) throw new Error("Failed to delete trait");
  revalidateCropTraitCache(deletedCropTrait.cropId);

  return deletedCropTrait;
}
