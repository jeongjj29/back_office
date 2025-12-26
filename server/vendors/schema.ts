import { z } from "zod";

export const vendorInputSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required"),
  type: z.enum(["INVENTORY", "SERVICE", "UTILITY", "OTHER"]).optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().optional(),
  website: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
});
