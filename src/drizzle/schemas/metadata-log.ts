import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";

const scopes = ["study", "trial"] as const;
const actions = ["add", "edit", "delete"] as const;

export const scopeEnum = pgEnum("scope", scopes);
export const actionEnum = pgEnum("action", actions);
export type MetadataAction = (typeof actions)[number];
export type MetadataScope = (typeof scopes)[number];

export const metadataLog = pgTable("metadata_log", {
  id,
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  action: actionEnum().notNull(),
  scope: scopeEnum().notNull(),
  target: text("target").notNull(),
  before: text("before").default(""),
  after: text("after").default(""),
  createdAt,
  updatedAt,
});
