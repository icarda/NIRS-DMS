"use client";

import { useEffect, useState, useTransition } from "react";

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
import { getCropTraits } from "@/features/traits/actions/trait";
import { dashboardFilterSchema } from "@/lib/schemas";
import { WetchemBoxplotCard } from "./boxplot";
import { FilterForm, FilterValues } from "./filter-form";
import { WetchemHistogramCard } from "./histogram";
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
  const [isPending, setIsPending] = useState(false);
  const [traits, setTraits] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTraitsByCrop() {
      const traits = await getCropTraits("Fe");

      setTraits(traits);
    }
    fetchTraitsByCrop();
  }, []);

  const form = useForm<FilterValues>({
    resolver: zodResolver(dashboardFilterSchema),
    defaultValues: { crop: "", qualityLab: "", year: "", country: "" },
  });

  const [chartFilters, setChartFilters] = useState<FilterValues>(
    form.getValues()
  );
  async function handleApply(values: FilterValues) {
    // Update charts immediately (not deferred)
    setChartFilters(values);
    setIsPending(true);

    // Then update KPIs
    const data = await getDashboardKpis(values);
    setKpis(data);
    setIsPending(false);
    setOpenFilterDialog(false);
  }

  async function handleClear() {
    setIsPending(false);
    form.reset();
    const cleared = { crop: "", qualityLab: "", year: "", country: "" };
    setChartFilters(cleared);
    const data = await getDashboardKpis(cleared);
    setKpis(data);
    setOpenFilterDialog(false);
  }

  return (
    <div className="px-2 md:px-0">
      <div className="border-b">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="overview">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:after:bg-primary relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5"
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
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LineChart filters={chartFilters} />
        <WetchemHistogramCard filters={chartFilters} />
        <WetchemBoxplotCard filters={chartFilters} />
      </div>
    </div>
  );
}
