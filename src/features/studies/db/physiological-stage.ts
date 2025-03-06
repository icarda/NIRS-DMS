import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { PhysiologicalStageTable } from "@/drizzle/schema";
import { getCropPhysiologicalStageTag } from "./cache/physiological-stage";

export async function getPhysiologicalStages(cropId: number) {
  "use cache";
  cacheTag(getCropPhysiologicalStageTag(cropId));
  return db.query.PhysiologicalStageTable.findMany({
    where: eq(PhysiologicalStageTable.cropId, cropId),
    with: {
      crop: true,
    },
    orderBy: (stages, { asc }) => [asc(stages.name)],
  });
}
