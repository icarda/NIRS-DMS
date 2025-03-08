"use server";

import { z } from "zod";

import { deleteStudy as deleteStudyDb, insertStudy } from "../db/study";
import { studySchema } from "../schemas/study";

export async function createStudy(unsafeData: z.infer<typeof studySchema>) {
  const { success, data } = studySchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the study" };
  }

  try {
    await insertStudy(data);
  } catch (error) {
    return { error: true, message: "There was an error creating the study" };
  }
}

export async function deleteStudy(id: number) {
  try {
    await deleteStudyDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}
