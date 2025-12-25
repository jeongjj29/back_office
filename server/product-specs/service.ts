import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { Prisma } from "@generated/prisma/client";

type CreateProductSpecInput = {
  productId: number;
  vendorId: number;
  unitId: number;
  description: string;
  caseSize: number;
  unitSize: string | number;
  brand?: string | null;
  sku?: string | null;
};

export async function listProductSpecs() {
  return prisma.productSpec.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
      vendor: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
    },
  });
}

export async function createProductSpec(input: CreateProductSpecInput) {
  const description = input.description?.trim();
  if (!description) {
    throw errors.validation("Description is required");
  }
  if (!input.caseSize || input.caseSize <= 0) {
    throw errors.validation("Case size must be greater than zero");
  }

  const [product, vendor, unit] = await Promise.all([
    prisma.product.findUnique({ where: { id: input.productId } }),
    prisma.vendor.findUnique({ where: { id: input.vendorId } }),
    prisma.unit.findUnique({ where: { id: input.unitId } }),
  ]);

  if (!product) throw errors.validation("Product not found");
  if (!vendor) throw errors.validation("Vendor not found");
  if (!unit) throw errors.validation("Unit not found");

  const unitSize = new Prisma.Decimal(input.unitSize);

  const existing = await prisma.productSpec.findFirst({
    where: {
      productId: input.productId,
      vendorId: input.vendorId,
      brand: input.brand ?? "",
      caseSize: input.caseSize,
      unitSize,
    },
  });

  if (existing) {
    throw errors.conflict("Product spec already exists for this vendor/product combination");
  }

  return prisma.productSpec.create({
    data: {
      productId: input.productId,
      vendorId: input.vendorId,
      unitId: input.unitId,
      description,
      caseSize: input.caseSize,
      unitSize,
      brand: input.brand ?? "",
      sku: input.sku ?? null,
    },
  });
}

export async function updateProductSpec(id: number, input: CreateProductSpecInput) {
  const description = input.description?.trim();
  if (!description) {
    throw errors.validation("Description is required");
  }
  if (!input.caseSize || input.caseSize <= 0) {
    throw errors.validation("Case size must be greater than zero");
  }

  const spec = await prisma.productSpec.findUnique({ where: { id } });
  if (!spec) {
    throw errors.notFound("Product spec not found");
  }

  const [product, vendor, unit] = await Promise.all([
    prisma.product.findUnique({ where: { id: input.productId } }),
    prisma.vendor.findUnique({ where: { id: input.vendorId } }),
    prisma.unit.findUnique({ where: { id: input.unitId } }),
  ]);

  if (!product) throw errors.validation("Product not found");
  if (!vendor) throw errors.validation("Vendor not found");
  if (!unit) throw errors.validation("Unit not found");

  const unitSize = new Prisma.Decimal(input.unitSize);

  const conflict = await prisma.productSpec.findFirst({
    where: {
      productId: input.productId,
      vendorId: input.vendorId,
      brand: input.brand ?? "",
      caseSize: input.caseSize,
      unitSize,
      NOT: { id },
    },
  });

  if (conflict) {
    throw errors.conflict("Product spec already exists for this vendor/product combination");
  }

  return prisma.productSpec.update({
    where: { id },
    data: {
      productId: input.productId,
      vendorId: input.vendorId,
      unitId: input.unitId,
      description,
      caseSize: input.caseSize,
      unitSize,
      brand: input.brand ?? "",
      sku: input.sku ?? null,
    },
  });
}

export async function deleteProductSpec(id: number) {
  await prisma.productSpec.delete({ where: { id } });
}
