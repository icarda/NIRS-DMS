import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropTraitTable } from "@/drizzle/schema";
import { revalidateCropCache } from "@/features/crops/db/cache/crop";
import {
  getCropCropTraitsTag,
  revalidateCropTraitCache,
} from "./cache/cropTrait";

export async function getCropTraitIdMapForTraits(
  cropId: number,
  traitVariables: string[]
): Promise<
  Map<string, { id: number; min: number | null; max: number | null }>
> {
  "use cache";
  cacheTag(getCropCropTraitsTag(cropId));
  if (!traitVariables || traitVariables.length === 0) return new Map();

  const cropTraits = await db
    .select({
      id: CropTraitTable.id,
      name: CropTraitTable.traitVariable,
      minimumAllowed: CropTraitTable.minimumAllowed,
      maximumAllowed: CropTraitTable.maximumAllowed,
    })
    .from(CropTraitTable)
    .where(
      and(
        eq(CropTraitTable.cropId, cropId),
        inArray(CropTraitTable.traitVariable, traitVariables)
      )
    );

  const map = new Map<
    string,
    { id: number; min: number | null; max: number | null }
  >();
  cropTraits.forEach((ct) =>
    map.set(ct.name, {
      id: ct.id,
      min: ct.minimumAllowed,
      max: ct.maximumAllowed,
    })
  );

  return map;
}

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
  revalidateCropCache(newCropTrait.cropId);

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
