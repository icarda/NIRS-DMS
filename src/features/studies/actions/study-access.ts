"use server";

import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { StudyTable, UserStudyAccess } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import { getUserStudyAccesssTag } from "../db/cache/study-access";
import { updateUserStudyAccessByCode } from "../db/studyAccesses";

export async function updateUserStudyAccessAction(
  userId: number,
  studyCodes: string[]
) {
  try {
    const currentUser = await getCurrentUser();
    if (!hasPermission(currentUser?.role, "studyAccess:update")) {
      return { error: true, message: "Permission denied." };
    }

    await updateUserStudyAccessByCode(userId, studyCodes);

    return { error: false, message: "Study access updated successfully." };
  } catch (err) {
    console.error("Failed to update study access:", err);
    return { error: true, message: "Failed to update study access." };
  }
}

export async function getUserStudyAccessCodes(userId: number) {
  "use cache";
  cacheTag(getUserStudyAccesssTag(userId));
  const results = await db
    .select({ studyCode: StudyTable.studyCode })
    .from(UserStudyAccess)
    .innerJoin(StudyTable, eq(UserStudyAccess.studyId, StudyTable.id))
    .where(eq(UserStudyAccess.userId, userId));

  return results.map((r) => r.studyCode);
}
