import type {
  EcosIdentity,
  EcosModule,
} from "./ecosIdentity.types";

export function hasModuleAccess(
  identity: EcosIdentity,
  module: EcosModule
): boolean {
  if (!identity.active) {
    return false;
  }

  if (identity.userType === "founder") {
    return true;
  }

  return identity.modules.includes(module);
}

export function hasPermission(
  identity: EcosIdentity,
  permission: string
): boolean {
  if (!identity.active) {
    return false;
  }

  if (identity.userType === "founder") {
    return true;
  }

  return (
    identity.permissions.includes("*") ||
    identity.permissions.includes(permission)
  );
}

export function belongsToBusiness(
  identity: EcosIdentity,
  businessId: string
): boolean {
  if (identity.userType === "founder") {
    return true;
  }

  return identity.businessId === businessId;
}
