import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nirModels } from "@/data/nir_models";
import { physiologicalStages } from "@/data/physiological-stages";
import { productTypes } from "@/data/product-types";
import { trialMetadatas } from "@/data/trials-metadata";
import { users } from "@/data/users";
import {
  NIRModelColumns,
  physiologicalStageColumns,
  productTypeColumns,
  trialMetadataColumns,
  userColumns,
} from "./columns";
import { NirModelAddDialog } from "./components/nir-model-add-dialog";
import { PhysiologicalStageAddDialog } from "./components/physiological-stage-add-dialog";
import { ProductTypeAddDialog } from "./components/product-type-add-dialog";
import { TrialMetadataAddDialog } from "./components/trial-metadata-add-dialog";

export default function Admin() {
  return (
    <div>
      <div className="flex items-center">
        <Tabs defaultValue="users" className="flex-1">
          <div className="border-b">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger
                value="users"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="product_types"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Product Types
              </TabsTrigger>
              <TabsTrigger
                value="physiological_stages"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Physiological Stages
              </TabsTrigger>
              <TabsTrigger
                value="nir_models"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                NIR Models
              </TabsTrigger>
              <TabsTrigger
                value="trials_metadata"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Trials Metadata
              </TabsTrigger>
            </TabsList>
          </div>
          <div>
            <TabsContent value="users">
              <DataTable
                columns={userColumns}
                data={users}
                filterColumn="fullName"
              />
            </TabsContent>
            <TabsContent value="product_types">
              <DataTable
                columns={productTypeColumns}
                data={productTypes}
                filterColumn="type"
                selectCrop
              >
                <ProductTypeAddDialog />
              </DataTable>
            </TabsContent>
            <TabsContent value="physiological_stages">
              <DataTable
                columns={physiologicalStageColumns}
                data={physiologicalStages}
                filterColumn="stage"
                selectCrop
              >
                <PhysiologicalStageAddDialog />
              </DataTable>
            </TabsContent>
            <TabsContent value="nir_models">
              <DataTable
                columns={NIRModelColumns}
                data={nirModels}
                filterColumn="name"
              >
                <NirModelAddDialog />
              </DataTable>
            </TabsContent>
            <TabsContent value="trials_metadata">
              <DataTable
                columns={trialMetadataColumns}
                data={trialMetadatas}
                filterColumn="name"
              >
                <TrialMetadataAddDialog />
              </DataTable>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
