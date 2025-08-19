import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LocationCommand } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { trialEditFormSchema } from "./schema";
import { Trial } from "./types";

interface TrialEditDialogProps {
  trial: Trial;
  trialMetadatas: {
    name: string;
    label: string;
    type: "string" | "number" | "date" | "boolean";
    required?: boolean;
    min: number | null;
    max: number | null;
    source: "sql" | "json";
  }[];
  crops: { id: number; name: string }[];
  open: boolean;
  onOpenChange(open: boolean): void;
  onSave(data: z.infer<typeof trialEditFormSchema>): void;
  isLoading: boolean;
}

export default function TrialEditDialog({
  trial,
  trialMetadatas,
  crops,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: TrialEditDialogProps) {
  const form = useForm<z.infer<typeof trialEditFormSchema>>({
    resolver: zodResolver(trialEditFormSchema),
    defaultValues: {
      id: trial.id,
      crop: trial.crop.name,
      fertilizers: trial.fertilizers || [],
      soilType: trial.soilType,
      location: trial.location,
      coordinates: `${trial.latitude}, ${trial.longitude}`,
      irrigation: trial.irrigation,

      ...trial.additionalMetadata,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Trial Data</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Crop</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                      <div className="relative">
                        <LocationCommand
                          onSelect={(val) => {
                            form.setValue("location", val.description, {
                              shouldValidate: true,
                              shouldTouch: true,
                            });
                            form.setValue(
                              "coordinates",
                              `${val.lat}, ${val.lng}`
                            );
                          }}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="irrigation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Irrigation</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "yes")}
                      value={field.value ? "yes" : "no"}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              {trialMetadatas
                .filter((metadata) => metadata.source === "json")
                .map((metadata) => {
                  switch (metadata.type) {
                    case "string":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                {/* @ts-ignore */}
                                <Input
                                  placeholder={`Enter ${metadata.label.toLowerCase()}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "number":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={`Enter ${metadata.label.toLowerCase()}`}
                                  {...field}
                                  value={field.value?.toString() || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : parseFloat(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "date":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        // @ts-ignore

                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? // @ts-ignore
                                          new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "boolean":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) =>
                                    field.onChange(value === "true")
                                  }
                                  defaultValue={field.value ? "true" : "false"}
                                  className="flex h-10 items-center gap-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="true" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Yes
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="false" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      No
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                  }
                })}
            </div>

            {trial.fertilizers.map((fertilizer, index) => (
              <div key={fertilizer.id} className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name={`fertilizers.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fertilizer type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Editing trial...
                  </>
                ) : (
                  "Edit trial"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
