import type { UserRole } from "./types";

export class RoleService {
  static isFounder(role: UserRole) {
    return role === "founder";
  }

  static isAdmin(role: UserRole) {
    return role === "admin";
  }

  static isBusinessOwner(role: UserRole) {
    return role === "business_owner";
  }

  static isEmployee(role: UserRole) {
    return role === "employee";
  }
}