import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { PhysiologicalStageTable } from "@/drizzle/schema";
import { revalidateCropCache } from "@/features/crops/db/cache/crop";
import {
  getCropPhysiologicalStageTag,
  revalidatePhysiologicalStageCache,
} from "./cache/physiological-stage";

export async function getPhysiologicalStages(cropId?: number) {
  "use cache";
  if (cropId == null) {
    cacheTag(getCropPhysiologicalStageTag());
    return db.query.PhysiologicalStageTable.findMany({
      with: {
        crop: true,
      },
      orderBy: (stages, { asc }) => [asc(stages.name)],
    });
  }
  cacheTag(getCropPhysiologicalStageTag(cropId));
  return db.query.PhysiologicalStageTable.findMany({
    where: eq(PhysiologicalStageTable.cropId, cropId),
    with: {
      crop: true,
    },
    orderBy: (stages, { asc }) => [asc(stages.name)],
  });
}

export async function insertPhysiologicalStage(
  data: typeof PhysiologicalStageTable.$inferInsert
) {
  const [newPhysiologicalStage] = await db
    .insert(PhysiologicalStageTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [PhysiologicalStageTable.id],
      set: data,
    });

  if (newPhysiologicalStage == null)
    throw new Error("Failed to create Physiological Stage");
  revalidatePhysiologicalStageCache(newPhysiologicalStage.id);
  revalidateCropCache(newPhysiologicalStage.cropId);

  return newPhysiologicalStage;
}

export async function deletePhysiologicalStage({ id }: { id: number }) {
  const [deletedPhysiologicalStage] = await db
    .delete(PhysiologicalStageTable)
    .where(eq(PhysiologicalStageTable.id, id))
    .returning();

  if (deletedPhysiologicalStage == null)
    throw new Error("Failed to delete study");
  revalidatePhysiologicalStageCache(deletedPhysiologicalStage.id);

  return deletedPhysiologicalStage;
}

export async function updatePhysiologicalStage(
  id: number,
  data: Partial<typeof PhysiologicalStageTable.$inferInsert>
) {
  const [updatedPhysiologicalStage] = await db
    .update(PhysiologicalStageTable)
    .set(data)
    .where(eq(PhysiologicalStageTable.id, id))
    .returning();

  if (updatedPhysiologicalStage == null) {
    throw new Error("Failed to update Physiological Stage");
  }

  revalidatePhysiologicalStageCache(updatedPhysiologicalStage.id);
  revalidateCropCache(updatedPhysiologicalStage.cropId);

  return updatedPhysiologicalStage;
}