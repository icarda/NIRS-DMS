import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { TrialFertilizerTable, TrialTable } from "@/drizzle/schema";
import {
  getTrialGlobalTag,
  getTrialIdTag,
  revalidateTrialCache,
} from "./cache";

export async function getTrialByName(name: string) {
  "use cache";
  cacheTag(getTrialIdTag(name));
  const trial = await db.query.TrialTable.findFirst({
    where: eq(TrialTable.name, name),
    columns: {
      id: true,
    },
  });
  return trial;
}

export async function getTrial(id: number) {
  "use cache";
  cacheTag(getTrialIdTag(id));
  const trial = await db.query.TrialTable.findFirst({
    where: eq(TrialTable.id, id),
    with: {
      crop: true,
      fertilizers: true,
    },
  });
  return trial;
}

export async function getTrials({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getTrialGlobalTag());
  const trials = await db.query.TrialTable.findMany({
    limit,
    with: {
      crop: {
        with: { species: true },
      },
      fertilizers: true,
    },
  });
  return trials;
}

export async function insertTrial(
  data: typeof TrialTable.$inferInsert,
  fertilizers?: Omit<typeof TrialFertilizerTable.$inferInsert, "trialId">[],
  trx: Omit<typeof db, "$client"> = db
) {
  const [newTrial] = await trx
    .insert(TrialTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [TrialTable.id],
      set: data,
    });

  if (newTrial == null) throw new Error("Failed to create trial");

  if (fertilizers?.length) {
    await trx.insert(TrialFertilizerTable).values(
      fertilizers.map((fertilizer) => ({
        ...fertilizer,
        trialId: newTrial.id,
      }))
    );
  }

  revalidateTrialCache(newTrial.name);
  return newTrial;
}

export async function updateTrial(
  { id }: { id: number },
  data: Partial<typeof TrialTable.$inferInsert>
) {
  const [updatedTrial] = await db
    .update(TrialTable)
    .set(data)
    .where(eq(TrialTable.id, id))
    .returning();

  if (updatedTrial == null) throw new Error("Failed to update trial");
  revalidateTrialCache(updatedTrial.id);

  return updatedTrial;
}

export async function deleteTrial({ id }: { id: number }) {
  const [deletedTrial] = await db
    .delete(TrialTable)
    .where(eq(TrialTable.id, id))
    .returning();

  if (deletedTrial == null) throw new Error("Failed to delete trial");
  revalidateTrialCache(deletedTrial.id);

  return deletedTrial;
}
