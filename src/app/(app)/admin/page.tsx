import { DataTable } from "@/components/ui/data-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nirModels } from "@/data/nir_models";
import { studyMetadatas } from "@/data/study-metadata";
import { trialMetadatas } from "@/data/trials-metadata";
import { getCrops } from "@/features/crops/db/crop";
import { getPhysiologicalStages } from "@/features/studies/db/physiological-stage";
import { getProductTypes } from "@/features/studies/db/product-type";
import { getUsers } from "@/features/users/db/users";
import {
  NIRModelColumns,
  physiologicalStageColumns,
  productTypeColumns,
  studyMetadataColumns,
  trialMetadataColumns,
  userColumns,
} from "./columns";
import { MetadataAddDialog } from "./components/metadata-add-dialog";
import { NirModelAddDialog } from "./components/nir-model-add-dialog";
import { PhysiologicalStageAddDialog } from "./components/physiological-stage-add-dialog";
import { ProductTypeAddDialog } from "./components/product-type-add-dialog";

export default async function Admin() {
  const [users, productTypes, crops, physiologicalStages] = await Promise.all([
    getUsers(),
    getProductTypes(),
    getCrops(),
    getPhysiologicalStages(),
  ]);
  return (
    <div>
      <Tabs defaultValue="users" className="w-full">
        <div className="border-b">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-12 w-full items-center justify-start">
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
              <TabsTrigger
                value="study_metadata"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Study Metadata
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="px-2 md:px-0">
          <TabsContent value="users">
            <DataTable
              columns={userColumns}
              data={users.map((user) => ({
                id: user.id,
                fullName: `${user.firstName} ${user.lastName}`,
                role: user.role,
                email: user.email,
                center: user.center.acronym,
                status: user.emailVerified ? "Approved" : "Pending",
              }))}
              // data={users}
              filterColumn="fullName"
            />
          </TabsContent>
          <TabsContent value="product_types">
            <DataTable
              columns={productTypeColumns}
              data={productTypes.map((productType) => ({
                id: productType.id,
                crop: productType.crop.name,
                type: productType.name,
              }))}
              filterColumn="type"
              selectCrop
            >
              <ProductTypeAddDialog crops={crops} />
            </DataTable>
          </TabsContent>
          <TabsContent value="physiological_stages">
            <DataTable
              columns={physiologicalStageColumns}
              data={physiologicalStages.map((stage) => ({
                id: stage.id,
                crop: stage.crop.name,
                stage: stage.name,
              }))}
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
              <MetadataAddDialog type="trial" />
            </DataTable>
          </TabsContent>
          <TabsContent value="study_metadata">
            <DataTable
              columns={studyMetadataColumns}
              data={studyMetadatas}
              filterColumn="name"
            >
              <MetadataAddDialog type="study" />
            </DataTable>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
