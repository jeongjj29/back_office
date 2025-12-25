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
