"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import { MultiSelect as MultiSelectControl } from "@/components/ui/multi-select";
import type {
  DataTableMultiSelectFilterField,
  Option,
} from "./types";

type DataTableFilterMultiSelectProps<TData> =
  DataTableMultiSelectFilterField<TData> & {
    table: Table<TData>;
    options: Option[];
  };

export function DataTableFilterMultiSelect<TData>({
  table,
  value: _value,
  options,
  placeholder,
}: DataTableFilterMultiSelectProps<TData>) {
  const value = _value as string;
  const column = table.getAllLeafColumns().find((col) => col.id === value);

  const selectedValues = useMemo(() => {
    const filterValue = column?.getFilterValue();
    return Array.isArray(filterValue) ? (filterValue as string[]) : [];
  }, [column]);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={value} className="sr-only px-2 text-muted-foreground">
        {value}
      </Label>
      <MultiSelectControl
        data={options}
        value={selectedValues}
        placeholder={placeholder ?? "Select options..."}
        onChange={(next) => {
          if (next.length === 0) {
            column?.setFilterValue(undefined);
            return;
          }
          column?.setFilterValue(next);
        }}
      />
    </div>
  );
}

