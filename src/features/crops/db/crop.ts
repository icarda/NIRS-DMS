import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropCommonNameTable, CropTable } from "@/drizzle/schema";
import {
  getCropGlobalTag,
  getCropIdTag,
  revalidateCropCache,
} from "./cache/crop";

export async function getCrop(id: number) {
  "use cache";
  cacheTag(getCropIdTag(id));
  const crop = await db.query.CropTable.findFirst({
    where: eq(CropTable.id, id),
    with: {
      commonNames: true,
      species: true,
      productTypes: true,
      physiologicalStages: true,
      trials: true,
      cropTraits: true,
    },
  });
  return crop;
}

export async function getCrops({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getCropGlobalTag());
  const crops = await db.query.CropTable.findMany({
    limit,
    with: {
      commonNames: true,
      species: true,
      productTypes: true,
      physiologicalStages: true,
    },
  });
  return crops;
}

export async function insertCrop(
  data: typeof CropTable.$inferInsert,
  commonNames?: (typeof CropCommonNameTable.$inferInsert)[]
) {
  const [newCrop] = await db
    .insert(CropTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [CropTable.id],
      set: data,
    });

  if (newCrop == null) throw new Error("Failed to create crop");

  if (commonNames?.length) {
    await db.insert(CropCommonNameTable).values(
      commonNames.map((name) => ({
        ...name,
        cropId: newCrop.id,
      }))
    );
  }

  revalidateCropCache(newCrop.id);
  return newCrop;
}

export async function updateCrop(
  { id }: { id: number },
  data: Partial<typeof CropTable.$inferInsert>
) {
  const [updatedCrop] = await db
    .update(CropTable)
    .set(data)
    .where(eq(CropTable.id, id))
    .returning();

  if (updatedCrop == null) throw new Error("Failed to update crop");
  revalidateCropCache(updatedCrop.id);

  return updatedCrop;
}

export async function deleteCrop({ id }: { id: number }) {
  const [deletedCrop] = await db
    .delete(CropTable)
    .where(eq(CropTable.id, id))
    .returning();

  if (deletedCrop == null) throw new Error("Failed to delete crop");
  revalidateCropCache(deletedCrop.id);

  return deletedCrop;
}
