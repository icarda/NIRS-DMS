"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DataTableFilterCheckbox } from "./data-table-filter-checkbox";
import { DataTableFilterInput } from "./data-table-filter-input";
import { DataTableFilterSlider } from "./data-table-filter-slider";
import { DataTableFilterTimerange } from "./data-table-filter-timerange";
import type { DataTableFilterField } from "./types";

interface DataTableFilterControlsProps<TData, TValue> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableFilterControls<TData, TValue>({
  table,
  filterFields,
}: DataTableFilterControlsProps<TData, TValue>) {
  const filters = table.getState().columnFilters;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[46px] items-center justify-between gap-3">
        <p className="px-2 font-medium text-foreground">Filters</p>
        <div>
          {filters.length ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
      <Accordion
        type="multiple"
        defaultValue={filterFields
          ?.filter(({ defaultOpen }) => defaultOpen)
          ?.map(({ value }) => value as string)}
      >
        {filterFields?.map((field) => {
          const value = field.value as string;
          const column = table
            .getAllLeafColumns()
            .find((col) => col.id === value);

          const facettedValues = Array.from(
            column?.getFacetedUniqueValues().keys() ?? []
          );
          return (
            <AccordionItem key={value} value={value} className="border-none">
              <AccordionTrigger className="w-full px-2 py-0 hover:no-underline">
                <div className="flex w-full items-center justify-between gap-2 truncate py-2 pr-2">
                  <div className="flex items-center gap-2 truncate">
                    <p className="text-sm font-medium text-foreground">
                      {field.label}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-1">
                {(() => {
                  switch (field.type) {
                    case "checkbox": {
                      return (
                        <DataTableFilterCheckbox
                          table={table}
                          options={facettedValues.map((val) => ({
                            label: val,
                            value: val,
                          }))}
                          {...field}
                        />
                      );
                    }
                    case "slider": {
                      return (
                        <DataTableFilterSlider
                          table={table}
                          {...field}
                          unit={field.unit}
                        />
                      );
                    }
                    case "input": {
                      return <DataTableFilterInput table={table} {...field} />;
                    }
                    case "timerange": {
                      return (
                        <DataTableFilterTimerange table={table} {...field} />
                      );
                    }
                  }
                })()}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
