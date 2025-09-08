// db/schema.ts
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { createdAt } from "../schemaHelpers";

const clientTypes = ["public", "confidential"] as const;
export const clientTypeEnum = pgEnum("client_type", clientTypes);
export type ClientType = (typeof clientTypes)[number];

const clientStatuses = ["active", "inactive", "revoked"] as const;
export const clientStatusEnum = pgEnum("client_status", clientStatuses);
export type ClientStatus = (typeof clientStatuses)[number];

export const apiClients = pgTable("api_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecretHash: text("client_secret_hash"), // null for public clients
  clientType: clientTypeEnum().notNull(),
  status: clientStatusEnum().notNull().default("active"),
  scopes: text("scopes").notNull().default("read:data"), // space-separated scopes
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt,
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => apiClients.clientId),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revoked: boolean("revoked").notNull().default(false),
});
