import { prisma } from "@lib/prisma";

export async function listRoles() {
  return prisma.role.findMany({
    orderBy: { key: "asc" },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function updateRolePermissions(roleKey: string, permissionKeys: string[]) {
  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) {
    throw new Error("Role not found");
  }

  const permissions = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
  });

  if (permissions.length !== permissionKeys.length) {
    throw new Error("One or more permissions not found");
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
    prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
    }),
  ]);

  return prisma.role.findUnique({
    where: { id: role.id },
    include: { permissions: { include: { permission: true } } },
  });
}

export async function deleteRole(roleKey: string) {
  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) {
    return;
  }
  const userCount = await prisma.user.count({ where: { roleId: role.id } });
  if (userCount > 0) {
    throw new Error("Cannot delete role with assigned users");
  }
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.role.delete({ where: { id: role.id } });
}
