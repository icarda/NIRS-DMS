"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
  PlusIcon,
  Wheat,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { traitColumns } from "@/app/(app)/crop-ontology/[id]/columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCrop } from "@/features/crops/db/crop";
import { addCropTrait } from "@/features/traits/actions/crop-trait";
import { cropTraitSchema } from "@/features/traits/schemas/crop-trait";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { UnitSelector } from "./unit-selector";

export type Crop = Exclude<Awaited<ReturnType<typeof getCrop>>, undefined>;

interface CropPageClientProps {
  crop: Crop;
  permission: boolean;
  units: string[];
}

export default function CropPageClient({
  crop,
  permission,
  units,
}: CropPageClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof cropTraitSchema>>({
    resolver: zodResolver(cropTraitSchema),
    defaultValues: {
      traitVariable: "",
      traitName: "",
      entity: "Grain",
      methodDescription: "",
      unit: "%",
    },
  });

  async function onSubmit(values: z.infer<typeof cropTraitSchema>) {
    setIsLoading(true);
    const {
      traitVariable,
      traitName,
      entity,
      methodDescription,
      unit,
      minimumAllowed,
      maximumAllowed,
    } = values;
    const cropTraitData = {
      traitName,
      traitVariable,
      entity,
      methodDescription,
      unit,
      minimumAllowed,
      maximumAllowed,
      cropId: crop.id,
    };
    const result = await addCropTrait(cropTraitData, crop.id);

    if (result.error) {
      toast.error(result.message);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setIsOpen(false);
    toast.success(result.message);
  }

  if (!crop) {
    return <div>Loading crop data...</div>; // Or a better loading state
  }

  return (
    <div>
      <Link
        href="/crop-ontology"
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Crop Catalog
      </Link>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={crop.cropImageUrl || "/placeholder.svg"}
            alt={crop.name}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="mb-4 text-4xl font-bold">{crop.name}</h1>
            <p className="mb-6 text-xl text-gray-600">{crop.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Wheat className="h-4 w-4" />
                    <span>
                      {
                        crop.cropTraits.filter(
                          (trait) => trait.entity === "Grain"
                        ).length
                      }{" "}
                      Grain Properties
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <FlaskConical className="h-4 w-4" />
                    <span>
                      {
                        crop.cropTraits.filter(
                          (trait) => trait.entity === "Wort"
                        ).length
                      }{" "}
                      Wort Properties
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Tabs defaultValue="crop_traits" className="w-full">
        <div className="mb-3 border-b">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-12 w-full items-center justify-start">
              <TabsTrigger
                value="crop_traits"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Crop Traits
              </TabsTrigger>
              <TabsTrigger
                value="common_names"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Common Names
              </TabsTrigger>
              <TabsTrigger
                value="species"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Species
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="px-2 md:px-0">
          <TabsContent value="crop_traits">
            <div className="flex flex-col gap-2 px-2">
              {permission && (
                <div className="flex items-center justify-end">
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4" />
                        Add Trait
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Trait</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="traitVariable"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel required>Trait variable</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Fe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="traitName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel required>Trait name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Iron" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="entity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel required>Entity</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select an entity" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {crop.productTypes.map((productType) => (
                                        <SelectItem
                                          key={productType.id}
                                          value={productType.name}
                                        >
                                          {productType.name}
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
                              name="unit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel required>Unit</FormLabel>
                                  <UnitSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    units={units}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="minimumAllowed"
                              render={({ field: { value, ...field } }) => (
                                <FormItem>
                                  <FormLabel>Minimum allowed value</FormLabel>
                                  <FormControl>
                                    <Input
                                      value={value ? value : ""}
                                      placeholder="e.g. 20"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="maximumAllowed"
                              render={({ field: { value, ...field } }) => (
                                <FormItem>
                                  <FormLabel>Maximum allowed value</FormLabel>
                                  <FormControl>
                                    <Input
                                      value={value ? value : ""}
                                      placeholder="e.g. 350"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="methodDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel required>
                                  Method description
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Type method description here..."
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center justify-end">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin" />
                                  Adding trait...
                                </>
                              ) : (
                                "Add Trait"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <DataTable
                columns={traitColumns}
                data={crop.cropTraits}
                filterColumn="traitName"
              />
            </div>
          </TabsContent>
          <TabsContent value="common_names"></TabsContent>
          <TabsContent value="species"></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
