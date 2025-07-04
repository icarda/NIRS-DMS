"use client";

import { useState } from "react";

import { format } from "date-fns";
import { FileUp as FileUpload, X } from "lucide-react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fileSize } from "@/lib/utils";

const UploadStep = ({ form }: { form: UseFormReturn<any> }) => {
  const [preview, setPreview] = useState<string | null>(
    form.getValues("file")?.name || null
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(file.name);
    }
  };

  const handleRemoveFile = () => {
    form.setValue("file", null);
    setPreview(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Upload data file for study code:{" "}
          {[
            form.getValues("trial"),
            form.getValues("productType"),
            format(new Date(form.getValues("sampleDate")), "P"),
          ].join("+")}
        </h1>
        <p className="text-base text-muted-foreground">
          Upload your spectroscopy file in the supported format to complete the
          process.
        </p>
      </div>
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center justify-between">
                    Upload Data File
                    <p className="font-light">
                      File example:{" "}
                      <Link
                        href="/examples/nirs_data.csv"
                        target="_blank"
                        className="font-semibold"
                      >
                        nirs_data.csv
                      </Link>
                    </p>
                  </div>
                </FormLabel>
                <FormControl>
                  <div className="flex w-full flex-col items-center justify-center">
                    {!preview ? (
                      <label
                        htmlFor="dropzone-file"
                        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted"
                      >
                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                          <FileUpload className="mb-3 h-10 w-10 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CSV or XLSX files only - 50MB max
                          </p>
                        </div>
                        <Input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleFileChange(e, onChange)}
                          {...field}
                        />
                      </label>
                    ) : (
                      <div className="w-full rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileUpload className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{preview}</p>
                              <p className="text-xs text-muted-foreground">
                                Ready to upload - {fileSize(value.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
};

export default UploadStep;
