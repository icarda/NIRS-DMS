import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { StudyTable } from "@/drizzle/schema";
import { StudyMetadataConfig } from "@/drizzle/schemas/study-metadata-config";
import {
  getStudyGlobalTag,
  getStudyIdTag,
  getStudyMetadataConfigGlobalTag,
  getStudyMetadataConfigTag,
  revalidateStudyCache,
  revalidateStudyMetadataConfigCache,
} from "./cache/study";

export async function getStudies() {
  "use cache";
  cacheTag(getStudyGlobalTag());
  const studies = await db.query.StudyTable.findMany({
    with: {
      trial: {
        with: {
          crop: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    columns: {
      id: true,
      studyCode: true,
    },
  });
  return studies;
}

export async function getStudyByCode(studyCode: string) {
  "use cache";
  cacheTag(getStudyIdTag(studyCode));
  const study = await db.query.StudyTable.findFirst({
    where: eq(StudyTable.studyCode, studyCode),
  });
  return study;
}

export async function insertStudy(
  data: typeof StudyTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const existingStudy = await getStudyByCode(data.studyCode);
  if (existingStudy) {
    throw new Error(
      `Study with code ${data.studyCode} already exists in this quality lab`
    );
  }

  const [newStudy] = await trx.insert(StudyTable).values(data).returning();

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

export async function getStudyMetadataByName(name: string) {
  "use cache";
  cacheTag(getStudyMetadataConfigTag(name));
  return db.query.StudyMetadataConfig.findFirst({
    where: eq(StudyMetadataConfig.name, name),
  });
}

export async function getStudyConfigMetadatas() {
  "use cache";
  cacheTag(getStudyMetadataConfigGlobalTag());
  const studies = await db.query.StudyMetadataConfig.findMany();
  return studies;
}

export async function deleteStudyMetadataConfig(
  name: string,
  trx: Omit<typeof db, "$client"> = db
) {
  await trx
    .delete(StudyMetadataConfig)
    .where(eq(StudyMetadataConfig.name, name));

  revalidateStudyMetadataConfigCache(name);
}

export async function removeJsonKeyFromAllStudies(
  key: string,
  trx: Omit<typeof db, "$client"> = db
) {
  await trx.execute(sql`
    UPDATE ${StudyTable}
    SET additional_metadata = additional_metadata - ${key}
    WHERE additional_metadata ? ${key}
  `);

  revalidateTag(getStudyGlobalTag());
}

export async function insertStudyMetadataConfig(
  data: typeof StudyMetadataConfig.$inferInsert
) {
  await db.transaction(async (tx) => {
    // Insert metadata config
    const [newStudyMetadata] = await tx
      .insert(StudyMetadataConfig)
      .values(data)
      .returning();

    if (!newStudyMetadata) {
      throw new Error("Failed to create study metadata config");
    }

    let typedValue: unknown = data.defaultValue;

    try {
      switch (data.type) {
        case "number":
          typedValue = Number(data.defaultValue);
          break;
        case "boolean":
          typedValue = data.defaultValue === "true";
          break;
        case "date":
          typedValue = new Date(data.defaultValue).toISOString();
          break;
        case "array":
          typedValue = JSON.parse(data.defaultValue);
          break;
        case "string":
        default:
          typedValue = data.defaultValue;
      }
    } catch (err) {
      console.error("Invalid defaultValue format:", err);
      throw new Error("Invalid defaultValue for type: " + data.type);
    }

    await tx.execute(
      sql`
    UPDATE ${StudyTable}
    SET additional_metadata = COALESCE(additional_metadata, '{}'::jsonb)
    || ${sql`${sql.param(JSON.stringify({ [data.name]: typedValue }))}::jsonb`}
    `
    );

    // Optional: revalidate cache
    revalidateStudyMetadataConfigCache(newStudyMetadata.name);

    return newStudyMetadata;
  });
}
