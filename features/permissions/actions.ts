"use server";

import { revalidatePath } from "next/cache";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { deletePermission, listPermissions } from "@server/permissions/service";

export async function listPermissionsAction() {
  await requirePermission("ROLE_READ");
  return listPermissions();
}

export async function deletePermissionAction(key: string) {
  await requirePermission("ROLE_WRITE");
  try {
    await deletePermission(key);
    revalidatePath("/permissions");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
