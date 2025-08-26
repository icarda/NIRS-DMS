"use client";

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getSpectralData } from "@/features/dashboard/actions/graphs";

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
  rows: { sampleId: number; wavelength: number; value: number }[]
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

  useEffect(() => {
    async function fetchData() {
      const rows = await getSpectralData(filters);
      const pivoted = pivotSpectralData(rows);
      setData(pivoted);
      setChartConfig(buildChartConfig(pivoted));
    }
    fetchData();
  }, [JSON.stringify(filters)]);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
          content={
            <ChartTooltipContent labelFormatter={(value) => `${value} nm`} />
          }
        />
        {/* <ChartLegend verticalAlign="top" content={<ChartLegendContent />} /> */}

        {/* Dynamically render one line per sample */}
        {Object.keys(chartConfig).map((key) => (
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
    </ChartContainer>
  );
}
