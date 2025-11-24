"use client";

import { useMemo, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table as TTable,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Edit, Minus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/table-pagination";
import { UserRole } from "@/drizzle/schema";
import { updateStudy } from "@/features/studies/actions/study";
import { updateTrial } from "@/features/trials/actions/trial";
import { camelToNormal, cn } from "@/lib/utils";
import { hasPermission } from "@/permissions/general";
import { DataTableFilterControls } from "./data-table-filter-controls";
import { DataTableToolBar } from "./data-table-toolbar";
import StudyEditDialog from "./study-edit-dialog";
import TrialEditDialog from "./trial-edit-dialog";
import {
  DataTableFilterField,
  NirModel,
  PhysiologicalStage,
  QualityLab,
  Study,
  Trial,
} from "./types";
import {
  findFilterType,
  renderDynamicCell,
  renderDynamicFilterFn,
} from "./utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  traitVariables?: { name: string; unit: string; min?: number; max?: number }[];
  tab: "study" | "trial" | "wet-chemistry";
  userRole?: UserRole;
  studyData: {
    qualityLabs: QualityLab[];
    nirModels: NirModel[];
    physiologicalStages: PhysiologicalStage[];
    studyMetadatas: {
      name: string;
      label: string;
      type: "string" | "number" | "date" | "boolean";
      required?: boolean;
      min: number | null;
      max: number | null;
      source: "sql" | "json";
    }[];
  };
  trialData: {
    crops: { id: number; name: string }[];
    trialMetadatas: {
      name: string;
      label: string;
      type: "string" | "number" | "date" | "boolean";
      required?: boolean;
      min: number | null;
      max: number | null;
      source: "sql" | "json";
    }[];
  };
}

function generateColumns<TData>(
  tab: "wet-chemistry" | "trial" | "study",
  columns: ColumnDef<TData, any>[],
  data: TData[],
  traitVariables?: { name: string; unit: string }[],
  filterFields?: DataTableFilterField<TData>[],
  studyData?: {
    qualityLabs: QualityLab[];
    nirModels: NirModel[];
    physiologicalStages: PhysiologicalStage[];
    studyMetadatas: {
      name: string;
      label: string;
      type: "string" | "number" | "date" | "boolean";
      required?: boolean;
      min: number | null;
      max: number | null;
      source: "sql" | "json";
    }[];
  },
  trialData?: {
    crops: { id: number; name: string }[];
    trialMetadatas: {
      name: string;
      label: string;
      type: "string" | "number" | "date" | "boolean";
      required?: boolean;
      min: number | null;
      max: number | null;
      source: "sql" | "json";
    }[];
  },
  userRole?: UserRole
): ColumnDef<TData>[] {
  const baseColumns = [...columns];

  if (tab === "wet-chemistry") {
    return [
      ...baseColumns,
      ...(traitVariables?.map((key) => ({
        header: ` ${camelToNormal(key.name)} (${key.unit})`,
        accessorKey: key.name,
        id: key.name,
        cell: ({ row }) => {
          const value = row.getValue(key.name);
          return typeof value === "undefined" ? (
            <Minus className="text-muted-foreground/50 h-4 w-4" />
          ) : (
            <div>{`${value}`}</div>
          );
        },
        filterFn: renderDynamicFilterFn(findFilterType(key.name, filterFields)),
        meta: { label: camelToNormal(key.name) },
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

    const canEditTrial = hasPermission(userRole || "USER", "trial:update");
    const canEditStudy = hasPermission(userRole || "USER", "study:update");

    if (
      (tab === "trial" && canEditTrial) ||
      (tab === "study" && canEditStudy)
    ) {
      return [
        ...baseColumns,
        ...additionalMetadataColumns,
        tab === "study"
          ? {
              id: "actions",
              cell: ({ row }) => {
                const study = row.original;
                const [editDialogOpen, setEditDialogOpen] = useState(false);
                const [isLoading, setIsLoading] = useState(false);

                const handleStudyEdit = async (data: any) => {
                  setIsLoading(true);

                  try {
                    const qualityLabId = studyData?.qualityLabs.find(
                      (lab) => lab.name === data.qualityLab
                    )?.id!;
                    const nirModelId = studyData?.nirModels.find(
                      (model) => model.name === data.nirModel
                    )?.id!;
                    const physiologicalStageId =
                      studyData?.physiologicalStages.find(
                        (stage) => stage.name === data.physiologicalStage
                      )?.id!;

                    await updateStudy((study as any).id, {
                      qualityLabId,
                      nirModelId,
                      physiologicalStageId,
                      program: data.program,
                      additionalMetadata: data.additionalMetadata,
                      requesterName: data.requesterName || null,
                      requesterEmail: data.requesterEmail || null,
                    });
                    toast.success("Study updated successfully");
                  } catch (error) {
                    console.error("Error updating study:", error);
                    toast.error("Error updating study");
                  } finally {
                    setEditDialogOpen(false);
                    setIsLoading(false);
                  }
                };

                return (
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <StudyEditDialog
                      study={study as Study}
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                      onSave={handleStudyEdit}
                      isLoading={isLoading}
                      nirModels={studyData?.nirModels || []}
                      physiologicalStages={studyData?.physiologicalStages || []}
                      qualityLabs={studyData?.qualityLabs || []}
                      studyMetadatas={studyData?.studyMetadatas || []}
                    />
                  </>
                );
              },
            }
          : {
              id: "actions",
              cell: ({ row }) => {
                const trial = row.original;
                const [editDialogOpen, setEditDialogOpen] = useState(false);
                const [isLoading, setIsLoading] = useState(false);

                const handleStudyEdit = async (data: any) => {
                  setIsLoading(true);

                  try {
                    const cropId = trialData?.crops.find(
                      (crop) => crop.name === data.crop
                    )?.id!;

                    const { error, message } = await updateTrial(
                      (trial as any).id,
                      {
                        cropId,
                        location: data.location,
                        latitude: data.coordinates.split(", ")[0],
                        longitude: data.coordinates.split(", ")[1],
                        soilType: data.soilType,
                        irrigation: data.irrigation,

                        additionalMetadata: data.additionalMetadata,
                        fertilizers: data.fertilizers || [],
                      }
                    );

                    if (error) {
                      toast.error(message);
                    } else {
                      toast.success(message);
                    }
                  } catch (error) {
                    toast.error("Error updating trial");
                  } finally {
                    setEditDialogOpen(false);
                    setIsLoading(false);
                  }
                };

                return (
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <TrialEditDialog
                      trial={trial as Trial}
                      crops={trialData?.crops || []}
                      trialMetadatas={trialData?.trialMetadatas || []}
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                      onSave={handleStudyEdit}
                      isLoading={isLoading}
                    />
                  </>
                );
              },
            },
      ];
    }
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
  studyData,
  trialData,
  userRole,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [controlsOpen, setControlsOpen] = useState(false);

  const traitValueRanges = useMemo(() => {
    if (tab !== "wet-chemistry" || !traitVariables?.length) return null;
    const ranges = new Map<
      string,
      {
        min: number;
        max: number;
      }
    >();

    (data as Record<string, any>[]).forEach((row) => {
      traitVariables.forEach((trait) => {
        const rawValue = row?.[trait.name];
        const numericValue =
          typeof rawValue === "number"
            ? rawValue
            : Number.parseFloat(String(rawValue));

        if (!Number.isFinite(numericValue)) return;

        const existingRange = ranges.get(trait.name);
        if (existingRange) {
          existingRange.min = Math.min(existingRange.min, numericValue);
          existingRange.max = Math.max(existingRange.max, numericValue);
        } else {
          ranges.set(trait.name, {
            min: numericValue,
            max: numericValue,
          });
        }
      });
    });

    return ranges;
  }, [data, tab, traitVariables]);

  const enhancedFilterFields = useMemo(() => {
    if (tab !== "wet-chemistry" || !traitVariables?.length) {
      return filterFields;
    }

    const traitSliderFields = traitVariables
      .filter(
        (trait) =>
          typeof trait.min === "number" && typeof trait.max === "number"
      )
      .map((trait) => {
        const min = trait.min ?? 0;
        const max = trait.max ?? min;
        const normalizedMax = min === max ? min + 1 : max;
        return {
          label: `${camelToNormal(trait.name)} (${trait.unit})`,
          value: trait.name as keyof TData,
          type: "slider" as const,
          min,
          max: normalizedMax,
          unit: trait.unit,
          defaultOpen: false,
        };
      });

    return [
      ...(filterFields ?? []),
      ...(traitSliderFields as DataTableFilterField<TData>[]),
    ];
  }, [filterFields, tab, traitVariables]);

  const allColumns = useMemo(
    () =>
      generateColumns(
        tab,
        columns,
        data,
        traitVariables,
        enhancedFilterFields,
        studyData,
        trialData,
        userRole
      ),
    [
      tab,
      columns,
      data,
      traitVariables,
      enhancedFilterFields,
      studyData,
      trialData,
      userRole,
    ]
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
          "w-full p-1 sm:max-w-52 sm:min-w-52 sm:self-start md:max-w-64 md:min-w-64",
          !controlsOpen && "hidden"
        )}
      >
        <div className="-m-1 h-full p-1">
          <DataTableFilterControls
            table={table}
            filterFields={enhancedFilterFields}
          />
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
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          (header.column.columnDef as any).columns &&
                            "border-x border-x-gray-200"
                        )}
                        colSpan={header.colSpan}
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
