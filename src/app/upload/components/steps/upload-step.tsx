"use client";

import { useState } from "react";

import { FileUp as FileUpload, X } from "lucide-react";
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
import { type UploadFormData } from "@/lib/schemas";

const UploadStep = ({ form }: { form: UseFormReturn<any> }) => {
  const [preview, setPreview] = useState<string | null>(null);

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
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Data File</FormLabel>
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
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          CSV or XLSX files only
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
                              Ready to upload
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
  );
};

export default UploadStep;
