"use server";

import {
  deleteUser as deleteUserDb,
  updateUser as updateUserDb,
} from "../db/users";

export async function deleteUser(id: number) {
  try {
    await deleteUserDb({ id });
    return { error: false, message: "Successfully deleted the user" };
  } catch (error) {
    return { error: true, message: "Error deleting the user" };
  }
}

export async function updateUser({ id }: { id: number }, data: FormData) {
  const userData = {
    firstName: data.get("firstName") as string,
    lastName: data.get("lastName") as string,
    email: data.get("email") as string,
    center: data.get("center") as string,
    role: data.get("role") as "USER" | "ADMIN" | "SUPERADMIN",
    studyAccess: JSON.parse((data.get("studyAccess") as string) ?? ""),
    // this is a timestamp
    emailVerified:
      data.get("status") === "Approved" ? new Date(Date.now()) : null,
  };
  const updatedUser = await updateUserDb({ id }, userData);
  if (updatedUser == null) throw new Error("Failed to update user");
}
