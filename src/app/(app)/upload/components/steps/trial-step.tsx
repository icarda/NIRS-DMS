"use client";

import { useEffect, useRef, useState } from "react";

import { format } from "date-fns";
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
import { TRIALS } from "@/data/trails";
import { cn } from "@/lib/utils";

const DEFAULT_SPECIES = [
  {
    id: 1,
    name: "Species 1",
  },
  {
    id: 2,
    name: "Species 2",
  },
  {
    id: 3,
    name: "Species 3",
  },
];

const TrialStep = ({
  form,
  trials,
  crops,
  step,
}: {
  form: UseFormReturn<any>;
  trials: Record<string, any>[];
  crops: Record<string, any>[];
  step: number;
}) => {
  const {
    fields: fertilizers,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "fertilizers",
  });
  const useExistingTrial = form.watch("useExistingTrial") as boolean;
  const previousUseExistingTrial = useRef<boolean | null>(null);
  const [species, setSpecies] =
    useState<{ name: string; id: number }[]>(DEFAULT_SPECIES);

  useEffect(() => {
    const isFirstRender = previousUseExistingTrial.current === null;
    const switchedMode = useExistingTrial !== previousUseExistingTrial.current;

    if (isFirstRender) {
      previousUseExistingTrial.current = useExistingTrial;
      return;
    }

    if (switchedMode) {
      form.setValue("trial", "");
      form.setValue("crop", "");
      form.setValue("trialPlantingDate", null);
      form.setValue("soilType", "");
      form.setValue("location", "");
      form.setValue("coordinates", "");
      form.setValue("species", "");
      form.setValue("irrigation", false);
      form.setValue("fertilizers", [{ type: "", amount: 0 }]);

      setSpecies(DEFAULT_SPECIES);

      previousUseExistingTrial.current = useExistingTrial;
    }
  }, [useExistingTrial]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight md:text-3xl">
          Trial Metadata
        </h1>
        <p className="text-base text-muted-foreground">
          Choose the trial associated with the data you are uploading to ensure
          accurate organization.
        </p>
      </div>
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
                      <FormLabel className="font-normal">
                        Add new trial
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {useExistingTrial ? (
              <FormField
                control={form.control}
                name="trial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const trial = trials.find((t) => t.name === value)!;
                        form.setValue(
                          "trialPlantingDate",
                          new Date(trial.plantingDate)
                        );
                        form.setValue("crop", trial.crop.name);
                        form.setValue("species", "");
                        form.setValue("soilType", trial.soilType);
                        form.setValue("location", trial.location);
                        if (trial.latitude && trial.longitude) {
                          form.setValue(
                            "coordinates",
                            `${trial.latitude}, ${trial.longitude}`
                          );
                        } else {
                          form.setValue("coordinates", "");
                        }
                        form.setValue("irrigation", trial.irrigation);
                        setSpecies(trial.crop.species);

                        form.setValue(
                          "fertilizers",
                          trial.fertilizers.map(
                            (f: {
                              fertilizerType: string;
                              fertilizerAmount: number;
                            }) => ({
                              type: f.fertilizerType,
                              amount: f.fertilizerAmount,
                            })
                          )
                        );
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trial" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trials.map((trial) => (
                          <SelectItem key={trial.id} value={trial.name}>
                            {trial.name}
                          </SelectItem>
                        ))}
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
                <FormItem>
                  <FormLabel>Planting date</FormLabel>
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
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      const cropSpecies = crops.find(
                        (c) => c.name === val
                      )?.species;
                      setSpecies(cropSpecies || []);
                      form.setValue("species", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={useExistingTrial}>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem value={crop.name} key={crop.id}>
                          {crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {species.map((sp) => (
                        <SelectItem value={sp.name} key={sp.id}>
                          {sp.name}
                        </SelectItem>
                      ))}
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
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinates (lat ,lon)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter coordinates (e.g., 33.2315, -8.1515)"
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
          </div>
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
                        <SelectItem value="Nitrogen">Nitrogen</SelectItem>
                        <SelectItem value="Phosphorus">Phosphorus</SelectItem>
                        <SelectItem value="Potassium">Potassium</SelectItem>
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
    </div>
  );
};

export default TrialStep;
