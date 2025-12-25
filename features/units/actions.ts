"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@server/auth/guards";
import {
  createUnit,
  createUnitGroup,
  deleteUnit,
  deleteUnitGroup,
  listUnitGroupsWithUnits,
  updateUnit,
  updateUnitGroup,
} from "@server/units/service";
import { toResponseError } from "@lib/errors";

export async function listUnitGroupsAction() {
  await requirePermission("UNIT_READ");
  return listUnitGroupsWithUnits();
}

export async function createUnitGroupAction(formData: FormData) {
  await requirePermission("UNIT_WRITE");
  const name = formData.get("name");
  try {
    const unitGroup = await createUnitGroup({
      name: typeof name === "string" ? name : "",
    });
    revalidatePath("/units");
    return { unitGroup };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function createUnitAction(formData: FormData) {
  await requirePermission("UNIT_WRITE");
  const unitGroupId = Number(formData.get("unitGroupId"));
  const name = formData.get("name");
  const abbreviation = formData.get("abbreviation");
  const factor = formData.get("factor");

  try {
    const unit = await createUnit({
      unitGroupId,
      name: typeof name === "string" ? name : "",
      abbreviation: typeof abbreviation === "string" ? abbreviation : "",
      factor: typeof factor === "string" ? factor : 0,
    });
    revalidatePath("/units");
    return { unit };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateUnitGroupAction(id: number, formData: FormData) {
  await requirePermission("UNIT_WRITE");
  const name = formData.get("name");
  try {
    const unitGroup = await updateUnitGroup(id, typeof name === "string" ? name : "");
    revalidatePath("/units");
    return { unitGroup };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteUnitGroupAction(id: number) {
  await requirePermission("UNIT_WRITE");
  try {
    await deleteUnitGroup(id);
    revalidatePath("/units");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateUnitAction(id: number, formData: FormData) {
  await requirePermission("UNIT_WRITE");
  const unitGroupId = Number(formData.get("unitGroupId"));
  const name = formData.get("name");
  const abbreviation = formData.get("abbreviation");
  const factor = formData.get("factor");

  try {
    const unit = await updateUnit(id, {
      unitGroupId,
      name: typeof name === "string" ? name : "",
      abbreviation: typeof abbreviation === "string" ? abbreviation : "",
      factor: typeof factor === "string" ? factor : 0,
    });
    revalidatePath("/units");
    return { unit };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteUnitAction(id: number) {
  await requirePermission("UNIT_WRITE");
  try {
    await deleteUnit(id);
    revalidatePath("/units");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
