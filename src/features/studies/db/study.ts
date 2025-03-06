import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { StudyTable } from "@/drizzle/schema";
import { getStudyIdTag, revalidateStudyCache } from "./cache/study";

export async function getStudyByCode(studyCode: string, qualityLabId: number) {
  "use cache";
  cacheTag(getStudyIdTag(studyCode));
  const study = await db.query.StudyTable.findFirst({
    where: (studies, { and, eq }) =>
      and(
        eq(studies.studyCode, studyCode),
        eq(studies.qualityLabId, qualityLabId)
      ),
  });
  return study;
}

export async function insertStudy(data: typeof StudyTable.$inferInsert) {
  const existingStudy = await getStudyByCode(data.studyCode, data.qualityLabId);
  if (existingStudy) {
    throw new Error(
      `Study with code ${data.studyCode} already exists in this quality lab`
    );
  }

  const [newStudy] = await db.insert(StudyTable).values(data).returning();

  if (newStudy == null) throw new Error("Failed to create study");
  revalidateStudyCache(newStudy.id);

  return newStudy;
}

export async function deleteStudy({ id }: { id: number }) {
  const [deletedStudy] = await db
    .delete(StudyTable)
    .where(eq(StudyTable.id, id))
    .returning();

  if (deletedStudy == null) throw new Error("Failed to delete study");
  revalidateStudyCache(deletedStudy.id);

  return deletedStudy;
}
