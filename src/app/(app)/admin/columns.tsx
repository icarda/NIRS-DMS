"use client";

import { useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/app/(app)/explore/table/data-table-column-header";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrialMetadataType, UserRole } from "@/drizzle/schema";
import { deleteNirModel } from "@/features/nir-models/actions/nir-model";
import { deletePhysiologicalStage } from "@/features/studies/actions/physiological-stage";
import { deleteProductType } from "@/features/studies/actions/product-type";
import { deleteStudyMetadata } from "@/features/studies/actions/study";
import { deleteTrialMetadata } from "@/features/trials/actions/trial";
import { deleteUser, updateUser } from "@/features/users/actions/user";
import { capitalize, labelToCamel } from "@/lib/utils";
import { MetadataEditDialog } from "./components/metadata-edit-dialog";
import { UserDeleteDialog } from "./components/user-delete-dialog";
import { UserEditDialog } from "./components/user-edit-dialog";

export type User = {
  id: number;
  fullName: string;
  role: UserRole;
  email: string;
  center: string;
  // studyAccess: string[];
  status: string;
};

export type ProductType = {
  id: number;
  type: string;
  crop: string;
};

export type PhysiologicalStage = {
  id: number;
  stage: string;
  crop: string;
};

export type NIRModel = {
  id: number;
  name: string;
  type: string;
  wavelengthRange: string;
  resolution: string;
  manufacturer: string;
};

export type MetadataSchema = {
  id: number;
  name: string;
  label: string;
  type: TrialMetadataType;
  defaultValue: string;
  required: boolean;
  min: string | null;
  max: string | null;
  source: "sql" | "json";
};

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-Mail" />
    ),
  },
  {
    accessorKey: "center",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Center" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "Approved" ? "default" : "warning"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

      const handleEdit = async (data: any) => {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("email", data.email);
        formData.append("center", data.center);
        formData.append("role", data.role);
        formData.append("studyAccess", JSON.stringify(data.studyAccess));
        formData.append("status", data.approved ? "Approved" : "Pending");

        try {
          await updateUser({ id: user.id }, formData);
          toast.success("User updated successfully");
        } catch (error) {
          console.error("Error updating user:", error);
          toast.error("Error updating user");
        } finally {
          setEditDialogOpen(false);
        }
      };

      const handleDelete = async () => {
        await deleteUser(user.id);
        setDeleteDialogOpen(false);
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
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <UserEditDialog
            user={user}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={handleEdit}
          />

          <UserDeleteDialog
            user={user}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
          />
        </>
      );
    },
  },
];

export const productTypeColumns: ColumnDef<ProductType>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "crop",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Crop" />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const productType = row.original;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        try {
          setIsLoading(true);
          const result = await deleteProductType(productType.id);
          if (result.error) {
            toast.error(result.message);
          } else {
            toast.success("Product type deleted successfully");
            setDeleteDialogOpen(false);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error deleting product type:", error);
          toast.error("Error deleting product type");
          setIsLoading(false);
        }
      };

      return (
        <>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the product type{" "}
                  <span className="font-medium">{productType.type}</span> for
                  crop <span className="font-medium">{productType.crop}</span>.
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

export const physiologicalStageColumns: ColumnDef<PhysiologicalStage>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "crop",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Crop" />
    ),
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const physiologicalStage = row.original;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        try {
          setIsLoading(true);
          const result = await deletePhysiologicalStage(physiologicalStage.id);
          if (result.error) {
            toast.error(result.message);
          } else {
            toast.success("Physiological stage deleted successfully");
            setDeleteDialogOpen(false);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error deleting physiological stage:", error);
          toast.error("Error deleting physiological stage");
          setIsLoading(false);
        }
      };

      return (
        <>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the physiological stage{" "}
                  <span className="font-medium">
                    {physiologicalStage.stage}
                  </span>
                  . This action cannot be undone.
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

export const NIRModelColumns: ColumnDef<NIRModel>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
  },
  {
    accessorKey: "wavelengthRange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Wavelength Range" />
    ),
  },
  {
    accessorKey: "resolution",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resolution" />
    ),
  },
  {
    accessorKey: "manufacturer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manufacturer" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const nirModel = row.original;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        try {
          setIsLoading(true);
          const result = await deleteNirModel(nirModel.id);
          if (result.error) {
            toast.error(result.message);
          } else {
            toast.success("NIR model deleted successfully");
            setIsLoading(false);
            setDeleteDialogOpen(false);
          }
        } catch (error) {
          console.error("Error deleting NIR model:", error);
          toast.error("Error deleting NIR model");
          setIsLoading(false);
        }
      };

      return (
        <>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the NIR model{" "}
                  <span className="font-medium">{nirModel.name}</span>. This
                  action cannot be undone.
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

export const trialMetadataColumns: ColumnDef<MetadataSchema>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("type") as string;
      return capitalize(value);
    },
  },
  {
    accessorKey: "defaultValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Default Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("defaultValue");
      return !value ? "NULL" : value;
    },
  },
  {
    accessorKey: "required",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Required" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("required");
      return value ? "YES" : "NO";
    },
  },
  {
    accessorKey: "min_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Minimum Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("min_value");
      return !value ? "NULL" : value;
    },
  },
  {
    accessorKey: "max_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Maxmimum Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("max_value");
      return !value ? "NULL" : value;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const metadata = row.original;
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        if (metadata.source === "sql") return;
        setIsLoading(true);
        const res = await deleteTrialMetadata(metadata.name);

        if (res.error) {
          toast.error(res.message);
          setIsLoading(false);
          return;
        }

        toast.success(res.message);
        setIsLoading(false);
        setDeleteDialogOpen(false);
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
              disabled={metadata.source === "sql"}
              onClick={() => {
                if (metadata.source === "sql") return;
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <MetadataEditDialog
            metadata={metadata}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            type="trial"
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the trial metadata{" "}
                  <span className="font-medium">{metadata.name}</span>. This
                  action cannot be undone.
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

export const studyMetadataColumns: ColumnDef<MetadataSchema>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "defaultValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Default Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("defaultValue");
      return !value ? "NULL" : value;
    },
  },
  {
    accessorKey: "required",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Required" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("required");
      return value ? "YES" : "NO";
    },
  },
  {
    accessorKey: "min_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Minimum Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("min_value");
      return !value ? "NULL" : value;
    },
  },
  {
    accessorKey: "max_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Maxmimum Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("max_value");
      return !value ? "NULL" : value;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const metadata = row.original;
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        if (metadata.source === "sql") return;
        setIsLoading(true);
        const res = await deleteStudyMetadata(metadata.name);

        if (res.error) {
          toast.error(res.message);
          setIsLoading(false);
          return;
        }

        toast.success(res.message);
        setIsLoading(false);
        setDeleteDialogOpen(false);
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
              disabled={metadata.source === "sql"}
              onClick={() => {
                if (metadata.source === "sql") return;
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <MetadataEditDialog
            metadata={metadata}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            type="study"
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the study metadata{" "}
                  <span className="font-medium">{metadata.name}</span>. This
                  action cannot be undone.
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
