// app/(dashboard)/components/wetchem-boxplot-card.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  RectangleProps,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getWetchemBoxplotData,
  type DashboardFilters,
  type GroupBy,
} from "@/features/dashboard/actions/wetchemistry-boxplot";
import { TraitSelect } from "./trait-select"; // from previous step (or replace with your own)

type TraitOption = { value: string; label: string; unit: string };

type BoxPlot = {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  n: number;
};

type BoxPlotStack = {
  group: string;
  min: number; // base offset for the stack
  bottomWhisker: number; // q1 - min
  bottomBox: number; // median - q1
  topBox: number; // q3 - median
  topWhisker: number; // max - q3
  average: number; // plotted via <Scatter>
  bar: number; // dummy to draw horizontal lines at each stage
  n: number;
};

function toStackData(items: BoxPlot[]): BoxPlotStack[] {
  return items.map((v) => ({
    group: v.group,
    min: v.min,
    bottomWhisker: Math.max(0, v.q1 - v.min),
    bottomBox: Math.max(0, v.median - v.q1),
    topBox: Math.max(0, v.q3 - v.median),
    topWhisker: Math.max(0, v.max - v.q3),
    average: v.mean,
    bar: 0,
    n: v.n,
  }));
}

// horizontal line at the top of the current bar segment
function HorizonBar(props: RectangleProps) {
  const { x, y, width } = props;
  if (x == null || y == null || width == null) return null;
  return (
    <line x1={x} y1={y} x2={x + width} y2={y} stroke="#000" strokeWidth={2} />
  );
}

// vertical whisker through the segment
function WhiskerBar(props: RectangleProps) {
  const { x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;
  const cx = x + width / 2;
  return (
    <line
      x1={cx}
      y1={y + height}
      x2={cx}
      y2={y}
      stroke="#000"
      strokeWidth={2}
      strokeDasharray="5 4"
    />
  );
}

export function WetchemBoxplotCard({
  filters = { crop: "", qualityLab: "", year: "", country: "" },
}: {
  filters?: DashboardFilters;
}) {
  const [trait, setTrait] = useState<TraitOption | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("crop");
  const [rows, setRows] = useState<BoxPlot[]>([]);
  const [data, setData] = useState<BoxPlotStack[]>([]);

  useEffect(() => {
    (async () => {
      if (!trait?.value) {
        setRows([]);
        setData([]);
        return;
      }
      const out = await getWetchemBoxplotData(filters!, trait.value, groupBy);
      setRows(out);
      setData(toStackData(out));
    })();
  }, [trait?.value, groupBy, JSON.stringify(filters)]);

  const yLabel = useMemo(() => (trait?.label ? trait.label : "Value"), [trait]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span>Wet-chemistry Boxplot</span>
          <div className="flex gap-2">
            {/* Group-by */}
            <Select
              value={groupBy}
              onValueChange={(v) => setGroupBy(v as GroupBy)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crop">By Crop</SelectItem>
                <SelectItem value="species">By Species</SelectItem>
                <SelectItem value="qualityLab">By Quality Lab</SelectItem>
              </SelectContent>
            </Select>

            {/* Trait selector (re-use from earlier step) */}
            <TraitSelect filters={filters!} value={trait} onChange={setTrait} />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={{
            bottomBox: {
              label: "IQR (Q1-Median)",
              color: "hsl(var(--primary))",
            },
            topBox: { label: "IQR (Median-Q3)", color: "hsl(var(--primary))" },
            average: { label: "Mean", color: "hsl(var(--chart-2))" },
          }}
          className="h-[340px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 40, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {/* Stack bars to create base + whiskers + boxes */}
              <Bar stackId="a" dataKey="min" fill="transparent" />
              <Bar stackId="a" dataKey="bar" shape={<HorizonBar />} />{" "}
              {/* at min (baseline) */}
              <Bar stackId="a" dataKey="bottomWhisker" shape={<WhiskerBar />} />
              <Bar
                stackId="a"
                dataKey="bottomBox"
                fill="var(--color-bottomBox)"
              />
              <Bar stackId="a" dataKey="bar" shape={<HorizonBar />} />{" "}
              {/* at median */}
              <Bar stackId="a" dataKey="topBox" fill="var(--color-topBox)" />
              <Bar stackId="a" dataKey="topWhisker" shape={<WhiskerBar />} />
              <Bar stackId="a" dataKey="bar" shape={<HorizonBar />} />{" "}
              {/* at max */}
              {/* mean marker */}
              <Scatter
                dataKey="average"
                fill="var(--color-average)"
                stroke="#fff"
              />
              <XAxis
                dataKey="group"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                label={{ value: yLabel, angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip cursor={false} content={<BoxplotTooltip />} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function round(n?: number) {
  return typeof n === "number" ? Number(n.toFixed(3)) : "-";
}

export const BoxplotTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;

    // reconstruct quartiles from stacked data
    const min = d.min;
    const q1 = d.min + d.bottomWhisker;
    const median = q1 + d.bottomBox;
    const q3 = median + d.topBox;
    const max = q3 + d.topWhisker;
    const mean = d.average;
    const n = d.n;

    return (
      <div className="max-w-xs rounded-lg border bg-background p-4 shadow-md">
        <h3 className="mb-2 font-medium">Group: {d.group}</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Min:</span> {round(min)}
          </p>
          <p>
            <span className="text-muted-foreground">Q1:</span> {round(q1)}
          </p>
          <p>
            <span className="text-muted-foreground">Median:</span>{" "}
            {round(median)}
          </p>
          <p>
            <span className="text-muted-foreground">Q3:</span> {round(q3)}
          </p>
          <p>
            <span className="text-muted-foreground">Max:</span> {round(max)}
          </p>
          <p>
            <span className="text-muted-foreground">Mean:</span> {round(mean)}
          </p>
          <p>
            <span className="text-muted-foreground">n:</span> {n}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
