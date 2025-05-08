import type { UserRole } from "@/drizzle/schema";

// there are no courses in this project
type Permission = "accessAdminPages" | "accessUploadPage";

const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [],
  ADMIN: ["accessUploadPage"],
  SUPERADMIN: ["accessUploadPage", "accessAdminPages"],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission);
}
