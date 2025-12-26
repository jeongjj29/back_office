import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  nameKr: z.string().trim().optional(),
  categoryId: z.number().int().positive(),
  unitGroupId: z.number().int().positive(),
});
