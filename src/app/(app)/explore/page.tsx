import { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Minus } from "lucide-react";

import PageWrapper from "@/components/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWetChemistryData } from "@/features/traits/db/trait";
import { capitalize, isArrayOfDates } from "@/lib/utils";
import { filterFields } from "./table/constants";
import { DataTable } from "./table/data-table";
import { ColumnSchema } from "./table/schema";

async function getRealData() {
  const result = await getWetChemistryData();

  const dataColumns = result.map((row) => row.trait_name);

  const groupedData: Record<string, Record<string, any>> = {};

  result.forEach((row) => {
    const groupKey = `${row.sample_id}-${row.crop_name}-${row.study_code}-${row.sample_date.substring(0, 4)}`;

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {
        sample_id: row.sample_id,
        crop_name: row.crop_name,
        study_code: row.study_code,
        sample_date: row.sample_date,
        trial_name: row.trial_name,
        trial_planting_date: row.trial_planting_date,
        product_type: row.product_type,
        physiological_stage: row.physiological_stage,
        quality_lab_name: row.quality_lab_name,
        germplasm_id: row.germplasm_id,
      };
    }

    if (
      row.trait_name &&
      row.measured_value !== null &&
      row.measured_value !== undefined
    ) {
      groupedData[groupKey][row.trait_name] = row.measured_value;
    }
  });

  const realData = Object.values(groupedData);

  return { realData, dataColumns };
}

const columns: ColumnDef<ColumnSchema>[] = [
  {
    header: "Sample ID",
    accessorKey: "sample_id",
    id: "sampleId",
    meta: {
      label: "Sample ID",
    },
  },
  {
    header: "Quality Lab",
    accessorKey: "quality_lab_name",
    id: "qualityLab",
    meta: {
      label: "Quality Lab",
    },
  },
  {
    header: "Germplasm ID",
    accessorKey: "germplasm_id",
    id: "germplasmId",
    meta: {
      label: "Germplasm ID",
    },
  },
  {
    header: "Trial Metadatas",
    columns: [
      {
        header: "Name",
        accessorKey: "trial_name",
        id: "trialName",
      },
      {
        header: "Planting Date",
        accessorKey: "trial_planting_date",
        id: "trialPlantingDate",
      },
      {
        header: "Crop",
        accessorKey: "crop_name",
        id: "cropName",
      },
    ],
  },
  {
    header: "Study Metadatas",
    columns: [
      {
        header: "Study Code",
        accessorKey: "study_code",
        id: "studyCode",
      },
      {
        header: "Product Type",
        accessorKey: "product_type",
        id: "productType",
      },
      {
        header: "Physiological Stage",
        accessorKey: "physiological_stage",
        id: "physiologicalStage",
      },
      {
        header: "Sample Date",
        accessorKey: "sample_date",
        id: "sample_date",
      },
    ],
  },

  // {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Year" />
  //   ),
  //   accessorKey: "year",
  //   meta: {
  //     label: "Year",
  //   },
  // },
  // {
  //   accessorKey: "starch",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Starch" />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.getValue("starch");
  //     if (typeof value === "undefined") {
  //       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  //     }
  //     return <div>{`${value}`} %</div>;
  //   },
  //   meta: {
  //     label: "Starch",
  //   },
  // },
  // {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Protein" />
  //   ),
  //   accessorKey: "protein",
  //   cell: ({ row }) => {
  //     const value = row.getValue("protein");
  //     if (typeof value === "undefined") {
  //       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  //     }
  //     return <div>{`${value}`} g</div>;
  //   },
  //   meta: {
  //     label: "Protein",
  //   },
  // },
  // {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Hardness" />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.getValue("hrd");
  //     if (typeof value === "undefined") {
  //       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  //     }
  //     return <div>{`${value}`} %</div>;
  //   },
  //   accessorKey: "hrd",
  //   meta: {
  //     label: "Hardness",
  //   },
  // },
  // {
  //   accessorKey: "irrigation",
  //   header: "Irrigation",
  //   cell: ({ row }) => {
  //     const value = row.getValue("irrigation");
  //     if (typeof value === "undefined") {
  //       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  //     }
  //     if (value) return <Check className="h-4 w-4" />;
  //     return <X className="h-4 w-4 text-muted-foreground/50" />;
  //   },
  //   filterFn: (row, id, value) => {
  //     const rowValue = row.getValue(id);
  //     return value.includes(rowValue);
  //   },
  // },
  // {
  //   accessorKey: "date",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Date" />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.getValue("date");
  //     return (
  //       <div className="text-xs text-muted-foreground" suppressHydrationWarning>
  //         {format(new Date(`${value}`), "LLL dd, y")}
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     const rowValue = row.getValue(id);
  //     if (isArrayOfDates(value) && rowValue instanceof Date) {
  //       if (value.length === 1) {
  //         return isSameDay(value[0], rowValue);
  //       }
  //       const sorted = value.sort((a, b) => a.getTime() - b.getTime());
  //       return (
  //         sorted[0]?.getTime() <= rowValue.getTime() &&
  //         rowValue.getTime() <= sorted[1]?.getTime()
  //       );
  //     }
  //     return false;
  //   },
  // },
];

export default async function ExploreData() {
  const { realData, dataColumns } = await getRealData();

  const traitVariables = Array.from(new Set(dataColumns));

  return (
    <PageWrapper title="Explore Data">
      <div className="px-2 md:px-0">
        <Tabs defaultValue="wetchemistry">
          <div className="border-b">
            <div className="flex items-center">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger
                  value="wetchemistry"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  Wet Chemistry
                </TabsTrigger>
                <TabsTrigger
                  value="trial"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  Trial Data
                </TabsTrigger>
                <TabsTrigger
                  value="study"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  Study Data
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div>
            <TabsContent value="wetchemistry">
              <DataTable
                //@ts-ignore
                columns={columns}
                //@ts-ignore
                data={realData}
                filterFields={filterFields}
                traitVariables={traitVariables}
                tab="wet-chemistry"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
