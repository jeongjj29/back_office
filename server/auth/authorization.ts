import type { CurrentUser } from "./session";

export function hasPermission(user: CurrentUser | null, permissionKey: string): boolean {
  if (!user) return false;
  return user.role.permissions.some((link) => link.permission.key === permissionKey);
}
