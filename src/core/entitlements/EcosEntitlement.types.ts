export type EcosEntitlementStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "revoked";

export type EcosEntitlementSource =
  | "subscription"
  | "promotion"
  | "platform_grant"
  | "business_grant"
  | "system";

export type EcosEntitlementSubjectType =
  | "user"
  | "business";

export interface EcosEntitlement {
  id: string;

  capabilityId: string;

  subjectType: EcosEntitlementSubjectType;
  subjectId: string;

  businessId?: string;

  subscriptionId?: string;

  categorySlug?: string;

  source: EcosEntitlementSource;

  status: EcosEntitlementStatus;

  startsAt: string;
  expiresAt?: string;

  metadata?: Record<string, unknown>;
}

export function normalizeEntitlementId(
  value: string
): string {
  return value.trim().toLowerCase();
}

export function normalizeEntitlementCapabilityId(
  value: string
): string {
  return value.trim().toLowerCase();
}

export function cloneEntitlement(
  entitlement: EcosEntitlement
): EcosEntitlement {
  return {
    ...entitlement,
    metadata: entitlement.metadata
      ? { ...entitlement.metadata }
      : undefined,
  };
}

export function isEntitlementActive(
  entitlement: EcosEntitlement,
  now: Date = new Date()
): boolean {
  if (entitlement.status !== "active") {
    return false;
  }

  const currentTime = now.getTime();
  const startsAt = new Date(
    entitlement.startsAt
  ).getTime();

  if (Number.isNaN(startsAt)) {
    return false;
  }

  if (currentTime < startsAt) {
    return false;
  }

  if (entitlement.expiresAt) {
    const expiresAt = new Date(
      entitlement.expiresAt
    ).getTime();

    if (Number.isNaN(expiresAt)) {
      return false;
    }

    if (currentTime >= expiresAt) {
      return false;
    }
  }

  return true;
}
