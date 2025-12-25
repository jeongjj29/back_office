"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@server/auth/guards";
import { createVendor, deleteVendor, listVendors, updateVendor } from "@server/vendors/service";
import type { VendorType } from "@generated/prisma/client";
import { toResponseError } from "@lib/errors";

export async function listVendorsAction() {
  await requirePermission("VENDOR_READ");
  return listVendors();
}

export async function createVendorAction(formData: FormData) {
  await requirePermission("VENDOR_WRITE");
  const name = formData.get("name");
  const type = formData.get("type");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const address = formData.get("address");
  const website = formData.get("website");
  const accountNumber = formData.get("accountNumber");

  try {
    const vendor = await createVendor({
      name: typeof name === "string" ? name : "",
      type: parseVendorType(type),
      phone: typeof phone === "string" ? phone : undefined,
      email: typeof email === "string" ? email : undefined,
      address: typeof address === "string" ? address : undefined,
      website: typeof website === "string" ? website : undefined,
      accountNumber: typeof accountNumber === "string" ? accountNumber : undefined,
    });
    revalidatePath("/vendors");
    return { vendor };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateVendorAction(id: number, formData: FormData) {
  await requirePermission("VENDOR_WRITE");
  const name = formData.get("name");
  const type = formData.get("type");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const address = formData.get("address");
  const website = formData.get("website");
  const accountNumber = formData.get("accountNumber");

  try {
    const vendor = await updateVendor(id, {
      name: typeof name === "string" ? name : "",
      type: parseVendorType(type),
      phone: typeof phone === "string" ? phone : undefined,
      email: typeof email === "string" ? email : undefined,
      address: typeof address === "string" ? address : undefined,
      website: typeof website === "string" ? website : undefined,
      accountNumber: typeof accountNumber === "string" ? accountNumber : undefined,
    });
    revalidatePath("/vendors");
    return { vendor };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

function parseVendorType(value: unknown): VendorType | undefined {
  if (value === "INVENTORY" || value === "SERVICE" || value === "UTILITY" || value === "OTHER") {
    return value;
  }
  return undefined;
}

export async function deleteVendorAction(id: number) {
  await requirePermission("VENDOR_WRITE");
  try {
    await deleteVendor(id);
    revalidatePath("/vendors");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
