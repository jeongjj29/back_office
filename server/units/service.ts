import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { Prisma } from "@generated/prisma/client";
import { unitGroupSchema, unitSchema } from "./schema";
import type { CreateUnitGroupInput, CreateUnitInput } from "./types";

function parseUnitGroup(raw: CreateUnitGroupInput) {
  const result = unitGroupSchema.safeParse(raw);
  if (!result.success) {
    throw errors.validation("Invalid unit group data", result.error.flatten().fieldErrors);
  }
  return result.data;
}

function parseUnit(raw: CreateUnitInput) {
  const result = unitSchema.safeParse(raw);
  if (!result.success) {
    throw errors.validation("Invalid unit data", result.error.flatten().fieldErrors);
  }
  return result.data;
}

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
  const { name } = parseUnitGroup(input);

  const existing = await prisma.unitGroup.findUnique({ where: { name } });
  if (existing) {
    throw errors.conflict("Unit group name already exists");
  }

  return prisma.unitGroup.create({
    data: { name },
  });
}

export async function updateUnitGroup(id: number, name: string) {
  const { name: cleaned } = parseUnitGroup({ name });

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
  const parsed = parseUnit(input);

  const group = await prisma.unitGroup.findUnique({ where: { id: parsed.unitGroupId } });
  if (!group) {
    throw errors.validation("Unit group not found");
  }

  const factor = new Prisma.Decimal(parsed.factor);

  const existing = await prisma.unit.findFirst({
    where: { unitGroupId: parsed.unitGroupId, OR: [{ name: parsed.name }, { abbreviation: parsed.abbreviation }] },
  });
  if (existing) {
    throw errors.conflict("Unit name or abbreviation already exists in this group");
  }

  return prisma.unit.create({
    data: {
      name: parsed.name,
      abbreviation: parsed.abbreviation,
      factor,
      unitGroupId: parsed.unitGroupId,
    },
  });
}

export async function updateUnit(id: number, input: CreateUnitInput) {
  const parsed = parseUnit(input);

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) {
    throw errors.notFound("Unit not found");
  }

  const group = await prisma.unitGroup.findUnique({ where: { id: parsed.unitGroupId } });
  if (!group) {
    throw errors.validation("Unit group not found");
  }

  const factor = new Prisma.Decimal(parsed.factor);

  const conflict = await prisma.unit.findFirst({
    where: {
      unitGroupId: parsed.unitGroupId,
      OR: [{ name: parsed.name }, { abbreviation: parsed.abbreviation }],
      NOT: { id },
    },
  });
  if (conflict) {
    throw errors.conflict("Unit name or abbreviation already exists in this group");
  }

  return prisma.unit.update({
    where: { id },
    data: {
      name: parsed.name,
      abbreviation: parsed.abbreviation,
      factor,
      unitGroupId: parsed.unitGroupId,
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
