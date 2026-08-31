export type UserRole =
  | "founder"
  | "admin"
  | "business_owner"
  | "manager"
  | "employee"
  | "customer"
  | "government";

export interface ECOSUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}