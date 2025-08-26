"use client";

import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listNirModelsForFilters } from "@/features/dashboard/actions/graphs";

type Filters = {
  crop: string;
  qualityLab: string;
  year: string;
  country: string;
};
type NirOption = { id: number; name: string };

export function NirModelSelect({
  filters,
  value,
  onChange,
  disabled,
}: {
  filters: Filters;
  value?: string | null;
  onChange: (name: string | null) => void;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<NirOption[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await listNirModelsForFilters(filters);
      setOptions(rows);

      if (value && !rows.find((r) => r.name === value)) {
        onChange(null);
      }
    })();
  }, [JSON.stringify(filters)]);

  return (
    <Select
      disabled={disabled || options.length === 0}
      value={value ?? undefined}
      onValueChange={(v) => onChange(v || null)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={options.length ? "Filter by NIR Model" : "No models"}
        />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.name}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
