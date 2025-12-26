import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { productInputSchema } from "./schema";
import type { CreateProductInput } from "./types";

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      category: { select: { id: true, name: true } },
      unitGroup: { select: { id: true, name: true } },
    },
  });
}

function parseProductInput(raw: CreateProductInput) {
  const result = productInputSchema.safeParse(raw);
  if (!result.success) {
    throw errors.validation("Invalid product data", result.error.flatten().fieldErrors);
  }
  const { name, nameKr, categoryId, unitGroupId } = result.data;
  return {
    name,
    nameKr: nameKr ?? null,
    categoryId,
    unitGroupId,
  } satisfies CreateProductInput;
}

export async function createProduct(input: CreateProductInput) {
  const parsed = parseProductInput(input);

  const category = await prisma.productCategory.findUnique({ where: { id: parsed.categoryId } });
  if (!category) {
    throw errors.validation("Product category not found");
  }

  const unitGroup = await prisma.unitGroup.findUnique({ where: { id: parsed.unitGroupId } });
  if (!unitGroup) {
    throw errors.validation("Unit group not found");
  }

  const existing = await prisma.product.findUnique({
    where: { name_unitGroupId: { name: parsed.name, unitGroupId: parsed.unitGroupId } },
  });
  if (existing) {
    throw errors.conflict("Product already exists for this unit group");
  }

  return prisma.product.create({
    data: {
      name: parsed.name,
      name_kr: parsed.nameKr || null,
      categoryId: parsed.categoryId,
      unitGroupId: parsed.unitGroupId,
    },
  });
}

export async function updateProduct(id: number, input: CreateProductInput) {
  const parsed = parseProductInput(input);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw errors.notFound("Product not found");
  }

  const category = await prisma.productCategory.findUnique({ where: { id: parsed.categoryId } });
  if (!category) {
    throw errors.validation("Product category not found");
  }

  const unitGroup = await prisma.unitGroup.findUnique({ where: { id: parsed.unitGroupId } });
  if (!unitGroup) {
    throw errors.validation("Unit group not found");
  }

  const conflict = await prisma.product.findFirst({
    where: {
      name: parsed.name,
      unitGroupId: parsed.unitGroupId,
      NOT: { id },
    },
  });
  if (conflict) {
    throw errors.conflict("Product already exists for this unit group");
  }

  return prisma.product.update({
    where: { id },
    data: {
      name: parsed.name,
      name_kr: parsed.nameKr || null,
      categoryId: parsed.categoryId,
      unitGroupId: parsed.unitGroupId,
    },
  });
}

export async function deleteProduct(id: number) {
  const specs = await prisma.productSpec.count({ where: { productId: id } });
  if (specs > 0) {
    throw errors.conflict("Cannot delete product with existing specs");
  }
  await prisma.product.delete({ where: { id } });
}
