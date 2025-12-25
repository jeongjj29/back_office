"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@server/auth/guards";
import {
  createProductSpec,
  deleteProductSpec,
  listProductSpecs,
  updateProductSpec,
} from "@server/product-specs/service";
import { toResponseError } from "@lib/errors";

export async function listProductSpecsAction() {
  await requirePermission("PRODUCT_READ");
  return listProductSpecs();
}

export async function createProductSpecAction(formData: FormData) {
  await requirePermission("PRODUCT_WRITE");

  const productId = Number(formData.get("productId"));
  const vendorId = Number(formData.get("vendorId"));
  const unitId = Number(formData.get("unitId"));
  const description = formData.get("description");
  const caseSize = Number(formData.get("caseSize"));
  const unitSize = formData.get("unitSize");
  const brand = formData.get("brand");
  const sku = formData.get("sku");

  try {
    const spec = await createProductSpec({
      productId,
      vendorId,
      unitId,
      description: typeof description === "string" ? description : "",
      caseSize,
      unitSize: typeof unitSize === "string" ? unitSize : 0,
      brand: typeof brand === "string" ? brand : undefined,
      sku: typeof sku === "string" ? sku : undefined,
    });
    revalidatePath("/product-specs");
    return { spec };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateProductSpecAction(id: number, formData: FormData) {
  await requirePermission("PRODUCT_WRITE");

  const productId = Number(formData.get("productId"));
  const vendorId = Number(formData.get("vendorId"));
  const unitId = Number(formData.get("unitId"));
  const description = formData.get("description");
  const caseSize = Number(formData.get("caseSize"));
  const unitSize = formData.get("unitSize");
  const brand = formData.get("brand");
  const sku = formData.get("sku");

  try {
    const spec = await updateProductSpec(id, {
      productId,
      vendorId,
      unitId,
      description: typeof description === "string" ? description : "",
      caseSize,
      unitSize: typeof unitSize === "string" ? unitSize : 0,
      brand: typeof brand === "string" ? brand : undefined,
      sku: typeof sku === "string" ? sku : undefined,
    });
    revalidatePath("/product-specs");
    return { spec };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteProductSpecAction(id: number) {
  await requirePermission("PRODUCT_WRITE");
  try {
    await deleteProductSpec(id);
    revalidatePath("/product-specs");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
