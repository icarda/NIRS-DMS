import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CenterTable } from "./center";
import { UserStudyAccess } from "./study";

const roles = ["USER", "ADMIN", "SUPERADMIN"] as const;
export const userRoles = pgEnum("role", roles);
export type UserRole = (typeof roles)[number];

export const UserTable = pgTable("user", {
  id: id,
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoles().notNull().default("USER"),
  location: text("location").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  centerId: integer("center_id")
    .notNull()
    .references(() => CenterTable.id),
  position: text("position").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  createdAt,
  updatedAt,
});

export const accounts = pgTable(
  "account",
  {
    userId: integer("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const userRelations = relations(UserTable, ({ one, many }) => ({
  center: one(CenterTable, {
    fields: [UserTable.centerId],
    references: [CenterTable.id],
  }),
  accounts: one(accounts, {
    fields: [UserTable.id],
    references: [accounts.userId],
  }),
  studyAccesses: many(UserStudyAccess),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(UserTable, {
    fields: [accounts.userId],
    references: [UserTable.id],
  }),
}));
