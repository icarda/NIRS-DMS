import { db } from "@/drizzle/db";
import { MetadataAction, metadataLog, MetadataScope } from "@/drizzle/schema";

export async function logMetadataAction(
  {
    userId,
    action,
    scope,
    target,
    before,
    after,
  }: {
    userId: number;
    action: MetadataAction;
    scope: MetadataScope;
    target: string;
    before?: object;
    after?: object;
  },
  trx: Omit<typeof db, "$client"> = db
) {
  await trx.insert(metadataLog).values({
    userId,
    action,
    scope,
    target,
    before: before ? JSON.stringify(before) : "",
    after: after ? JSON.stringify(after) : "",
  });
}
