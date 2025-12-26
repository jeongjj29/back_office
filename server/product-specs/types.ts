export type CreateProductSpecInput = {
  productId: number;
  vendorId: number;
  unitId: number;
  description: string;
  caseSize: number;
  unitSize: string | number;
  brand?: string | null;
  sku?: string | null;
};
