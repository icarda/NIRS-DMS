"use client";

import { useMemo, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Minus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/table-pagination";
import { camelToNormal, cn } from "@/lib/utils";
import { DataTableFilterControls } from "./data-table-filter-controls";
import { DataTableToolBar } from "./data-table-toolbar";
import { DataTableFilterField } from "./types";
import {
  findFilterType,
  renderDynamicCell,
  renderDynamicFilterFn,
} from "./utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  traitVariables?: string[];
  tab: "study" | "trial" | "wet-chemistry";
}

function generateColumns<TData>(
  tab: "wet-chemistry" | "trial" | "study",
  columns: ColumnDef<TData, any>[],
  data: TData[],
  traitVariables?: string[],
  filterFields?: DataTableFilterField<TData>[]
): ColumnDef<TData>[] {
  const baseColumns = [...columns];

  if (tab === "wet-chemistry") {
    return [
      ...baseColumns,
      ...(traitVariables?.map((key) => ({
        header: camelToNormal(key),
        accessorKey: key,
        id: key,
        cell: ({ row }) => {
          const value = row.getValue(key);
          return typeof value === "undefined" ? (
            <Minus className="h-4 w-4 text-muted-foreground/50" />
          ) : (
            <div>{`${value}`}</div>
          );
        },
        filterFn: renderDynamicFilterFn(findFilterType(key, filterFields)),
        meta: { label: camelToNormal(key) },
      })) as ColumnDef<TData>[]),
    ];
  }

  if (tab === "trial" || tab === "study") {
    const additionalMetadataKeys = new Set<string>();

    data.forEach((item: any) => {
      if (item.additionalMetadata) {
        Object.keys(item.additionalMetadata).forEach((key) => {
          additionalMetadataKeys.add(key);
        });
      }
    });

    const additionalMetadataColumns = Array.from(additionalMetadataKeys).map(
      (key) => ({
        header: camelToNormal(key),

        accessorFn: (row: any) => row.additionalMetadata?.[key],
        id: key,
        cell: renderDynamicCell(key),
        meta: { label: camelToNormal(key) },
      })
    ) as ColumnDef<TData>[];

    return [...baseColumns, ...additionalMetadataColumns];
  }

  return baseColumns;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterFields,
  traitVariables,
  tab,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [controlsOpen, setControlsOpen] = useState(false);

  if (tab === "study") console.log(data);

  const allColumns = useMemo(
    () => generateColumns(tab, columns, data, traitVariables),
    [tab, columns, data, traitVariables]
  );

  const table = useReactTable({
    data,
    columns: allColumns as ColumnDef<TData, TValue>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:flex-row">
      <div
        className={cn(
          "w-full p-1 sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
          !controlsOpen && "hidden"
        )}
      >
        <div className="-m-1 h-full p-1">
          <DataTableFilterControls table={table} filterFields={filterFields} />
        </div>
      </div>
      <div className="flex max-w-full flex-1 flex-col overflow-hidden">
        <DataTableToolBar
          table={table}
          controlsOpen={controlsOpen}
          setControlsOpen={setControlsOpen}
          tab={tab}
        />
        <div className="grid grid-cols-1 rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const colSpan = (header.column.columnDef as any).columns
                      ? (header.column.columnDef as any).columns.length
                      : 1;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          (header.column.columnDef as any).columns &&
                            "border-x border-x-gray-200"
                        )}
                        colSpan={colSpan}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} className="my-2" />
      </div>
    </div>
  );
}
