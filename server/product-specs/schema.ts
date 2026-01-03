import { z } from "zod";

export const productSpecSchema = z.object({
  productId: z.coerce.number().int().positive(),
  vendorId: z.coerce.number().int().positive(),
  unitId: z.coerce.number().int().positive(),
  description: z.string().trim().min(1, "Description is required"),
  caseSize: z.coerce.number().int().positive(),
  unitSize: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.coerce.number().positive(),
  ),
  brand: z.string().trim().optional(),
  sku: z.string().trim().optional(),
});
