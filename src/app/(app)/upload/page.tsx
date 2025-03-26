import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCrops } from "@/features/crops/db/crop";
import { getTrials } from "@/features/trials/db/trial";
import MultiStepForm from "./components/multi-step-form";
import TraitUpload from "./components/trait-upload";

export default async function UploadData() {
  const trials = await getTrials();
  const crops = await getCrops();
  return (
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
              <MultiStepForm data={{ trials, crops }} />
            </TabsContent>
            <TabsContent value="traits">
              <TraitUpload />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
