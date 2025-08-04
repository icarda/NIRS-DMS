import PageWrapper from "@/components/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudies } from "@/features/studies/db/study";
import { getWetChemistryData } from "@/features/traits/db/trait";
import { getTrials } from "@/features/trials/db/trial";
import {
  studyColumns,
  trialColumns,
  wetChemistryColumns,
} from "./table/columns";
import {
  studyFilterFields,
  trialFilterFields,
  wetChemistryFilterFields,
} from "./table/constants";
import { DataTable } from "./table/data-table";

async function getGroupedWetChemistryData() {
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

export default async function ExploreData() {
  const { realData, dataColumns } = await getGroupedWetChemistryData();
  const trials = await getTrials();
  const studies = await getStudies();

  const traitVariables = Array.from(new Set(dataColumns));

  return (
    <PageWrapper title="Explore Data">
      <div className="px-2 md:px-0">
        <Tabs defaultValue="study">
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
                columns={wetChemistryColumns}
                //@ts-ignore
                data={realData}
                filterFields={wetChemistryFilterFields}
                traitVariables={traitVariables}
                tab="wet-chemistry"
              />
            </TabsContent>
            <TabsContent value="trial">
              <DataTable
                //@ts-ignore
                columns={trialColumns}
                //@ts-ignore
                data={trials}
                filterFields={trialFilterFields}
                tab="trial"
              />
            </TabsContent>
            <TabsContent value="study">
              <DataTable
                //@ts-ignore
                columns={studyColumns}
                //@ts-ignore
                data={studies}
                filterFields={studyFilterFields}
                tab="study"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
