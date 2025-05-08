import { columns } from "@/app/(app)/explore/table/columns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { data, filterFields } from "./table/constants";
import { DataTable } from "./table/data-table";
import { ColumnSchema } from "./table/schema";

async function getData(): Promise<ColumnSchema[]> {
  return data;
}

export default async function ExploreData() {
  const data = await getData();

  return (
    <div className="px-2 md:px-0">
      <div className="border-b">
        <div className="flex items-center">
          <Tabs defaultValue="wetchemistry">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger
                value="wetchemistry"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Wet Chemistry
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div>
        <DataTable columns={columns} data={data} filterFields={filterFields} />
      </div>
    </div>
  );
}
