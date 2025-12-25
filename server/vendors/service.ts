import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import type { VendorType } from "@generated/prisma/client";

type CreateVendorInput = {
  name: string;
  type?: VendorType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  accountNumber?: string | null;
};

export async function listVendors() {
  return prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createVendor(input: CreateVendorInput) {
  const name = input.name?.trim();
  if (!name) {
    throw errors.validation("Vendor name is required");
  }

  const existing = await prisma.vendor.findUnique({ where: { name } });
  if (existing) {
    throw errors.conflict("Vendor name already exists");
  }

  return prisma.vendor.create({
    data: {
      name,
      type: input.type ?? "OTHER",
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      website: input.website?.trim() || null,
      accountNumber: input.accountNumber?.trim() || null,
    },
  });
}

export async function updateVendor(id: number, input: CreateVendorInput) {
  const name = input.name?.trim();
  if (!name) {
    throw errors.validation("Vendor name is required");
  }

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) {
    throw errors.notFound("Vendor not found");
  }

  const conflict = await prisma.vendor.findFirst({
    where: { name, NOT: { id } },
  });
  if (conflict) {
    throw errors.conflict("Vendor name already exists");
  }

  return prisma.vendor.update({
    where: { id },
    data: {
      name,
      type: input.type ?? vendor.type,
      phone: input.phone?.trim() ?? vendor.phone,
      email: input.email?.trim() ?? vendor.email,
      address: input.address?.trim() ?? vendor.address,
      website: input.website?.trim() ?? vendor.website,
      accountNumber: input.accountNumber?.trim() ?? vendor.accountNumber,
    },
  });
}

export async function deleteVendor(id: number) {
  await prisma.vendor.delete({ where: { id } });
}
