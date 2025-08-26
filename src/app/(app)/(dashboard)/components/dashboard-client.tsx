// app/(dashboard)/DashboardClient.tsx
"use client";

import { useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bean,
  ChartColumn,
  Dna,
  FilterIcon,
  TestTubeDiagonal,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardKpis } from "@/features/dashboard/actions/kpis";
import { dashboardFilterSchema } from "@/lib/schemas";
import { FilterForm, FilterValues } from "./filter-form";
import { KPICard } from "./kpi-card";
import { LineChart } from "./line-chart";

type Kpis = {
  nirs: { samples: number; crops: number; species: number };
  wetchem: { samples: number; crops: number; species: number };
};

export default function DashboardClient({
  initialKpis,
}: {
  initialKpis: Kpis;
}) {
  const [kpis, setKpis] = useState<Kpis>(initialKpis);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilterValues>({
    resolver: zodResolver(dashboardFilterSchema),
    defaultValues: { crop: "", qualityLab: "", year: "", country: "" },
  });

  async function handleApply(values: FilterValues) {
    startTransition(async () => {
      const data = await getDashboardKpis(values);
      setKpis(data);
      setOpenFilterDialog(false);
    });
  }

  function handleClear() {
    startTransition(async () => {
      const cleared = { crop: "", qualityLab: "", year: "", country: "" };
      const data = await getDashboardKpis(cleared);
      setKpis(data);
      setOpenFilterDialog(false);
    });
  }

  return (
    <div className="px-2 md:px-0">
      <div className="border-b">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="overview">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger
                value="overview"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Overview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <FilterIcon className="h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Data</DialogTitle>
                <DialogDescription>
                  Get insights based on metadata
                </DialogDescription>
              </DialogHeader>
              <FilterForm
                form={form}
                onApply={handleApply}
                onClear={handleClear}
                submitting={isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          value={kpis.nirs.samples}
          title="NIRS Samples"
          icon={<TestTubeDiagonal />}
          description="Number of samples analyzed using NIRS."
        />

        <KPICard
          value={kpis.nirs.crops}
          title="NIRS Crops"
          icon={<ChartColumn />}
          description="Number of distinct crops analyzed using NIRS."
        />

        <KPICard
          value={kpis.nirs.species}
          title="NIRS Species"
          icon={<Bean />}
          description="Number of distinct species analyzed using NIRS."
        />

        <KPICard
          value={kpis.wetchem.samples}
          title="Wet Chem Samples"
          icon={<Dna />}
          description="Number of samples analyzed for trait data."
        />

        <KPICard
          value={kpis.wetchem.crops}
          title="Wet Chem Crops"
          icon={<ChartColumn />}
          description="Distinct crops with lab-measured trait data."
        />

        <KPICard
          value={kpis.wetchem.species}
          title="Wet Chem Species"
          icon={<Bean />}
          description="Distinct species with laboratory trait measurements."
        />
        <LineChart filters={form.getValues()} />
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Graph 2</CardTitle>
          </CardHeader>
          <CardContent>Graph 2</CardContent>
        </Card>
      </div>
    </div>
  );
}
