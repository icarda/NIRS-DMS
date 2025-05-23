import { integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "../schemaHelpers";

export const OtherIdsTable = pgTable(
  "other_ids",
  {
    id,
    sampleId: integer("sample_id").notNull(),
    plotId: integer("plot_id").notNull(),
    gid: integer("gid").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("other_ids_unique").on(table.sampleId, table.plotId, table.gid),
  ]
);
