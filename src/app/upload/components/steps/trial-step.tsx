"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isExists } from "date-fns";
import { is } from "drizzle-orm";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trialFormSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const TrialStep = ({ form }: { form: UseFormReturn<any> }) => {
  const {
    fields: fertilizers,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "fertilizers",
  });
  const useExistingTrial = form.watch("useExistingTrial");

  // Reset form fields when switching between existing and new trial
  useEffect(() => {
    if (useExistingTrial) {
      // Simulate populating data from an existing trial
      form.setValue("trial", "trial1");
      form.setValue("trialPlantingDate", new Date());
      form.setValue("crop", "wheat");
      form.setValue("soilType", "clay");
      form.setValue("location", "Sample Location");
      form.setValue("coordinates", "33.2315,-8.1515");
      form.setValue("irrigation", true);
      form.setValue("fertilizers", [{ type: "nitrogen", amount: 23 }]);
    } else {
      // Reset fields for new trial
      form.setValue("trial", "");
      form.setValue("trialPlantingDate", null);
      form.setValue("crop", "");
      form.setValue("soilType", "");
      form.setValue("location", "");
      form.setValue("coordinates", "");
      form.setValue("irrigation", false);
      form.setValue("fertilizers", [{ type: "", amount: 0 }]);
    }
  }, [useExistingTrial, form]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="useExistingTrial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose an option:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) =>
                    field.onChange(value === "existing")
                  }
                  defaultValue={field.value ? "existing" : "new"}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="existing" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Select Existing trial
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="new" />
                    </FormControl>
                    <FormLabel className="font-normal">Add new trial</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-6">
          {useExistingTrial ? (
            <FormField
              control={form.control}
              name="trial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trial</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trial1">Trial 1</SelectItem>
                      <SelectItem value="trial2">Trial 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="trial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trial Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter trial name.." {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="trialPlantingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Trial planting date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={useExistingTrial}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="crop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crop</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={useExistingTrial}>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="corn">Corn</SelectItem>
                    <SelectItem value="soybean">Soybean</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="species1">Species 1</SelectItem>
                    <SelectItem value="species2">Species 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soilType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={useExistingTrial}>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter location"
                    {...field}
                    disabled={useExistingTrial}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="coordinates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinates (lat,lon)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter coordinates (e.g., 33.2315,-8.1515)"
                  {...field}
                  disabled={useExistingTrial}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="irrigation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Irrigation</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "yes")}
                value={field.value ? "yes" : "no"}
              >
                <FormControl>
                  <SelectTrigger disabled={useExistingTrial}>
                    <SelectValue placeholder="Select irrigation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {fertilizers.map((fertilizer, index) => (
          <div key={fertilizer.id} className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name={`fertilizers.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fertilizer type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={useExistingTrial}>
                        <SelectValue placeholder="Select fertilizer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nitrogen">Nitrogen</SelectItem>
                      <SelectItem value="phosphorus">Phosphorus</SelectItem>
                      <SelectItem value="potassium">Potassium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name={`fertilizers.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fertilizer amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        {...field}
                        disabled={useExistingTrial}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && !useExistingTrial && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="mt-8"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {!useExistingTrial && (
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ type: "", amount: 0 })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Fertilizer
          </Button>
        )}
      </div>
    </Form>
  );
};

export default TrialStep;
