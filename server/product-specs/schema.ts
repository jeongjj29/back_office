import { z } from "zod";

export const productSpecSchema = z.object({
  productId: z.number().int().positive(),
  vendorId: z.number().int().positive(),
  unitId: z.number().int().positive(),
  description: z.string().trim().min(1, "Description is required"),
  caseSize: z.number().positive(),
  unitSize: z.union([z.string(), z.number()]),
  brand: z.string().trim().optional(),
  sku: z.string().trim().optional(),
});
