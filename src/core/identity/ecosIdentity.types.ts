export type EcosUserType =
  | "founder"
  | "admin"
  | "business_owner"
  | "manager"
  | "employee"
  | "customer"
  | "government";

export type EcosModule =
  | "platform"
  | "hotel"
  | "carwash"
  | "cleaning"
  | "property"
  | "marketplace"
  | "rentals"
  | "business_management"
  | "integrations";

export type BusinessRelationshipType =
  | "owner"
  | "manager"
  | "employee"
  | "authorized_operator";

export interface EcosIdentity {
  userId: string;
  email: string;

  /**
   * ECOS-level classification.
   *
   * This is deliberately separate from the application's
   * legacy UserRole type.
   */
  userType: EcosUserType;

  username?: string;

  /**
   * Business context is optional because customers,
   * founders and platform-level users may not operate
   * within a specific business context.
   */
  businessId?: string;

  businessRelationship?: BusinessRelationshipType;

  /**
   * Modules the identity is allowed to access.
   */
  modules: EcosModule[];

  /**
   * Explicit ECOS permissions assigned to the identity.
   */
  permissions: string[];

  /**
   * Whether this identity is currently allowed
   * to operate within ECOS.
   */
  active: boolean;
}
