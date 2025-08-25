"use client";

import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsString, useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crops } from "@/data/crops";
import { qualityLabs } from "@/data/quality-labs";
import { dashboardFilterSchema } from "@/lib/schemas";
import { emptyToNull, ensureString } from "@/lib/utils";

type FilterValues = z.infer<typeof dashboardFilterSchema>;

// Mock data
const YEARS = ["2024", "2023", "2022", "2021"];
const COUNTRIES = ["Morocco", "Lebanon", "Mexico"];

export function FilterForm() {
  const [query, setQuery] = useQueryStates(
    {
      crop: parseAsString.withDefault(""),
      qualityLab: parseAsString.withDefault(""),
      year: parseAsString.withDefault(""),
      country: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      clearOnDefault: true,
    }
  );

  const form = useForm<FilterValues>({
    resolver: zodResolver(dashboardFilterSchema),
    values: useMemo(
      () => ({
        crop: ensureString(query.crop),
        qualityLab: ensureString(query.qualityLab),
        year: ensureString(query.year),
        country: ensureString(query.country),
      }),
      [query.crop, query.qualityLab, query.year, query.country]
    ),
  });

  function onSubmit(data: FilterValues) {
    setQuery(
      {
        crop: emptyToNull(data.crop),
        qualityLab: emptyToNull(data.qualityLab),
        year: emptyToNull(data.year),
        country: emptyToNull(data.country),
      },
      { history: "push" }
    );
  }

  function clearAll() {
    setQuery(
      {
        crop: null,
        qualityLab: null,
        year: null,
        country: null,
      },
      { history: "push" }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="crop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crop</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          {crop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qualityLab"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quality Lab</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality lab" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityLabs.map((lab) => (
                        <SelectItem key={lab} value={lab}>
                          {lab}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
          <Button type="submit">Apply Filters</Button>
        </div>
      </form>
    </Form>
  );
}
