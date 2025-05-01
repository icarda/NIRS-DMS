"use server";

import fs from "node:fs/promises";

import { revalidatePath } from "next/cache";

export async function uploadFile(formData: FormData, name: string) {
  const file = formData.get("file") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // check if image is already uploaded
  const fileExists = await fs
    .access(`./public/${name.toLowerCase()}.${file.name.split(".").at(-1)}`)
    .then(() => true)
    .catch(() => false);

  if (fileExists) {
    return `/${name.toLowerCase()}.${file.name.split(".").at(-1)}`;
  }

  await fs.writeFile(
    `./public/${name.toLowerCase()}.${file.name.split(".").at(-1)}`,
    buffer
  );
  return `/${name.toLowerCase()}.${file.name.split(".").at(-1)}`;
}
