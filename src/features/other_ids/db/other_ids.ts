import { db } from "@/drizzle/db";
import { OtherIdsTable } from "@/drizzle/schema";

type OtherIdInsertData = Pick<
  typeof OtherIdsTable.$inferInsert,
  "sampleId" | "plotId" | "gid" | "studyId"
>;

export async function insertOtherIdsBatch(
  data: OtherIdInsertData[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx
    .insert(OtherIdsTable)
    .values(data)

    .onConflictDoNothing({
      target: [OtherIdsTable.sampleId, OtherIdsTable.plotId, OtherIdsTable.gid],
    });
}
