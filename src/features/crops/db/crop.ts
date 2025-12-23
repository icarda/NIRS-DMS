import { eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import {
  CenterTable,
  CropTable,
  QualityLabTable,
  StudyTable,
  TrialTable,
} from "@/drizzle/schema";
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

export async function getCropByName(name: string) {
  "use cache";
  const crop = await db.query.CropTable.findFirst({
    where: eq(CropTable.name, name),
    with: {
      productTypes: true,
    },
  });
  cacheTag(getCropIdTag(crop?.id as number));
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
      cropTraits: true,
    },
  });
  return crops;
}

export async function getCropsByCenter(centerName: string) {
  "use cache";
  cacheTag(getCropGlobalTag());
  
  // Subquery: find all cropIds from trials linked to studies in the center's quality labs
  const cropIdsQuery = db
    .selectDistinct({ cropId: TrialTable.cropId })
    .from(TrialTable)
    .innerJoin(StudyTable, eq(StudyTable.trialId, TrialTable.id))
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
    .where(eq(CenterTable.acronym, centerName));

  const cropIds = await cropIdsQuery;
  
  if (cropIds.length === 0) {
    return [];
  }

  // Then query crops with all nested relations
  const crops = await db.query.CropTable.findMany({
    where: inArray(
      CropTable.id,
      cropIds.map((c) => c.cropId)
    ),
    with: {
      commonNames: true,
      species: true,
      productTypes: true,
      physiologicalStages: true,
      cropTraits: true,
    },
  });
  
  return crops;
}

export async function insertCrop(data: typeof CropTable.$inferInsert) {
  const [newCrop] = await db
    .insert(CropTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [CropTable.id],
      set: data,
    });

  if (newCrop == null) throw new Error("Failed to create crop");

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
