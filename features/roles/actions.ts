"use server";

import { revalidatePath } from "next/cache";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { deleteRole, listRoles, updateRolePermissions } from "@server/roles/service";

export async function listRolesAction() {
  await requirePermission("ROLE_READ");
  return listRoles();
}

export async function updateRolePermissionsAction(roleKey: string, permissionKeys: string[]) {
  await requirePermission("ROLE_WRITE");
  try {
    const role = await updateRolePermissions(roleKey, permissionKeys);
    revalidatePath("/roles");
    return { role };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteRoleAction(roleKey: string) {
  await requirePermission("ROLE_WRITE");
  try {
    await deleteRole(roleKey);
    revalidatePath("/roles");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
