import type { UserRole } from "@/drizzle/schema";

// there are no courses in this project
type Permission =
  | "accessAdminPages"
  | "accessUploadPage"
  | "createCrop"
  | "createCropTrait";

const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [],
  ADMIN: ["accessUploadPage", "createCrop", "createCropTrait"],
  SUPERADMIN: [
    "accessUploadPage",
    "accessAdminPages",
    "createCrop",
    "createCropTrait",
  ],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission);
}
