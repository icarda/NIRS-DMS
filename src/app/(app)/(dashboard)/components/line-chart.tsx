"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { getSpectralData } from "@/features/dashboard/actions/graphs";
import { NirModelSelect } from "./nir-model-select";
import { SampleSelector } from "./sample-selector";

function randomColor(i: number) {
  const hue = (i * 137.508) % 360; // golden angle → spread colors evenly
  return `hsl(${hue}, 70%, 50%)`;
}

function buildChartConfig(data: Record<string, number>[]): ChartConfig {
  if (data.length === 0) return {};

  const sampleKeys = Object.keys(data[0]).filter((k) =>
    k.startsWith("sample_")
  );

  const config: ChartConfig = {};
  sampleKeys.forEach((key, i) => {
    config[key] = {
      label: key.replace("sample_", "Sample "), // "sample_456" → "Sample 456"
      color: randomColor(i),
    };
  });
  return config;
}

function pivotSpectralData(
  rows: { sampleId: string; wavelength: number; value: number }[]
) {
  const grouped: Record<number, Record<string, number>> = {};

  rows.forEach((r) => {
    if (!grouped[r.wavelength])
      grouped[r.wavelength] = { wavelength: r.wavelength };
    grouped[r.wavelength][`sample_${r.sampleId}`] = r.value;
  });

  return Object.values(grouped).sort((a, b) => a.wavelength - b.wavelength);
}

export function LineChart({
  filters = { crop: "", qualityLab: "", year: "", country: "" },
}: {
  filters?: { crop: string; qualityLab: string; year: string; country: string };
}) {
  const [data, setData] = useState<Record<string, number>[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [samples, setSamples] = useState<string[]>([]);
  const [nirModel, setNirModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        const rows = await getSpectralData(filters, nirModel);
        if (!isMounted) return;

        // Offload heavy processing
        const pivoted = pivotSpectralData(rows);
        const config = buildChartConfig(pivoted);

        if (!isMounted) return;
        setData(pivoted);
        setChartConfig(config);
        setSamples(Object.keys(config));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch spectral data:", error);
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters), nirModel]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Near-Infrared Spectral Chart
          <div className="flex items-center gap-2">
            <NirModelSelect
              filters={filters!}
              value={nirModel}
              onChange={setNirModel}
              // disabled={!filters?.crop} // model list is crop-scoped
            />
            {/* <SampleSelector
              options={allSamples}
              active={activeSamples}
              onChange={setActiveSamples}
            /> */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <Spinner className="text-primary size-8" />
              Loading...
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              No data to display
            </div>
          ) : (
            <ReLineChart
              data={data}
              accessibilityLayer
              margin={{ bottom: 40, left: 20, right: 20, top: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="wavelength"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                label={{
                  value: "Wavelength (nm)",
                  position: "insideBottom",
                  offset: -15,
                }}
                className="pb-2"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Absorbance",
                  angle: -90,
                  position: "insideLeft",
                  offset: 15,
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={1}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) return null;
                  const avg =
                    payload.reduce((sum, p) => sum + (p.value as number), 0) /
                    payload.length;
                  return (
                    <div className="rounded-lg bg-white p-3 shadow-xs">
                      <p>Wavelength: {label}</p>
                      <p>Average absorbance: {avg.toFixed(4)}</p>
                      <p>Samples: {payload.length}</p>
                    </div>
                  );
                }}
              />

              {samples.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`var(--color-${key})`}
                  dot={false}
                  strokeWidth={1.5}
                />
              ))}
            </ReLineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
