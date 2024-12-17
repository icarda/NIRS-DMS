import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});
