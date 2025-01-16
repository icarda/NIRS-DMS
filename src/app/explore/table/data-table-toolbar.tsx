import React from "react";

import type { Table } from "@tanstack/react-table";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableDownload } from "./data-table-download";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  controlsOpen: boolean;
  setControlsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DataTableToolBar<TData>({
  table,
  controlsOpen,
  setControlsOpen,
}: DataTableToolbarProps<TData>) {
  const filters = table.getState().columnFilters;
  return (
    <div className="flex items-center justify-between gap-2 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setControlsOpen((prev) => !prev)}
          className="flex gap-2"
        >
          {controlsOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden sm:block">Hide Controls</span>
            </>
          ) : (
            <>
              <PanelLeftOpen className="h-4 w-4" />
              <span className="hidden sm:block">Show Controls</span>
            </>
          )}
        </Button>
        {controlsOpen && (
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of{" "}
            {table.getCoreRowModel().rows.length} row(s) filtered
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {filters.length ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        ) : null}
        <DataTableViewOptions table={table} />
        <DataTableDownload />
      </div>
    </div>
  );
}
