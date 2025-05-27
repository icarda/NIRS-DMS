import { serial, timestamp } from "drizzle-orm/pg-core";
import pg from "postgres";

export const id = serial().primaryKey();
export const createdAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow();
export const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const isUniqueConstraintError = (error: pg.PostgresError): boolean => {
  return error?.name === "PostgresError" && error.code === "23505";
};
