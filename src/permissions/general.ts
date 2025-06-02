import type { UserRole } from "@/drizzle/schema";

type Resource =
  | "admin"
  | "upload"
  | "nirs"
  | "trait"
  | "crop"
  | "cropTrait"
  | "productType"
  | "nirModel"
  | "physiologicalStage"
  | "user"
  | "trialMetadata"
  | "trial"
  | "studyMetadata"
  | "studyAccess";
type Action = "access" | "create" | "update" | "delete" | "upload";

type Permission = `${Resource}:${Action}`;

const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [],
  ADMIN: [
    "upload:access",
    "nirs:upload",
    "nirs:access",
    "trait:access",
    "trait:upload",
    "crop:create",
    "cropTrait:create",
    "cropTrait:update",
  ],
  SUPERADMIN: [
    "upload:access",
    "admin:access",
    "nirs:upload",
    "nirs:access",
    "trait:access",
    "trait:upload",
    "crop:create",
    "cropTrait:create",
    "cropTrait:update",
    "user:update",
    "user:delete",
    "physiologicalStage:create",
    "physiologicalStage:delete",
    "nirModel:create",
    "nirModel:delete",
    "productType:create",
    "productType:delete",
    "trialMetadata:create",
    "trialMetadata:update",
    "trialMetadata:delete",
    "studyMetadata:create",
    "studyMetadata:update",
    "studyMetadata:delete",
    "studyAccess:update",
  ],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission);
}
