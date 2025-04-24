import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { NirsDataTable } from "@/drizzle/schema";
import { revalidateNIRSDataCache } from "./cache";

export async function insertNirsDataBatch(
  data: (typeof NirsDataTable.$inferInsert)[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx.insert(NirsDataTable).values(data).onConflictDoNothing();

  if (data.length > 0) revalidateNIRSDataCache(data[0].studyId);
}

export async function getDistinctSampleIdsForStudy(
  studyId: number
): Promise<number[]> {
  if (isNaN(studyId) || studyId <= 0) {
    return [];
  }
  try {
    const results = await db
      .selectDistinct({ sampleId: NirsDataTable.sampleId })
      .from(NirsDataTable)
      .where(eq(NirsDataTable.studyId, studyId));

    return results.map((r) => r.sampleId);
  } catch (error) {
    throw new Error(
      "Database error fetching existing sample IDs for consistency check."
    );
  }
}
