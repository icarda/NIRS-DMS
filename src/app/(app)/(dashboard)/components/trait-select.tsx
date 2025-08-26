"use client";

import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listWetchemTraits } from "@/features/dashboard/actions/graphs";

type Filters = {
  crop: string;
  qualityLab: string;
  year: string;
  country: string;
};
type TraitOption = { value: string; label: string; unit: string };

export function TraitSelect({
  filters,
  value,
  onChange,
}: {
  filters: Filters;
  value?: TraitOption | null;
  onChange: (t: TraitOption | null) => void;
}) {
  const [options, setOptions] = useState<TraitOption[]>([]);

  useEffect(() => {
    (async () => {
      const opts = await listWetchemTraits(filters);
      setOptions(opts);
      if (!value || !opts.find((o: TraitOption) => o.value === value.value)) {
        onChange(opts[0] ?? null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return (
    <Select
      value={value?.value}
      onValueChange={(v) =>
        onChange(options.find((o) => o.value === v) ?? null)
      }
    >
      <SelectTrigger className="w-[170px]" disabled={options.length === 0}>
        <SelectValue placeholder="Select trait" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
