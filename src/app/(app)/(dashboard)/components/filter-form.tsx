"use client";

import { useEffect, useMemo, useState } from "react";

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
import { getNirsFilterOptions } from "@/features/dashboard/actions/nirs-filters";
import { dashboardFilterSchema } from "@/lib/schemas";

export type FilterValues = z.infer<typeof dashboardFilterSchema>;

export function FilterForm({
  form,
  onApply,
  onClear,
  submitting,
}: {
  form: ReturnType<typeof useForm<FilterValues>>;
  onApply: (v: FilterValues) => void;
  onClear: () => void;
  submitting?: boolean;
}) {
  const [opts, setOpts] = useState<{
    crops: string[];
    qualityLabs: string[];
    countries: string[];
    years: string[];
  }>({ crops: [], qualityLabs: [], countries: [], years: [] });

  const values = form.watch();
  const deps = useMemo(
    () =>
      [values.crop, values.qualityLab, values.year, values.country].join("|"),
    [values.crop, values.qualityLab, values.year, values.country]
  );

  useEffect(() => {
    (async () => {
      const next = await getNirsFilterOptions({
        crop: values.crop || "",
        qualityLab: values.qualityLab || "",
        year: values.year || "",
        country: values.country || "",
      });

      setOpts(next);
      // Crop => resets everything below
      if (values.crop && !next.crops.includes(values.crop)) {
        form.setValue("crop", "");
        form.setValue("qualityLab", "");
        form.setValue("country", "");
        form.setValue("year", "");
      }

      // Lab => resets Country + Year
      if (values.qualityLab && !next.qualityLabs.includes(values.qualityLab)) {
        form.setValue("qualityLab", "");
        form.setValue("country", "");
        form.setValue("year", "");
      }

      // Country => resets Year
      if (values.country && !next.countries.includes(values.country)) {
        form.setValue("country", "");
        form.setValue("year", "");
      }

      // Year => only itself
      if (values.year && !next.years.includes(values.year)) {
        form.setValue("year", "");
      }
    })();
  }, [deps]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onApply(data))}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="crop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crop</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.crops.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                      {opts.crops.length === 0 && (
                        <div className="text-muted-foreground px-2 py-1 text-sm">
                          No crops available
                        </div>
                      )}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality lab" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.qualityLabs.map((lab) => (
                        <SelectItem key={lab} value={lab}>
                          {lab}
                        </SelectItem>
                      ))}
                      {opts.qualityLabs.length === 0 && (
                        <div className="text-muted-foreground px-2 py-1 text-sm">
                          No labs available
                        </div>
                      )}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                      {opts.years.length === 0 && (
                        <div className="text-muted-foreground px-2 py-1 text-sm">
                          No years available
                        </div>
                      )}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                      {opts.countries.length === 0 && (
                        <div className="text-muted-foreground px-2 py-1 text-sm">
                          No countries available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({ crop: "", qualityLab: "", year: "", country: "" });
              onClear();
            }}
            disabled={submitting}
          >
            Clear All
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
