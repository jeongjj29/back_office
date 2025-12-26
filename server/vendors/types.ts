import type { VendorType } from "@generated/prisma/client";

export type CreateVendorInput = {
  name: string;
  type?: VendorType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  accountNumber?: string | null;
};
