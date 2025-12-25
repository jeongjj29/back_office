"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@server/auth/guards";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@server/products/service";
import { toResponseError } from "@lib/errors";

export async function listProductsAction() {
  await requirePermission("PRODUCT_READ");
  return listProducts();
}

export async function createProductAction(formData: FormData) {
  await requirePermission("PRODUCT_WRITE");

  const name = formData.get("name");
  const nameKr = formData.get("nameKr");
  const categoryId = Number(formData.get("categoryId"));
  const unitGroupId = Number(formData.get("unitGroupId"));

  try {
    const product = await createProduct({
      name: typeof name === "string" ? name : "",
      nameKr: typeof nameKr === "string" ? nameKr : undefined,
      categoryId,
      unitGroupId,
    });
    revalidatePath("/products");
    return { product };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function updateProductAction(id: number, formData: FormData) {
  await requirePermission("PRODUCT_WRITE");

  const name = formData.get("name");
  const nameKr = formData.get("nameKr");
  const categoryId = Number(formData.get("categoryId"));
  const unitGroupId = Number(formData.get("unitGroupId"));

  try {
    const product = await updateProduct(id, {
      name: typeof name === "string" ? name : "",
      nameKr: typeof nameKr === "string" ? nameKr : undefined,
      categoryId,
      unitGroupId,
    });
    revalidatePath("/products");
    return { product };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}

export async function deleteProductAction(id: number) {
  await requirePermission("PRODUCT_WRITE");
  try {
    await deleteProduct(id);
    revalidatePath("/products");
    return { ok: true };
  } catch (error) {
    const { body, status } = toResponseError(error);
    return { error: body.error, status };
  }
}
