"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getWetchemTraitValues,
  HistogramPoint,
} from "@/features/dashboard/actions/graphs";
import { TraitSelect } from "./trait-select";

type Filters = {
  crop: string;
  qualityLab: string;
  year: string;
  country: string;
};
type TraitOption = { value: string; label: string; unit: string };

export function WetchemHistogramCard({
  filters = { crop: "", qualityLab: "", year: "", country: "" },
}: {
  filters?: Filters;
}) {
  const [trait, setTrait] = useState<TraitOption | null>(null);
  const [raw, setRaw] = useState<HistogramPoint[]>([]);
  const [bins, setBins] = useState<any[]>([]);

  // Load values when trait/filters change
  useEffect(() => {
    (async () => {
      if (!trait?.value) {
        setRaw([]);
        setBins([]);
        return;
      }
      const rows = await getWetchemTraitValues(filters, trait.value);
      setRaw(rows);
    })();
  }, [trait?.value, JSON.stringify(filters)]);

  // Build bins with guards to avoid RangeError
  useEffect(() => {
    setBins(processToBins(raw));
  }, [raw]);

  const xAxisLabel = useMemo(() => {
    if (!trait) return "Value Range";
    return trait.unit ? `${trait.label} Range` : `${trait.label} Range`;
  }, [trait]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Wet-Chemistry Histogram
          <TraitSelect filters={filters} value={trait} onChange={setTrait} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: { label: "Count", color: "hsl(var(--primary))" },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bins}
              margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="range"
                angle={-45}
                textAnchor="end"
                height={60}
                tickLine={false}
                axisLine={false}
                label={{
                  value: xAxisLabel,
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                label={{ value: "Count", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {bins.length === 0 && (
          <div className="pt-4 text-sm text-muted-foreground">
            No data for the selected trait and filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== helpers =====

function processToBins(data: HistogramPoint[], bucketSize = 10) {
  const valid = data.filter(
    (d) => typeof d.value === "number" && Number.isFinite(d.value as number)
  ) as Array<{ key: string; value: number }>;

  if (valid.length === 0) return [];

  const values = valid.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return [];

  const start = Math.floor(minValue / bucketSize) * bucketSize;
  const end =
    Math.ceil((maxValue + Number.EPSILON) / bucketSize) * bucketSize - 1;

  let bucketCount = Math.ceil((end - start + 1) / bucketSize);
  bucketCount = Math.max(1, Math.min(50, bucketCount));

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketMin = start + i * bucketSize;
    const bucketMax = bucketMin + bucketSize - 1;
    return {
      range: `${bucketMin}-${bucketMax}`,
      bucketMin,
      bucketMax,
      count: 0,
      items: [] as string[],
      itemValues: {} as Record<string, number>,
    };
  });

  valid.forEach((item) => {
    const value = item.value as number;
    const bucketIndex = Math.floor((value - buckets[0].bucketMin) / bucketSize);

    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].count++;
      buckets[bucketIndex].items.push(item.key);
      buckets[bucketIndex].itemValues[item.key] = value;
    }
  });

  return buckets;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    console.log("Tooltip data:", data);
    console.log("Payload:", payload);

    return (
      <div className="max-w-xs rounded-lg border bg-background p-4 shadow-md">
        <h3 className="mb-2 font-medium">Score Range: {data.range}</h3>
        <p className="mb-2 text-sm text-muted-foreground">
          Count: {data.count}
        </p>

        <div className="mt-2">
          <h4 className="mb-1 text-sm font-medium">Items:</h4>
          <ScrollArea className="h-[200px] w-full">
            <ul className="space-y-1 text-xs">
              {data.items.map((item: string, index: number) => (
                <li key={index} className="flex">
                  <span className="text-primary">{item}</span>
                  <span className="ml-auto text-muted-foreground">
                    {data.itemValues[item]}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return null;
};
