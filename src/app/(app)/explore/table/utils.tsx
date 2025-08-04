import { FilterFn } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus, X } from "lucide-react";

import { DataTableFilterField } from "./types";

export function guessType(
  value: any
): "boolean" | "date" | "number" | "string" | "undefined" {
  if (value === undefined || value === null || value === "") return "undefined";

  if (value === "true" || value === "false") return "boolean";

  const date = new Date(value);
  if (!isNaN(date.getTime()) && typeof value === "string") {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?$/;
    if (isoDateRegex.test(value)) {
      return "date";
    }
  }

  if (!isNaN(Number(value))) return "number";

  return "string";
}

export function renderDynamicCell(key: string) {
  return ({ row }: { row: any }) => {
    const value = row.getValue(key);
    const type = guessType(value);

    if (type === "undefined") {
      return <Minus className="h-4 w-4 text-center text-muted-foreground/50" />;
    }

    switch (type) {
      case "boolean":
        return value === "true" ? (
          <Check className="h-4 w-4 text-center text-muted-foreground" />
        ) : (
          <X className="h-4 w-4 text-center text-muted-foreground" />
        );
      case "date":
        return (
          <div
            className="text-center text-muted-foreground"
            suppressHydrationWarning
          >
            {format(new Date(value), "LLL dd, y")}
          </div>
        );
      case "number":
        return <div className="text-center">{Number(value)}</div>;
      case "string":
      default:
        return <div className="text-center">{`${value}`}</div>;
    }
  };
}

export function renderDynamicFilterFn(
  type: "input" | "checkbox" | "timerange" | "slider"
): FilterFn<any> | undefined {
  switch (type) {
    case "input":
      return (row, id, value) => {
        const rowValue = row.getValue(id);
        return String(rowValue ?? "")
          .toLowerCase()
          .includes(String(value ?? "").toLowerCase());
      };

    case "checkbox":
      return (row, id, value) => {
        const rowValue = row.getValue(id);
        if (Array.isArray(value)) return value.includes(rowValue);
        return rowValue === value;
      };

    case "timerange":
      return (row, id, value) => {
        const raw = row.getValue(id);

        const rowDate =
          raw instanceof Date
            ? raw
            : typeof raw === "string"
              ? new Date(`${raw}T00:00:00`)
              : null;

        if (!rowDate || isNaN(rowDate.getTime())) return false;

        if (Array.isArray(value)) {
          const [from, to] = value;

          if (!from && !to) return true;
          if (from && !to) return isSameDay(from, rowDate);
          if (from && to) {
            const toInclusive = new Date(to);
            toInclusive.setHours(23, 59, 59, 999);

            return (
              rowDate.getTime() >= from.getTime() &&
              rowDate.getTime() <= toInclusive.getTime()
            );
          }
        }

        return false;
      };

    default:
      return undefined;
  }
}

export function findFilterType(
  key: string,
  filterFields?: DataTableFilterField<any>[]
): DataTableFilterField<any>["type"] {
  return filterFields?.find((f) => f.value === key)?.type ?? "input";
}
