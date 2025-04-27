import { relations } from "drizzle-orm";
import { integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StudyTable } from "./study";

export const OtherIdsTable = pgTable(
  "other_ids",
  {
    id,
    sampleId: integer("sample_id").notNull(),
    plotId: integer("plot_id").notNull(),
    gid: integer("gid").notNull(),
    studyId: integer("study_id")
      .notNull()
      .references(() => StudyTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("other_ids_unique").on(
      table.studyId,
      table.sampleId,
      table.plotId,
      table.gid
    ),
  ]
);

export const otherIdsRelations = relations(OtherIdsTable, ({ one }) => ({
  study: one(StudyTable, {
    fields: [OtherIdsTable.studyId],
    references: [StudyTable.id],
  }),
}));
