"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCrop } from "@/features/crops/actions/crop";
import { uploadFile } from "@/lib/upload-asset";

const formSchema = z.object({
  cropName: z.string().min(1, {
    message: "Crop name is required.",
  }),
  commonName: z.string().min(1, {
    message: "Common name is required.",
  }),
  description: z.string().optional(),
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine(
      (file) => {
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        return validTypes.includes(file.type);
      },
      {
        message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
      }
    )
    .refine(
      (file) => {
        const MAX_SIZE_5MB = 5 * 1024 * 1024;
        return file.size <= MAX_SIZE_5MB;
      },
      { message: "Image size must be less than 5MB" }
    ),
});

const AddCropForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: "",
      commonName: "",
      description: "",
      image: undefined,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", values.image);

      const name = values.cropName;
      let url: string | undefined;
      try {
        url = await uploadFile(formData, name);
      } catch (error: any) {
        toast.error(`Failed to upload image: ${error.message}`);
        return; // Stop submission if image upload fails
      }

      const cropData = {
        name,
        cropImageUrl: url,
        description: values.description ?? "",
        commonNames: [{ commonName: values.commonName }],
      };

      const { error, message } = await createCrop(cropData);

      if (error) {
        setIsLoading(false);
        toast.error(message);
        return;
      }

      setIsLoading(false);
      setIsOpen(false);
      toast.success(message);
      form.reset();
    },
    [form]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4" />
          Add Crop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Crop</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cropName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Crop name</FormLabel>
                    <FormControl>
                      <Input placeholder="Barley" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Crop Common name</FormLabel>
                    <FormControl>
                      <Input placeholder="Barley" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field }, formState }) => (
                <FormItem>
                  <FormLabel required>Crop Image</FormLabel>
                  <FormControl>
                    <FileUpload
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onFileChange={(files) => {
                        if (files && files[0]) {
                          onChange(files[0]); // Pass the File object
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type description here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Adding crop...
                </>
              ) : (
                "Add Crop"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCropForm;
