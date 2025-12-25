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
