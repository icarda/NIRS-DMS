import { useEffect, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Crop } from "@/components/crop-page-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getCrop } from "@/features/crops/actions/crop";
import {
  deleteCropTrait,
  getAllCropTraitUnits,
} from "@/features/traits/actions/crop-trait";
import { CropTraitEditDialog } from "./components/crop-trait-edit-dialog";

type CropTrait = Exclude<Crop, undefined>["cropTraits"][number];

export const traitColumns: ColumnDef<CropTrait>[] = [
  {
    header: "Trait variable",
    accessorKey: "traitVariable",
  },
  {
    header: "Trait name",
    accessorKey: "traitName",
  },
  {
    header: "Entity",
    accessorKey: "entity",
  },
  {
    header: "Method",
    accessorKey: "methodDescription",
  },
  {
    header: "Unit",
    accessorKey: "unit",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const cropTrait = row.original;
      cropTrait.cropId;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [crop, setCrop] = useState<Crop | null>(null);

      const [units, setUnits] = useState<string[]>([]);

      useEffect(() => {
        const fetchUnits = async () => {
          const fetchedUnits = await getAllCropTraitUnits();
          const crop = await getCrop({ cropId: cropTrait.cropId });
          setUnits(fetchedUnits);
          setCrop(crop);
        };

        fetchUnits();
      }, []);

      console.log("Crop trait units:", units);
      console.log("Crop:", crop);

      const handleDelete = async () => {
        try {
          setIsLoading(true);
          const result = await deleteCropTrait(cropTrait.id);
          if (result.error) {
            toast.error(result.message);
          } else {
            toast.success("Crop trait deleted successfully");
            setDeleteDialogOpen(false);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error deleting crop trait:", error);
          toast.error("Error deleting crop trait");
          setIsLoading(false);
        }
      };

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <CropTraitEditDialog
            cropTrait={cropTrait}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            units={units}
            crop={crop}
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the trait{" "}
                  <span className="font-medium">{cropTrait.traitName}</span>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
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
        </>
      );
    },
  },
];
