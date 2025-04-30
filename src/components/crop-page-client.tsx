"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FlaskConical, PlusIcon, Wheat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
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

const traitSchema = z.object({
  variable: z.string({ required_error: "Trait variable is required" }),
  name: z.string({ required_error: "Trait name is required" }),
  entity: z.string({ required_error: "Entity is required" }),
  description: z.string({ required_error: "Method is required" }),
  unit: z.string({ required_error: "Unit is required" }),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
});

export type Crop = Awaited<ReturnType<typeof getCrop>>;

interface CropPageClientProps {
  crop: Crop;
}

export default function CropPageClient({ crop }: CropPageClientProps) {
  const form = useForm<z.infer<typeof traitSchema>>({
    resolver: zodResolver(traitSchema),
    defaultValues: {
      variable: "",
      name: "",
      entity: "Grain",
      description: "",
      unit: "%",
    },
  });

  function onSubmit(values: z.infer<typeof traitSchema>) {
    console.log(values);
    // In a real scenario, you would likely send this data to the server
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
      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center justify-end">
          <Dialog>
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
                      name="variable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trait variable</FormLabel>
                          <FormControl>
                            <Input placeholder="Fe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trait name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} />
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
                          <FormLabel>Entity</FormLabel>
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
                              <SelectItem value="Grain">Grain</SelectItem>
                              <SelectItem value="Wort">Wort</SelectItem>
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
                          <FormLabel>Unit</FormLabel>
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
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="mg/kg">mg/kg</SelectItem>
                              <SelectItem value="ppm">ppm</SelectItem>
                              <SelectItem value="mPas">mPas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minimum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum allowed value</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maximum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum allowed value</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 350" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Method description</FormLabel>
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
                    <Button type="submit">Add Trait</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={traitColumns}
          data={crop.cropTraits}
          filterColumn="traitName"
        />
      </div>
    </div>
  );
}
