import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <TabsContent value="users"></TabsContent>
            <TabsContent value="product_types"></TabsContent>
            <TabsContent value="physiological_stages"></TabsContent>
            <TabsContent value="nir_models"></TabsContent>
            <TabsContent value="trials_metadata"></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
