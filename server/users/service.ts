import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { hashPassword } from "@server/auth/password";

type CreateUserInput = {
  email: string;
  name?: string | null;
  password: string;
  roleKey: string;
};

type UpdateUserInput = {
  name?: string | null;
  password?: string | null;
  roleKey?: string;
};

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      role: {
        select: {
          key: true,
          name: true,
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    roleKey: user.role.key,
    roleName: user.role.name,
    createdAt: user.createdAt,
  }));
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw errors.validation("Email is required");
  }
  if (!input.password) {
    throw errors.validation("Password is required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw errors.conflict("Email already in use");
  }

  const role = await prisma.role.findUnique({ where: { key: input.roleKey } });
  if (!role) {
    throw errors.validation("Role not found");
  }

  const passwordHash = hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      passwordHash,
      roleId: role.id,
    },
    include: {
      role: {
        select: { key: true, name: true },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleKey: user.role.key,
    roleName: user.role.name,
    createdAt: user.createdAt,
  };
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!user) {
    throw errors.notFound("User not found");
  }

  const data: Record<string, unknown> = {};

  if (typeof input.name === "string") {
    data.name = input.name.trim() || null;
  }

  if (input.password) {
    data.passwordHash = hashPassword(input.password);
  }

  if (input.roleKey) {
    const role = await prisma.role.findUnique({ where: { key: input.roleKey } });
    if (!role) {
      throw errors.validation("Role not found");
    }
    data.roleId = role.id;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { role: { select: { key: true, name: true } } },
  });

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    roleKey: updated.role.key,
    roleName: updated.role.name,
    createdAt: updated.createdAt,
  };
}

export async function deleteUser(id: number) {
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
}
