import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { Prisma } from "@generated/prisma/client";
import { productSpecSchema } from "./schema";
import type { CreateProductSpecInput } from "./types";

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

function parseProductSpec(raw: CreateProductSpecInput) {
  const result = productSpecSchema.safeParse(raw);
  if (!result.success) {
    throw errors.validation("Invalid product spec data", result.error.flatten().fieldErrors);
  }
  const { description, brand, sku, ...rest } = result.data;
  return {
    ...rest,
    description,
    brand: brand ?? "",
    sku: sku ?? null,
  } satisfies CreateProductSpecInput;
}

export async function createProductSpec(input: CreateProductSpecInput) {
  const parsed = parseProductSpec(input);

  const [product, vendor, unit] = await Promise.all([
    prisma.product.findUnique({ where: { id: parsed.productId } }),
    prisma.vendor.findUnique({ where: { id: parsed.vendorId } }),
    prisma.unit.findUnique({ where: { id: parsed.unitId } }),
  ]);

  if (!product) throw errors.validation("Product not found");
  if (!vendor) throw errors.validation("Vendor not found");
  if (!unit) throw errors.validation("Unit not found");

  const unitSize = new Prisma.Decimal(parsed.unitSize);

  const existing = await prisma.productSpec.findFirst({
    where: {
      productId: parsed.productId,
      vendorId: parsed.vendorId,
      brand: parsed.brand ?? "",
      caseSize: parsed.caseSize,
      unitSize,
    },
  });

  if (existing) {
    throw errors.conflict("Product spec already exists for this vendor/product combination");
  }

  return prisma.productSpec.create({
    data: {
      productId: parsed.productId,
      vendorId: parsed.vendorId,
      unitId: parsed.unitId,
      description: parsed.description,
      caseSize: parsed.caseSize,
      unitSize,
      brand: parsed.brand ?? "",
      sku: parsed.sku ?? null,
    },
  });
}

export async function updateProductSpec(id: number, input: CreateProductSpecInput) {
  const parsed = parseProductSpec(input);

  const spec = await prisma.productSpec.findUnique({ where: { id } });
  if (!spec) {
    throw errors.notFound("Product spec not found");
  }

  const [product, vendor, unit] = await Promise.all([
    prisma.product.findUnique({ where: { id: parsed.productId } }),
    prisma.vendor.findUnique({ where: { id: parsed.vendorId } }),
    prisma.unit.findUnique({ where: { id: parsed.unitId } }),
  ]);

  if (!product) throw errors.validation("Product not found");
  if (!vendor) throw errors.validation("Vendor not found");
  if (!unit) throw errors.validation("Unit not found");

  const unitSize = new Prisma.Decimal(parsed.unitSize);

  const conflict = await prisma.productSpec.findFirst({
    where: {
      productId: parsed.productId,
      vendorId: parsed.vendorId,
      brand: parsed.brand ?? "",
      caseSize: parsed.caseSize,
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
      productId: parsed.productId,
      vendorId: parsed.vendorId,
      unitId: parsed.unitId,
      description: parsed.description,
      caseSize: parsed.caseSize,
      unitSize,
      brand: parsed.brand ?? "",
      sku: parsed.sku ?? null,
    },
  });
}

export async function deleteProductSpec(id: number) {
  await prisma.productSpec.delete({ where: { id } });
}
