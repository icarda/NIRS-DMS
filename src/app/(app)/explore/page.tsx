import PageWrapper from "@/components/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCrops,
  getCropsByCenter,
} from "@/features/crops/db/crop";
import {
  getNirModels,
  getNirModelsByCenter,
} from "@/features/nir-models/db/nir-model";
import { getQualityLabs } from "@/features/quality-labs/db/quality-lab";
import {
  getPhysiologicalStages,
  getPhysiologicalStagesByCenter,
} from "@/features/studies/db/physiological-stage";
import { getProductTypes } from "@/features/studies/db/product-type";
import { getSpecies, getTrialSpecies } from "@/features/studies/db/species";
import {
  getStudies,
  getStudiesByCenterName,
  getStudyConfigMetadatas,
} from "@/features/studies/db/study";
import {
  getWetChemistryData,
  getWetChemistryDataByCenter,
} from "@/features/traits/db/trait";
import {
  getTrialConfigMetadatas,
  getTrials,
  getTrialsByCenter,
} from "@/features/trials/db/trial";
import { getCurrentUser } from "@/lib/currentUser";
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

type TraitStats = {
  name: string;
  unit: string;
  min: number;
  max: number;
};

async function getGroupedWetChemistryData({
  center,
  role,
}: {
  center: string;
  role: string;
}) {
  const result =
    role !== "SUPERADMIN"
      ? await getWetChemistryDataByCenter({ center })
      : await getWetChemistryData();

  const traitStats = new Map<string, TraitStats>();
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
        trait_unit: row.trait_unit,
        trial_planting_date: row.trial_planting_date,
        product_type: row.product_type,
        physiological_stage: row.physiological_stage,
        quality_lab_name: row.quality_lab_name,
        germplasm_id: row.germplasm_id,
      };
    }

    const hasTraitValue =
      row.trait_name &&
      row.measured_value !== null &&
      row.measured_value !== undefined;

    if (hasTraitValue) {
      groupedData[groupKey][row.trait_name] = row.measured_value;

      const prevStats = traitStats.get(row.trait_name);
      const numericValue =
        typeof row.measured_value === "number"
          ? row.measured_value
          : Number(row.measured_value);

      if (!Number.isNaN(numericValue)) {
        if (!prevStats) {
          traitStats.set(row.trait_name, {
            name: row.trait_name,
            unit: row.trait_unit,
            min: numericValue,
            max: numericValue,
          });
        } else {
          traitStats.set(row.trait_name, {
            ...prevStats,
            min: Math.min(prevStats.min, numericValue),
            max: Math.max(prevStats.max, numericValue),
          });
        }
      }
    }
  });

  const realData = Object.values(groupedData);

  return { realData, traitVariables: Array.from(traitStats.values()) };
}

export default async function ExploreData() {
  const user = await getCurrentUser();
  const center = user?.center as string;
  const userRole = user?.role;
  const { realData, traitVariables } = await getGroupedWetChemistryData({
    center,
    role: userRole,
  });

  const [
    trials,
    studies,
    nirModels,
    qualityLabs,
    physiologicalStages,
    studyMetadatas,
    trialMetadatas,
    crops,
  ] = await Promise.all([
    userRole !== "SUPERADMIN" ? getTrialsByCenter(center) : getTrials(),
    userRole !== "SUPERADMIN" ? getStudiesByCenterName(center) : getStudies(),
    userRole !== "SUPERADMIN"
      ? getNirModelsByCenter(center)
      : getNirModels(),
    userRole !== "SUPERADMIN" ? getQualityLabs({ center }) : getQualityLabs(),
    userRole !== "SUPERADMIN"
      ? getPhysiologicalStagesByCenter(center)
      : getPhysiologicalStages(),
    getStudyConfigMetadatas(),
    getTrialConfigMetadatas(),
    userRole !== "SUPERADMIN" ? getCropsByCenter(center) : getCrops(),
  ]);

  return (
    <PageWrapper title="Explore Data">
      <div className="px-2 md:px-0">
        <Tabs defaultValue="wetchemistry">
          <div className="border-b">
            <div className="flex items-center">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger
                  value="wetchemistry"
                  className="data-[state=active]:after:bg-primary relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5"
                >
                  Wet Chemistry
                </TabsTrigger>
                <TabsTrigger
                  value="trial"
                  className="data-[state=active]:after:bg-primary relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5"
                >
                  Trial Data
                </TabsTrigger>
                <TabsTrigger
                  value="study"
                  className="data-[state=active]:after:bg-primary relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5"
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
                trialData={{
                  crops: crops,
                  trialMetadatas: trialMetadatas
                    .filter((metadata) => metadata.type !== "array")
                    .map((metadata) => ({
                      name: metadata.name,
                      label: metadata.label,
                      type: metadata.type as
                        | "string"
                        | "number"
                        | "boolean"
                        | "date",
                      required: metadata.required,
                      min: metadata.min ? Number(metadata.min) : null,
                      max: metadata.max ? Number(metadata.max) : null,
                      source: metadata.source,
                    })),
                }}
                userRole={userRole}
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
                studyData={{
                  qualityLabs: qualityLabs.map((lab) => ({
                    ...lab,
                    createdAt: lab.createdAt.toISOString(),
                    updatedAt: lab.updatedAt.toISOString(),
                  })),
                  nirModels: nirModels.map((model) => ({
                    ...model,
                    createdAt: model.createdAt.toISOString(),
                    updatedAt: model.updatedAt.toISOString(),
                  })),
                  physiologicalStages: physiologicalStages.map((stage) => ({
                    ...stage,
                    createdAt: stage.createdAt.toISOString(),
                    updatedAt: stage.updatedAt.toISOString(),
                    crop: {
                      ...stage.crop,
                      createdAt: stage.crop.createdAt.toISOString(),
                      updatedAt: stage.crop.updatedAt.toISOString(),
                    },
                  })),
                  studyMetadatas: studyMetadatas
                    .filter((metadata) => metadata.type !== "array")
                    .map((metadata) => ({
                      name: metadata.name,
                      label: metadata.label,
                      type: metadata.type as
                        | "string"
                        | "number"
                        | "boolean"
                        | "date",
                      required: metadata.required,
                      min: metadata.min ? Number(metadata.min) : null,
                      max: metadata.max ? Number(metadata.max) : null,
                      source: metadata.source,
                    })),
                }}
                userRole={userRole}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
