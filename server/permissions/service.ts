import { prisma } from "@lib/prisma";

export async function listPermissions() {
  return prisma.permission.findMany({
    orderBy: { key: "asc" },
  });
}

export async function deletePermission(key: string) {
  await prisma.rolePermission.deleteMany({
    where: { permission: { key } },
  });
  await prisma.permission.delete({
    where: { key },
  });
}
