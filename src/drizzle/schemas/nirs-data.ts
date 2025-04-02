import { relations } from "drizzle-orm";
import {
  doublePrecision,
  foreignKey,
  integer,
  pgTable,
  unique,
} from "drizzle-orm/pg-core";

import { id } from "../schemaHelpers";
import { StudyTable } from "./study";
import { TraitTable } from "./trait";

export const NirsDataTable = pgTable(
  "nirs_data",
  {
    id,
    studyId: integer("study_id")
      .notNull()
      .references(() => StudyTable.id, { onDelete: "cascade" }),
    sampleId: integer("sample_id").notNull(),
    gid: integer("gid").notNull(),
    plotId: integer("plot_id").notNull(),
    wavelength: integer("wavelength").notNull(),
    value: doublePrecision("value").notNull(),
  },
  (table) => [
    {
      sampleStudyFk: foreignKey({
        columns: [table.sampleId, table.studyId],
        foreignColumns: [TraitTable.sampleId, TraitTable.studyId],
      }),
    },
    unique().on(
      table.studyId,
      table.sampleId,
      table.gid,
      table.plotId,
      table.wavelength
    ),
  ]
);

export const nirsDataRelations = relations(NirsDataTable, ({ one }) => ({
  study: one(StudyTable, {
    fields: [NirsDataTable.studyId],
    references: [StudyTable.id],
  }),
  trait: one(TraitTable, {
    fields: [NirsDataTable.sampleId, NirsDataTable.studyId],
    references: [TraitTable.sampleId, TraitTable.studyId],
  }),
}));
