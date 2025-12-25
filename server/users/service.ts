import { prisma } from "@lib/prisma";
import { errors } from "@lib/errors";
import { hashPassword } from "@server/auth/password";

type CreateUserInput = {
  email: string;
  name?: string | null;
  password: string;
  roleKey: string;
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
