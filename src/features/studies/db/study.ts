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
      productType: true,
      qualityLab: true,
      nirModel: true,
      physiologicalStage: true,
    },
    columns: {
      id: true,
      studyCode: true,
      requesterEmail: true,
      requesterName: true,
      program: true,
      sampleDate: true,
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
  revalidateStudyCache(newStudy.studyCode);

  return newStudy;
}

export async function updateStudyById(
  studyId: number,
  updateData: Partial<
    Omit<typeof StudyTable.$inferInsert, "trialId" | "studyCode">
  >,
  tx: Omit<typeof db, "$client"> = db
) {
  const [updatedStudy] = await tx
    .update(StudyTable)
    .set(updateData)
    .where(eq(StudyTable.id, studyId))
    .returning();

  revalidateStudyCache(updatedStudy.studyCode);
  return updatedStudy;
}

export async function deleteStudy({ id }: { id: number }) {
  const [deletedStudy] = await db
    .delete(StudyTable)
    .where(eq(StudyTable.id, id))
    .returning();

  if (deletedStudy == null) throw new Error("Failed to delete study");
  revalidateStudyCache(deletedStudy.studyCode);

  return deletedStudy;
}

export async function getStudyMetadataByName(name: string) {
  "use cache";
  cacheTag(getStudyMetadataConfigTag(name));
  return db.query.StudyMetadataConfig.findFirst({
    where: eq(StudyMetadataConfig.name, name),
  });
}

export async function getStudyMetadataById(id: number) {
  "use cache";
  cacheTag(getStudyMetadataConfigTag(id));
  return db.query.StudyMetadataConfig.findFirst({
    where: eq(StudyMetadataConfig.id, id),
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

export async function updateStudyMetadataConfig(
  id: number,
  data: Partial<typeof StudyMetadataConfig.$inferInsert>
) {
  return await db.transaction(async (tx) => {
    const existing = await getStudyMetadataById(id);
    if (!existing) throw new Error("Metadata config not found");

    const oldName = existing.name;
    const oldType = existing.type;
    const oldDefault = existing.defaultValue;

    const newName = data.name ?? oldName;
    const newType = data.type ?? oldType;
    const newDefault = data.defaultValue ?? oldDefault;

    const nameChanged = newName !== oldName;
    const typeChanged = newType !== oldType;
    const defaultChanged =
      data.defaultValue !== undefined && data.defaultValue !== oldDefault;

    if (nameChanged && typeChanged && defaultChanged) {
      const valueToUse =
        data.defaultValue !== undefined
          ? data.defaultValue
          : getDefaultValueForType(newType);

      // Fix casting ambiguity for strings like date
      const castedValue = castToJsonbSqlLiteral(valueToUse, newType);

      await tx.execute(sql`
        UPDATE ${StudyTable}
        SET "additional_metadata" = jsonb_set(
          "additional_metadata" - ${oldName},
          ${sql`'{${sql.raw(newName)}}'`},
          ${castedValue}
        )
        WHERE "additional_metadata" ? ${oldName}
      `);
    } else if (nameChanged && typeChanged) {
      const fallbackDefault = getDefaultValueForType(newType);
      await tx.execute(sql`
        UPDATE ${StudyTable}
        SET "additional_metadata" = jsonb_set(
          "additional_metadata" - ${oldName},
          ${sql`'{${sql.raw(newName)}}'`},
          to_jsonb(${fallbackDefault})
        )
        WHERE "additional_metadata" ? ${oldName}
      `);
    } else if (!nameChanged && typeChanged) {
      const valueToUse =
        data.defaultValue !== undefined
          ? data.defaultValue
          : getDefaultValueForType(newType);

      const castedValue = castToJsonbSqlLiteral(valueToUse, newType);

      await tx.execute(sql`
        UPDATE ${StudyTable}
        SET "additional_metadata" = jsonb_set(
          "additional_metadata",
          ${sql`'{${sql.raw(oldName)}}'`},
          ${castedValue}
        )
        WHERE "additional_metadata" ? ${oldName}
      `);
    } else if (nameChanged && !typeChanged) {
      await tx.execute(sql`
      UPDATE ${StudyTable}
      SET "additional_metadata" = jsonb_set(
        "additional_metadata" - ${oldName},
        ${sql`'{${sql.raw(newName)}}'`},
        "additional_metadata"->${oldName}
      )
      WHERE "additional_metadata" ? ${oldName}
      `);
    }

    const updateData = {
      ...existing,
      ...data,
      name: newName,
      type: newType,
      defaultValue: typeChanged || defaultChanged ? newDefault : oldDefault,
    };

    const [updated] = await tx
      .update(StudyMetadataConfig)
      .set(updateData)
      .where(eq(StudyMetadataConfig.id, id))
      .returning();

    if (!updated) throw new Error("Failed to update study metadata config");

    revalidateStudyMetadataConfigCache(updated.name);
    return updated;
  });
}

function castToJsonbSqlLiteral(value: any, type: string) {
  if (value === null || value === undefined) return sql`'null'::jsonb`;

  switch (type) {
    case "number":
      return sql`to_jsonb(${sql.raw(`${Number(value)}::numeric`)})`;
    case "boolean":
      return sql`to_jsonb(${sql.raw(`${value === true || value === "true" ? "true" : "false"}::boolean`)})`;
    case "date":
      return sql`to_jsonb(${sql.raw(`'${value}'::text`)})`;
    case "string":
    default:
      return sql`to_jsonb(${sql.raw(`'${String(value)}'::text`)})`;
  }
}

function getDefaultValueForType(type: string) {
  switch (type) {
    case "number":
      return 0;
    case "string":
      return "";
    case "boolean":
      return false;
    case "date":
      return new Date().toISOString();
    default:
      return null;
  }
}
