"use server";

import { updateUserStudyAccessByCode } from "@/features/studies/db/studyAccesses";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteUser as deleteUserDb,
  updateUser as updateUserDb,
} from "../db/users";

export async function deleteUser(id: number) {
  try {
    const user = await getCurrentUser();
    const canDeleteUser = hasPermission(user?.role, "user:delete");
    if (!canDeleteUser) {
      return {
        error: true,
        message: "You do not have permission to delete users.",
      };
    }
    await deleteUserDb({ id });
    return { error: false, message: "Successfully deleted the user" };
  } catch (error) {
    return { error: true, message: "Error deleting the user" };
  }
}

export async function updateUser({ id }: { id: number }, data: FormData) {
  const user = await getCurrentUser();
  const canUpdateUser = hasPermission(user?.role, "user:update");

  if (!canUpdateUser) {
    return {
      error: true,
      message: "You do not have permission to update users.",
    };
  }

  const studyAccess = JSON.parse((data.get("studyAccess") as string) ?? "[]");

  const userData = {
    firstName: data.get("firstName") as string,
    lastName: data.get("lastName") as string,
    email: data.get("email") as string,
    center: data.get("center") as string,
    role: data.get("role") as "USER" | "ADMIN" | "SUPERADMIN",
    emailVerified:
      data.get("status") === "Approved" ? new Date(Date.now()) : null,
  };
  const updatedUser = await updateUserDb({ id }, userData);
  if (updatedUser == null) throw new Error("Failed to update user");

  await updateUserStudyAccessByCode(id, studyAccess);

  return updatedUser;
}
