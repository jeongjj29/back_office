import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { vendorInputSchema } from "./schema";
import type { CreateVendorInput } from "./types";

export async function listVendors() {
  return prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });
}

function parseVendorInput(raw: CreateVendorInput) {
  const result = vendorInputSchema.safeParse(raw);
  if (!result.success) {
    throw errors.validation("Invalid vendor data", result.error.flatten().fieldErrors);
  }
  const { name, type, phone, email, address, website, accountNumber } = result.data;
  return {
    name,
    type,
    phone: phone ?? null,
    email: email ?? null,
    address: address ?? null,
    website: website ?? null,
    accountNumber: accountNumber ?? null,
  } satisfies CreateVendorInput;
}

export async function createVendor(input: CreateVendorInput) {
  const parsed = parseVendorInput(input);

  const existing = await prisma.vendor.findUnique({ where: { name: parsed.name } });
  if (existing) {
    throw errors.conflict("Vendor name already exists");
  }

  return prisma.vendor.create({
    data: {
      name: parsed.name,
      type: parsed.type ?? "OTHER",
      phone: parsed.phone,
      email: parsed.email,
      address: parsed.address,
      website: parsed.website,
      accountNumber: parsed.accountNumber,
    },
  });
}

export async function updateVendor(id: number, input: CreateVendorInput) {
  const parsed = parseVendorInput(input);

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) {
    throw errors.notFound("Vendor not found");
  }

  const conflict = await prisma.vendor.findFirst({
    where: { name: parsed.name, NOT: { id } },
  });
  if (conflict) {
    throw errors.conflict("Vendor name already exists");
  }

  return prisma.vendor.update({
    where: { id },
    data: {
      name: parsed.name,
      type: parsed.type ?? vendor.type,
      phone: parsed.phone ?? vendor.phone,
      email: parsed.email ?? vendor.email,
      address: parsed.address ?? vendor.address,
      website: parsed.website ?? vendor.website,
      accountNumber: parsed.accountNumber ?? vendor.accountNumber,
    },
  });
}

export async function deleteVendor(id: number) {
  await prisma.vendor.delete({ where: { id } });
}
