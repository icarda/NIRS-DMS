import type { UserRole } from "@/drizzle/schema";

type Permission =
  | "admin:access"
  | "upload:access"
  | "nirs:upload"
  | "nirs:access"
  | "trait:access"
  | "trait:create"
  | "trait:upload"
  | "crop:create"
  | "cropTrait:create"
  | "productType:create"
  | "productType:delete"
  | "nirModel:create"
  | "nirModel:delete"
  | "physiologicalStage:create"
  | "physiologicalStage:delete"
  | "user:update"
  | "user:delete"
  | "trialMetadata:create"
  | "trialMetadata:update"
  | "trialMetadata:delete"
  | "trial:create"
  | "trial:update"
  | "trial:delete"
  | "studyMetadata:create"
  | "studyMetadata:update"
  | "studyMetadata:delete";

const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [],
  ADMIN: [
    "upload:access",
    "nirs:upload",
    "nirs:access",
    "trait:access",
    "crop:create",
    "cropTrait:create",
  ],
  SUPERADMIN: [
    "upload:access",
    "admin:access",
    "nirs:upload",
    "nirs:access",
    "trait:access",
    "crop:create",
    "cropTrait:create",
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
  ],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission);
}
