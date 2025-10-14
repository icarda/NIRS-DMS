import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StudyTable } from "./study";

export const OtherIdsTable = pgTable(
  "other_ids",
  {
    id,
    sampleId: text("sample_id").notNull(),
    plotId: text("plot_id").notNull(),
    gid: text("gid").notNull(),
    studyId: integer("study_id")
      .references(() => StudyTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
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
