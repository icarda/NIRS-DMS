import { get } from "http";

import { eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { StudyTable, UserStudyAccess } from "@/drizzle/schema";
import { revalidateUserCache } from "@/features/users/db/cache";
import {
  getUserStudyAccesssTag,
  revalidateStudyAccessCache,
} from "./cache/study-access";

export async function getUserStudyAccessCodes(
  userId: number
): Promise<string[]> {
  "use cache";

  cacheTag(getUserStudyAccesssTag(userId));

  const accesses = await db
    .select({ studyCode: StudyTable.studyCode })
    .from(UserStudyAccess)
    .innerJoin(StudyTable, eq(UserStudyAccess.studyId, StudyTable.id))
    .where(eq(UserStudyAccess.userId, userId));

  return accesses.map((entry) => entry.studyCode);
}

export async function updateUserStudyAccessByCode(
  userId: number,
  studyCodes: string[]
): Promise<void> {
  const studies = await db
    .select({ id: StudyTable.id, studyCode: StudyTable.studyCode })
    .from(StudyTable)
    .where(inArray(StudyTable.studyCode, studyCodes));

  await db.transaction(async (tx) => {
    await tx.delete(UserStudyAccess).where(eq(UserStudyAccess.userId, userId));

    if (studies.length > 0) {
      await tx.insert(UserStudyAccess).values(
        studies.map((study) => ({
          userId,
          studyId: study.id,
        }))
      );
    }
  });

  revalidateUserCache(userId);
  revalidateStudyAccessCache(userId);
}
