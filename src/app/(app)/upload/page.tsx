import { redirect } from "next/navigation";

import PageWrapper from "@/components/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCrops } from "@/features/crops/db/crop";
import { getNirModels } from "@/features/nir-models/db/nir-model";
import { getQualityLabsByCenter } from "@/features/quality-labs/db/quality-lab";
import {
  getStudies,
  getStudiesByCenterName,
  getStudyConfigMetadatas,
} from "@/features/studies/db/study";
import {
  getTrialConfigMetadatas,
  getTrials,
  getTrialsByCenter,
} from "@/features/trials/db/trial";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import MultiStepForm from "./components/multi-step-form";
import TraitUpload from "./components/trait-upload";

export default async function UploadData() {
  const user = await getCurrentUser();
  const canAccessUploadPage = hasPermission(user?.role, "upload:access");
  if (!canAccessUploadPage) {
    redirect("/");
  }
  const center = user?.center as string;
  const [
    trials,
    crops,
    qualityLabs,
    nirModels,
    studies,
    trialMetadatas,
    studyMetadatas,
  ] = await Promise.all([
    getTrialsByCenter(center),
    getCrops(),
    getQualityLabsByCenter({ center }),
    getNirModels(),
    getStudiesByCenterName(center),
    getTrialConfigMetadatas(),
    getStudyConfigMetadatas(),
  ]);
  return (
    <PageWrapper title="Upload Data">
      <div>
        <div className="flex items-center">
          <Tabs defaultValue="spectral_data" className="flex-1">
            <div className="border-b">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger
                  value="spectral_data"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  Spectral Data
                </TabsTrigger>
                <TabsTrigger
                  value="traits"
                  className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                >
                  Traits
                </TabsTrigger>
              </TabsList>
            </div>
            <div>
              <TabsContent value="spectral_data">
                <MultiStepForm
                  data={{
                    trials,
                    crops,
                    qualityLabs,
                    nirModels,
                    studies,
                    trialMetadatas: trialMetadatas.filter(
                      (m) => m.source === "json"
                    ),
                    studyMetadatas: studyMetadatas.filter(
                      (m) => m.source === "json"
                    ),
                  }}
                />
              </TabsContent>
              <TabsContent value="traits">
                <TraitUpload data={{ crops, studies }} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}
