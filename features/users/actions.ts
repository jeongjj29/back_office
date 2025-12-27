"use server";

import { revalidatePath } from "next/cache";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createUser, deleteUser, listUsers, updateUser } from "@server/users/service";

export async function listUsersAction() {
  await requirePermission("USER_READ");
  return listUsers();
}

export async function createUserAction(formData: FormData) {
  await requirePermission("USER_WRITE");
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const roleKey = formData.get("roleKey");

  try {
    const user = await createUser({
      email: typeof email === "string" ? email : "",
      name: typeof name === "string" ? name : undefined,
      password: typeof password === "string" ? password : "",
      roleKey: typeof roleKey === "string" ? roleKey : "",
    });
    revalidatePath("/users");
    return { user };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateUserAction(id: number, formData: FormData) {
  await requirePermission("USER_WRITE");
  const name = formData.get("name");
  const password = formData.get("password");
  const roleKey = formData.get("roleKey");

  try {
    const user = await updateUser(id, {
      name: typeof name === "string" ? name : undefined,
      password: typeof password === "string" ? password : undefined,
      roleKey: typeof roleKey === "string" ? roleKey : undefined,
    });
    revalidatePath("/users");
    return { user };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteUserAction(id: number) {
  await requirePermission("USER_WRITE");
  try {
    await deleteUser(id);
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
