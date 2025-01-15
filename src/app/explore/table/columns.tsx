"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus } from "lucide-react";

import { isArrayOfDates } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ColumnSchema } from "./schema";

export const columns: ColumnDef<ColumnSchema>[] = [
  {
    header: "Quality Lab",
    accessorKey: "qualityLab",
    meta: {
      label: "Quality Lab",
    },
  },
  {
    header: "Germplasm ID",
    accessorKey: "germplasmId",
    meta: {
      label: "Germplasm ID",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    accessorKey: "year",
    meta: {
      label: "Year",
    },
  },
  {
    accessorKey: "starch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Starch" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("starch");
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return <div>{`${value}`} %</div>;
    },
    meta: {
      label: "Starch",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Protein" />
    ),
    accessorKey: "protein",
    cell: ({ row }) => {
      const value = row.getValue("protein");
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return <div>{`${value}`} g</div>;
    },
    meta: {
      label: "Protein",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hardness" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("hrd");
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return <div>{`${value}`} %</div>;
    },
    accessorKey: "hrd",
    meta: {
      label: "Hardness",
    },
  },
  {
    accessorKey: "irrigation",
    header: "Irrigation",
    cell: ({ row }) => {
      const value = row.getValue("irrigation");
      if (value) return <Check className="h-4 w-4" />;
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (typeof value === "string") return value === String(rowValue);
      if (typeof value === "boolean") return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("date");
      return (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {format(new Date(`${value}`), "LLL dd, y HH:mm")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (value instanceof Date && rowValue instanceof Date) {
        return isSameDay(value, rowValue);
      }
      if (Array.isArray(value)) {
        if (isArrayOfDates(value) && rowValue instanceof Date) {
          const sorted = value.sort((a, b) => a.getTime() - b.getTime());
          return (
            sorted[0]?.getTime() <= rowValue.getTime() &&
            rowValue.getTime() <= sorted[1]?.getTime()
          );
        }
      }
      return false;
    },
  },
];
