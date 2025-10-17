import { eq, inArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import {
  CenterTable,
  QualityLabTable,
  StudyTable,
  TrialFertilizerTable,
  TrialMetadataConfig,
  TrialTable,
} from "@/drizzle/schema";
import {
  getTrialGlobalTag,
  getTrialIdTag,
  getTrialMetadataConfigGlobalTag,
  getTrialMetadataConfigTag,
  revalidateTrialCache,
  revalidateTrialMetadataConfigCache,
} from "./cache";

export async function getTrialConfigMetadatas(
  trx: Omit<typeof db, "$client"> = db
) {
  "use cache";
  cacheTag(getTrialMetadataConfigGlobalTag());
  const trials = await trx.query.TrialMetadataConfig.findMany();
  return trials;
}

export async function getTrialByName(
  name: string,
  trx: Omit<typeof db, "$client"> = db
) {
  const trial = await trx.query.TrialTable.findFirst({
    where: eq(TrialTable.name, name),
    columns: {
      id: true,
    },
  });
  return trial;
}

export async function getTrial(id: number) {
  "use cache";
  cacheTag(getTrialIdTag(id));
  const trial = await db.query.TrialTable.findFirst({
    where: eq(TrialTable.id, id),
    with: {
      crop: true,
      fertilizers: true,
    },
  });
  return trial;
}

export async function getTrialsByCenter(centerName: string, limit = 50) {
  // Subquery: find all trialIds linked to that center
  const trialIdsQuery = db
    .select({ trialId: StudyTable.trialId })
    .from(StudyTable)
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
    .where(eq(CenterTable.acronym, centerName));

  // Then query trials with all nested relations
  const trials = await db.query.TrialTable.findMany({
    where: inArray(TrialTable.id, trialIdsQuery),
    limit,
    with: {
      crop: {
        with: {
          species: true,
        },
      },
      fertilizers: true,
    },
  });

  return trials;
}

export async function getTrials({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getTrialGlobalTag());
  const trials = await db.query.TrialTable.findMany({
    limit,
    with: {
      crop: {
        with: { species: true },
      },
      fertilizers: true,
    },
  });
  return trials;
}

export async function insertTrial(
  data: typeof TrialTable.$inferInsert,
  fertilizers?: Omit<typeof TrialFertilizerTable.$inferInsert, "trialId">[],
  trx: Omit<typeof db, "$client"> = db
) {
  const [newTrial] = await trx
    .insert(TrialTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [TrialTable.id],
      set: data,
    });

  if (newTrial == null) throw new Error("Failed to create trial");

  if (fertilizers?.length) {
    await trx.insert(TrialFertilizerTable).values(
      fertilizers.map((fertilizer) => ({
        ...fertilizer,
        trialId: newTrial.id,
      }))
    );
  }

  revalidateTrialCache(newTrial.name);
  return newTrial;
}

export async function updateTrial(
  { id }: { id: number },
  data: Partial<typeof TrialTable.$inferInsert>,
  fertilizers?: Omit<typeof TrialFertilizerTable.$inferInsert, "trialId">[]
) {
  const existingTrial = await db
    .select()
    .from(TrialTable)
    .where(eq(TrialTable.id, id))
    .limit(1)
    .execute();

  if (!existingTrial.length) throw new Error("Trial not found");
  const existingMetadata = existingTrial[0]
    .additionalMetadata as unknown as Record<string, any>;

  if (data.additionalMetadata) {
    const updatedMetadata = {
      ...existingMetadata,
      ...data.additionalMetadata,
    };

    await db
      .update(TrialTable)
      .set({ ...data, additionalMetadata: updatedMetadata })
      .where(eq(TrialTable.id, id));
  }

  if (fertilizers && fertilizers.length > 0 && fertilizers[0].type !== "") {
    await db
      .delete(TrialFertilizerTable)
      .where(eq(TrialFertilizerTable.trialId, id));
    await db.insert(TrialFertilizerTable).values(
      fertilizers.map((fertilizer) => ({
        ...fertilizer,
        trialId: id,
      }))
    );
  }

  const [updatedTrial] = await db
    .select()
    .from(TrialTable)
    .where(eq(TrialTable.id, id))
    .execute();

  if (!updatedTrial) throw new Error("Failed to update trial");

  revalidateTrialCache(updatedTrial.id);

  return updatedTrial;
}

export async function deleteTrial({ id }: { id: number }) {
  const [deletedTrial] = await db
    .delete(TrialTable)
    .where(eq(TrialTable.id, id))
    .returning();

  if (deletedTrial == null) throw new Error("Failed to delete trial");
  revalidateTrialCache(deletedTrial.id);

  return deletedTrial;
}

export async function insertTrialMetadataConfig(
  data: typeof TrialMetadataConfig.$inferInsert
) {
  await db.transaction(async (tx) => {
    const [newTrialMetadata] = await tx
      .insert(TrialMetadataConfig)
      .values(data)
      .returning();

    if (!newTrialMetadata) {
      throw new Error("Failed to create trial metadata config");
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
          const date = new Date(data.defaultValue);
          typedValue = isNaN(date.getTime())
            ? new Date().toISOString() // fallback to today if invalid
            : date.toISOString();
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
    UPDATE ${TrialTable}
    SET additional_metadata = COALESCE(additional_metadata, '{}'::jsonb)
    || ${sql`${sql.param(JSON.stringify({ [data.name]: typedValue }))}::jsonb`}
    `
    );

    revalidateTrialMetadataConfigCache(newTrialMetadata.name);

    return newTrialMetadata;
  });
}

export async function updateTrialMetadataConfig(
  id: number,
  data: Partial<typeof TrialMetadataConfig.$inferInsert>
) {
  return await db.transaction(async (tx) => {
    const existing = await getTrialMetadataById(id);
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
        UPDATE ${TrialTable}
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
        UPDATE ${TrialTable}
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
        UPDATE ${TrialTable}
        SET "additional_metadata" = jsonb_set(
          "additional_metadata",
          ${sql`'{${sql.raw(oldName)}}'`},
          ${castedValue}
        )
        WHERE "additional_metadata" ? ${oldName}
      `);
    } else if (nameChanged && !typeChanged) {
      await tx.execute(sql`
      UPDATE ${TrialTable}
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
      .update(TrialMetadataConfig)
      .set(updateData)
      .where(eq(TrialMetadataConfig.id, id))
      .returning();

    if (!updated) throw new Error("Failed to update trial metadata config");

    revalidateTrialMetadataConfigCache(updated.name);
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
      return sql`to_jsonb(${sql.raw(`'${value}'::text`)})`; // Store as ISO string
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
      return new Date().toISOString(); // Or null if you prefer
    default:
      return null;
  }
}

export async function getTrialMetadataByName(name: string) {
  "use cache";
  cacheTag(getTrialMetadataConfigTag(name));
  return db.query.TrialMetadataConfig.findFirst({
    where: eq(TrialMetadataConfig.name, name),
  });
}

export async function getTrialMetadataById(id: number) {
  "use cache";
  cacheTag(getTrialMetadataConfigTag(id));
  return db.query.TrialMetadataConfig.findFirst({
    where: eq(TrialMetadataConfig.id, id),
  });
}

export async function deleteTrialMetadataConfig(
  name: string,
  trx: Omit<typeof db, "$client"> = db
) {
  await trx
    .delete(TrialMetadataConfig)
    .where(eq(TrialMetadataConfig.name, name));

  revalidateTrialMetadataConfigCache(name);
}

export async function removeJsonKeyFromAllTrials(
  key: string,
  trx: Omit<typeof db, "$client"> = db
) {
  await trx.execute(sql`
    UPDATE ${TrialTable}
    SET additional_metadata = additional_metadata - ${key}
    WHERE additional_metadata ? ${key}
  `);

  revalidateTag(getTrialGlobalTag());
}
