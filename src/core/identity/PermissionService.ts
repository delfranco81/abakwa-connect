import type { UserRole } from "./types";

const permissions: Record<UserRole, string[]> = {
  founder: ["*"],

  admin: [
    "users.read",
    "users.write",
    "business.read",
    "business.write",
  ],

  business_owner: [
    "business.read",
    "business.write",
    "employees.read",
    "employees.write",
  ],

  manager: [
    "employees.read",
    "employees.write",
  ],

  employee: [
    "employees.read",
  ],

  customer: [],

  government: [
    "government.read",
    "government.write",
  ],
};

export class PermissionService {
  static hasPermission(role: UserRole, permission: string) {
    const rolePermissions = permissions[role];

    return (
      rolePermissions.includes("*") ||
      rolePermissions.includes(permission)
    );
  }
}