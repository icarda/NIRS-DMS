import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CenterTable } from "./center";
import { StudyTable } from "./study";

export const QualityLabTable = pgTable("quality_lab", {
  id,
  centerId: integer("center_id")
    .notNull()
    .references(() => CenterTable.id, { onDelete: "cascade" }),
  name: text("name").notNull().unique(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  createdAt,
  updatedAt,
});

export const qualityLabRelations = relations(
  QualityLabTable,
  ({ one, many }) => ({
    center: one(CenterTable, {
      fields: [QualityLabTable.centerId],
      references: [CenterTable.id],
    }),
    studies: many(StudyTable),
  })
);
