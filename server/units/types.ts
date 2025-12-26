export type CreateUnitGroupInput = {
  name: string;
};

export type CreateUnitInput = {
  unitGroupId: number;
  name: string;
  abbreviation: string;
  factor: string | number;
};
