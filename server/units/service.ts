import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { Prisma } from "@generated/prisma/client";

type CreateUnitGroupInput = {
  name: string;
};

type CreateUnitInput = {
  unitGroupId: number;
  name: string;
  abbreviation: string;
  factor: string | number;
};

export async function listUnitGroupsWithUnits() {
  return prisma.unitGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      units: {
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function createUnitGroup(input: CreateUnitGroupInput) {
  const name = input.name?.trim();
  if (!name) {
    throw errors.validation("Unit group name is required");
  }

  const existing = await prisma.unitGroup.findUnique({ where: { name } });
  if (existing) {
    throw errors.conflict("Unit group name already exists");
  }

  return prisma.unitGroup.create({
    data: { name },
  });
}

export async function updateUnitGroup(id: number, name: string) {
  const cleaned = name?.trim();
  if (!cleaned) {
    throw errors.validation("Unit group name is required");
  }

  const existing = await prisma.unitGroup.findUnique({ where: { id } });
  if (!existing) {
    throw errors.notFound("Unit group not found");
  }

  const nameConflict = await prisma.unitGroup.findFirst({
    where: { name: cleaned, NOT: { id } },
  });
  if (nameConflict) {
    throw errors.conflict("Unit group name already exists");
  }

  return prisma.unitGroup.update({
    where: { id },
    data: { name: cleaned },
  });
}

export async function deleteUnitGroup(id: number) {
  const units = await prisma.unit.count({ where: { unitGroupId: id } });
  if (units > 0) {
    throw errors.conflict("Cannot delete unit group with existing units");
  }
  await prisma.unitGroup.delete({ where: { id } });
}

export async function createUnit(input: CreateUnitInput) {
  const name = input.name?.trim();
  const abbreviation = input.abbreviation?.trim();
  if (!name || !abbreviation) {
    throw errors.validation("Unit name and abbreviation are required");
  }

  const group = await prisma.unitGroup.findUnique({ where: { id: input.unitGroupId } });
  if (!group) {
    throw errors.validation("Unit group not found");
  }

  const factor = new Prisma.Decimal(input.factor);

  const existing = await prisma.unit.findFirst({
    where: { unitGroupId: input.unitGroupId, OR: [{ name }, { abbreviation }] },
  });
  if (existing) {
    throw errors.conflict("Unit name or abbreviation already exists in this group");
  }

  return prisma.unit.create({
    data: {
      name,
      abbreviation,
      factor,
      unitGroupId: input.unitGroupId,
    },
  });
}

export async function updateUnit(id: number, input: CreateUnitInput) {
  const name = input.name?.trim();
  const abbreviation = input.abbreviation?.trim();
  if (!name || !abbreviation) {
    throw errors.validation("Unit name and abbreviation are required");
  }

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) {
    throw errors.notFound("Unit not found");
  }

  const group = await prisma.unitGroup.findUnique({ where: { id: input.unitGroupId } });
  if (!group) {
    throw errors.validation("Unit group not found");
  }

  const factor = new Prisma.Decimal(input.factor);

  const conflict = await prisma.unit.findFirst({
    where: {
      unitGroupId: input.unitGroupId,
      OR: [{ name }, { abbreviation }],
      NOT: { id },
    },
  });
  if (conflict) {
    throw errors.conflict("Unit name or abbreviation already exists in this group");
  }

  return prisma.unit.update({
    where: { id },
    data: {
      name,
      abbreviation,
      factor,
      unitGroupId: input.unitGroupId,
    },
  });
}

export async function deleteUnit(id: number) {
  const specs = await prisma.productSpec.count({ where: { unitId: id } });
  if (specs > 0) {
    throw errors.conflict("Cannot delete unit used in product specs");
  }
  await prisma.unit.delete({ where: { id } });
}
