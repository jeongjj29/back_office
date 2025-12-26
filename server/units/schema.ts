import { z } from "zod";

export const unitGroupSchema = z.object({
  name: z.string().trim().min(1, "Unit group name is required"),
});

export const unitSchema = z.object({
  unitGroupId: z.number().int().positive(),
  name: z.string().trim().min(1, "Unit name is required"),
  abbreviation: z.string().trim().min(1, "Abbreviation is required"),
  factor: z.union([z.string(), z.number()]),
});
