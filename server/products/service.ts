import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";

type CreateProductInput = {
  name: string;
  nameKr?: string | null;
  categoryId: number;
  unitGroupId: number;
};

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      category: { select: { id: true, name: true } },
      unitGroup: { select: { id: true, name: true } },
    },
  });
}

export async function createProduct(input: CreateProductInput) {
  const name = input.name?.trim();
  if (!name) {
    throw errors.validation("Product name is required");
  }

  const category = await prisma.productCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw errors.validation("Product category not found");
  }

  const unitGroup = await prisma.unitGroup.findUnique({ where: { id: input.unitGroupId } });
  if (!unitGroup) {
    throw errors.validation("Unit group not found");
  }

  const existing = await prisma.product.findUnique({
    where: { name_unitGroupId: { name, unitGroupId: input.unitGroupId } },
  });
  if (existing) {
    throw errors.conflict("Product already exists for this unit group");
  }

  return prisma.product.create({
    data: {
      name,
      name_kr: input.nameKr?.trim() || null,
      categoryId: input.categoryId,
      unitGroupId: input.unitGroupId,
    },
  });
}

export async function updateProduct(id: number, input: CreateProductInput) {
  const name = input.name?.trim();
  if (!name) {
    throw errors.validation("Product name is required");
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw errors.notFound("Product not found");
  }

  const category = await prisma.productCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw errors.validation("Product category not found");
  }

  const unitGroup = await prisma.unitGroup.findUnique({ where: { id: input.unitGroupId } });
  if (!unitGroup) {
    throw errors.validation("Unit group not found");
  }

  const conflict = await prisma.product.findFirst({
    where: {
      name,
      unitGroupId: input.unitGroupId,
      NOT: { id },
    },
  });
  if (conflict) {
    throw errors.conflict("Product already exists for this unit group");
  }

  return prisma.product.update({
    where: { id },
    data: {
      name,
      name_kr: input.nameKr?.trim() || null,
      categoryId: input.categoryId,
      unitGroupId: input.unitGroupId,
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
