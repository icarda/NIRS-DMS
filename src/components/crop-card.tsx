import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCrop, updateCrop } from "@/features/crops/actions/crop";
import { uploadFile } from "@/lib/upload-asset";
import { cropFormSchema } from "./add-crop-form";
import { Crops } from "./crop-list";
import { FileUpload } from "./ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CropCardProps {
  crop: Crops[number];
  canUpdateCrop: boolean;
  canDeleteCrop: boolean;
}

export function CropCard({
  crop,
  canUpdateCrop,
  canDeleteCrop,
}: CropCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof cropFormSchema>>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      cropName: crop.name,
      description: crop.description ?? "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (editDialogOpen) {
      setRemoveImage(false);
    }
  }, [editDialogOpen]);

  const onSubmit = async (data: z.infer<typeof cropFormSchema>) => {
    setIsLoading(true);

    let imageUrl = crop.cropImageUrl;

    if (removeImage) {
      imageUrl = null;
    } else if (data.image) {
      try {
        const formData = new FormData();
        formData.append("file", data.image);
        imageUrl = await uploadFile(formData, data.cropName);
      } catch (error: any) {
        setIsLoading(false);
        toast.error(`Image upload failed: ${error.message}`);
        return;
      }
    }

    const updatePayload = {
      name: data.cropName,
      description: data.description ?? "",
      cropImageUrl: imageUrl!,
    };

    const { error, message } = await updateCrop(crop.id, updatePayload);

    if (error) {
      toast.error(message);
    } else {
      toast.success(message);
      setEditDialogOpen(false);
    }

    setIsLoading(false);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const result = await deleteCrop(crop.id);
      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success("Crop deleted successfully");
        setTimeout(() => {
          setDeleteDialogOpen(false);
        }, 200);
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast.error("Error deleting crop");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9]">
        <Link href={`/crop-ontology/${crop.id}`}>
          <Image
            src={crop.cropImageUrl || "/placeholder.svg"}
            alt={crop.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </Link>
      </div>
      <div className="flex flex-grow flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
          <CardTitle className="text-lg font-semibold">
            <Link href={`/crop-ontology/${crop.id}`}>{crop.name}</Link>
          </CardTitle>

          {canDeleteCrop && canUpdateCrop && (
            <Dialog
              open={editDialogOpen}
              onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open) {
                  form.reset();
                  setRemoveImage(false);
                  setPreviewUrl(null);
                }
              }}
            >
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DialogTrigger asChild>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </DialogTrigger>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Crop</DialogTitle>
                    <DialogDescription>
                      Make changes to your crop here.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col space-y-4"
                    >
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
                        name="image"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Crop image</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                {!removeImage &&
                                  (previewUrl || crop.cropImageUrl) && (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="relative">
                                        <Image
                                          src={
                                            previewUrl ||
                                            crop.cropImageUrl ||
                                            "/placeholder.svg"
                                          }
                                          alt="Crop image preview"
                                          width={192}
                                          height={192}
                                          className="h-48 w-48 rounded object-cover"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute right-2 top-2"
                                          onClick={() => {
                                            setRemoveImage(true);
                                            onChange(undefined);
                                            setPreviewUrl(null);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                {(removeImage || !crop.cropImageUrl) && (
                                  <FileUpload
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onFileChange={(files) => {
                                      if (files && files[0]) {
                                        setRemoveImage(false);
                                        onChange(files[0]);
                                        setPreviewUrl(
                                          URL.createObjectURL(files[0])
                                        );
                                      }
                                    }}
                                    {...field}
                                  />
                                )}
                              </div>
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
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="ml-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Editing crop...
                          </>
                        ) : (
                          "Edit Crop"
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Do you want to delete this
                      crop?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Dialog>
          )}
        </CardHeader>

        <CardContent className="p-3 pt-2">
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {crop.description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
