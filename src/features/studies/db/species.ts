import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { TrialSpeciesTable } from "@/drizzle/schema";
import { getSpeciesIdTag, revalidateSpeciesCache } from "./cache/species";

export async function getSpeciesById(id: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(id));
  const species = await db.query.SpeciesTable.findFirst({
    where: (species) => eq(species.id, id),
    columns: {
      id: true,
      name: true,
    },
  });
  return species;
}

export async function getTrialSpecies(trialId: number, speciesId: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(speciesId));
  const trialSpecies = await db.query.TrialSpeciesTable.findFirst({
    where: (trialSpecies) =>
      and(
        eq(trialSpecies.trialId, trialId),
        eq(trialSpecies.speciesId, speciesId)
      ),
    columns: {
      trialId: true,
      speciesId: true,
    },
  });
  return trialSpecies;
}

export async function insertTrialSpecies(
  data: typeof TrialSpeciesTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const [newTrialSpecies] = await trx
    .insert(TrialSpeciesTable)
    .values(data)
    .returning();

  if (newTrialSpecies == null)
    throw new Error("Failed to create trial species");
  revalidateSpeciesCache(newTrialSpecies.speciesId, data.trialId);

  return newTrialSpecies;
}
