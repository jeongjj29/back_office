import { errors } from "@lib/errors";
import { getCurrentUser, type CurrentUser } from "./session";
import { hasPermission } from "./authorization";

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw errors.unauthorized("Not authenticated");
  }
  return user;
}

export async function requirePermission(permissionKey: string): Promise<CurrentUser> {
  const user = await requireAuth();
  if (!hasPermission(user, permissionKey)) {
    throw errors.forbidden("Insufficient permissions");
  }
  return user;
}
