import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { QualityLabTable } from "./quality-lab";
import { UserTable } from "./user";

export const CenterTable = pgTable("center", {
  id,
  name: text("name").notNull(),
  acronym: text("acronym").notNull().unique(),
  createdAt,
  updatedAt,
});

export const centerRelations = relations(CenterTable, ({ many }) => ({
  qualityLabs: many(QualityLabTable),
  users: many(UserTable),
}));
