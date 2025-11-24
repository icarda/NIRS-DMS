import { redirect } from "next/navigation";

import PageWrapper from "@/components/page-wrapper";
import { DataTable } from "@/components/ui/data-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCrops } from "@/features/crops/db/crop";
import { getNirModels } from "@/features/nir-models/db/nir-model";
import { getPhysiologicalStages } from "@/features/studies/db/physiological-stage";
import { getProductTypes } from "@/features/studies/db/product-type";
import { getStudyConfigMetadatas } from "@/features/studies/db/study";
import { getTrialConfigMetadatas } from "@/features/trials/db/trial";
import { getApiClients, getUsers } from "@/features/users/db/users";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  apiClientsColumns,
  studyMetadataColumns,
  trialMetadataColumns,
  userColumns,
} from "./columns";
import { ApiClientAddDialog } from "./components/api-client-add-dialog";
import { MetadataAddDialog } from "./components/metadata-add-dialog";
import { NirModelTable } from "./components/nir-model-table";
import { PhysiologicalStageTable } from "./components/physiological-stage-table";
import { ProductTypeTable } from "./components/product-type-table";
import { getCenters } from "@/features/centers/db/center";

export default async function Admin() {
  const user = await getCurrentUser();
  const canAccessAdminPage = hasPermission(user?.role, "admin:access");
  const canUpdateProductType = hasPermission(user?.role, "productType:update");
  const canDeleteProductType = hasPermission(user?.role, "productType:delete");
  const canUpdatePhysiologicalStage = hasPermission(
    user?.role,
    "physiologicalStage:update"
  );
  const canDeletePhysiologicalStage = hasPermission(
    user?.role,
    "physiologicalStage:delete"
  );
  const canUpdateNirModel = hasPermission(user?.role, "nirModel:update");
  const canDeleteNirModel = hasPermission(user?.role, "nirModel:delete");

  if (!canAccessAdminPage) {
    redirect("/");
  }
  const [
    users,
    productTypes,
    crops,
    physiologicalStages,
    nirModels,
    trialConfigMetadatas,
    studyConfigMetadatas,
    apiClients,
    centers
  ] = await Promise.all([
    getUsers(),
    getProductTypes(),
    getCrops(),
    getPhysiologicalStages(),
    getNirModels(),
    getTrialConfigMetadatas(),
    getStudyConfigMetadatas(),
    getApiClients(),
    getCenters(),
  ]);

  return (
    <PageWrapper title="Admin Panel">
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
                <TabsTrigger
                  value="api_clients"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  API Clients
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
                  studyAccesses: user.studyAccesses.map(
                    (studyAccess) => studyAccess.study.studyCode
                  ),
                }))}
                filterColumn="fullName"
              />
            </TabsContent>
            <TabsContent value="product_types">
              <ProductTypeTable
                data={productTypes.map((productType) => ({
                  id: productType.id,
                  crop: productType.crop.name,
                  type: productType.name,
                }))}
                crops={crops}
                canUpdate={canUpdateProductType}
                canDelete={canDeleteProductType}
              />
            </TabsContent>
            <TabsContent value="physiological_stages">
              <PhysiologicalStageTable
                data={physiologicalStages.map((stage) => ({
                  id: stage.id,
                  crop: stage.crop.name,
                  stage: stage.name,
                }))}
                crops={crops}
                canUpdate={canUpdatePhysiologicalStage}
                canDelete={canDeletePhysiologicalStage}
              />
            </TabsContent>
            <TabsContent value="nir_models">
              <NirModelTable
                data={nirModels}
                canUpdate={canUpdateNirModel}
                canDelete={canDeleteNirModel}
              />
            </TabsContent>
            <TabsContent value="trials_metadata">
              <DataTable
                columns={trialMetadataColumns}
                data={trialConfigMetadatas}
                filterColumn="label"
              >
                <MetadataAddDialog type="trial" />
              </DataTable>
            </TabsContent>
            <TabsContent value="study_metadata">
              <DataTable
                columns={studyMetadataColumns}
                data={studyConfigMetadatas}
                filterColumn="label"
              >
                <MetadataAddDialog type="study" />
              </DataTable>
            </TabsContent>
            <TabsContent value="api_clients">
              <DataTable
                columns={apiClientsColumns}
                data={apiClients}
                filterColumn="name"
              >
                <ApiClientAddDialog />
              </DataTable>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
