import type { UserRole } from "@/drizzle/schema";

type Permission =
  | "accessAdminPages"
  | "accessUploadPage"
  | "createCrop"
  | "createCropTrait"
  | "uploadNirsData"
  | "updateUser"
  | "deleteUser"
  | "createPhysiologicalStage"
  | "deletePhysiologicalStage"
  | "createNirModel"
  | "deleteNirModel"
  | "createProductType"
  | "deleteProductType"
  | "createTrialConfigMetadata"
  | "updateTrialConfigMetadata"
  | "deleteTrialConfigMetadata"
  | "createStudyConfigMetadata"
  | "updateStudyConfigMetadata"
  | "deleteStudyConfigMetadata"
  | "accessNirsData"
  | "accessTraitData";

const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [],
  ADMIN: [
    "accessUploadPage",
    "createCrop",
    "createCropTrait",
    "uploadNirsData",
    "accessNirsData",
    "accessTraitData",
  ],
  SUPERADMIN: [
    "accessUploadPage",
    "accessAdminPages",
    "createCrop",
    "createCropTrait",
    "uploadNirsData",
    "updateUser",
    "deleteUser",
    "createPhysiologicalStage",
    "deletePhysiologicalStage",
    "createNirModel",
    "deleteNirModel",
    "createProductType",
    "deleteProductType",
    "createTrialConfigMetadata",
    "updateTrialConfigMetadata",
    "deleteTrialConfigMetadata",
    "createStudyConfigMetadata",
    "updateStudyConfigMetadata",
    "deleteStudyConfigMetadata",
    "accessNirsData",
    "accessTraitData",
  ],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission);
}
