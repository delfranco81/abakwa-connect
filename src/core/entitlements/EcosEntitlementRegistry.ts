import {
  cloneEntitlement,
  isEntitlementActive,
  normalizeEntitlementCapabilityId,
  normalizeEntitlementId,
  type EcosEntitlement,
  type EcosEntitlementSource,
  type EcosEntitlementStatus,
  type EcosEntitlementSubjectType,
} from "./EcosEntitlement.types";

export class EcosEntitlementRegistry {
  private readonly entitlements =
    new Map<string, EcosEntitlement>();

  constructor(
    initialEntitlements: EcosEntitlement[] = []
  ) {
    initialEntitlements.forEach((entitlement) => {
      this.register(entitlement);
    });
  }

  register(
    entitlement: EcosEntitlement
  ): EcosEntitlement {
    const id = normalizeEntitlementId(
      entitlement.id
    );

    if (!id) {
      throw new Error(
        "Entitlement id is required."
      );
    }

    if (this.entitlements.has(id)) {
      throw new Error(
        `Entitlement "${id}" is already registered.`
      );
    }

    const normalizedEntitlement: EcosEntitlement = {
      ...cloneEntitlement(entitlement),
      id,
      capabilityId:
        normalizeEntitlementCapabilityId(
          entitlement.capabilityId
        ),
      subjectId:
        entitlement.subjectId.trim(),
      businessId:
        entitlement.businessId?.trim() || undefined,
      subscriptionId:
        entitlement.subscriptionId?.trim() ||
        undefined,
      categorySlug:
        entitlement.categorySlug
          ?.trim()
          .toLowerCase() || undefined,
    };

    if (!normalizedEntitlement.capabilityId) {
      throw new Error(
        "Entitlement capability id is required."
      );
    }

    if (!normalizedEntitlement.subjectId) {
      throw new Error(
        "Entitlement subject id is required."
      );
    }

    this.entitlements.set(
      id,
      normalizedEntitlement
    );

    return cloneEntitlement(
      normalizedEntitlement
    );
  }

  upsert(
    entitlement: EcosEntitlement
  ): EcosEntitlement {
    const id = normalizeEntitlementId(
      entitlement.id
    );

    if (!id) {
      throw new Error(
        "Entitlement id is required."
      );
    }

    const normalizedEntitlement: EcosEntitlement = {
      ...cloneEntitlement(entitlement),
      id,
      capabilityId:
        normalizeEntitlementCapabilityId(
          entitlement.capabilityId
        ),
      subjectId:
        entitlement.subjectId.trim(),
      businessId:
        entitlement.businessId?.trim() || undefined,
      subscriptionId:
        entitlement.subscriptionId?.trim() ||
        undefined,
      categorySlug:
        entitlement.categorySlug
          ?.trim()
          .toLowerCase() || undefined,
    };

    if (!normalizedEntitlement.capabilityId) {
      throw new Error(
        "Entitlement capability id is required."
      );
    }

    if (!normalizedEntitlement.subjectId) {
      throw new Error(
        "Entitlement subject id is required."
      );
    }

    this.entitlements.set(
      id,
      normalizedEntitlement
    );

    return cloneEntitlement(
      normalizedEntitlement
    );
  }

  unregister(
    entitlementId: string
  ): boolean {
    return this.entitlements.delete(
      normalizeEntitlementId(entitlementId)
    );
  }

  getById(
    entitlementId: string
  ): EcosEntitlement | undefined {
    const entitlement =
      this.entitlements.get(
        normalizeEntitlementId(
          entitlementId
        )
      );

    return entitlement
      ? cloneEntitlement(entitlement)
      : undefined;
  }

  getAll(): EcosEntitlement[] {
    return Array.from(
      this.entitlements.values()
    ).map(cloneEntitlement);
  }

  getByStatus(
    status: EcosEntitlementStatus
  ): EcosEntitlement[] {
    return this.getAll().filter(
      (entitlement) =>
        entitlement.status === status
    );
  }

  getBySource(
    source: EcosEntitlementSource
  ): EcosEntitlement[] {
    return this.getAll().filter(
      (entitlement) =>
        entitlement.source === source
    );
  }

  getBySubject(
    subjectType: EcosEntitlementSubjectType,
    subjectId: string
  ): EcosEntitlement[] {
    const normalizedSubjectId =
      subjectId.trim();

    return this.getAll().filter(
      (entitlement) =>
        entitlement.subjectType ===
          subjectType &&
        entitlement.subjectId ===
          normalizedSubjectId
    );
  }

  getByUser(
    userId: string
  ): EcosEntitlement[] {
    return this.getBySubject(
      "user",
      userId
    );
  }

  getByBusiness(
    businessId: string
  ): EcosEntitlement[] {
    const normalizedBusinessId =
      businessId.trim();

    return this.getAll().filter(
      (entitlement) =>
        entitlement.businessId ===
        normalizedBusinessId
    );
  }

  getByCapability(
    capabilityId: string
  ): EcosEntitlement[] {
    const normalizedCapabilityId =
      normalizeEntitlementCapabilityId(
        capabilityId
      );

    return this.getAll().filter(
      (entitlement) =>
        entitlement.capabilityId ===
        normalizedCapabilityId
    );
  }

  getBySubscription(
    subscriptionId: string
  ): EcosEntitlement[] {
    const normalizedSubscriptionId =
      subscriptionId.trim();

    return this.getAll().filter(
      (entitlement) =>
        entitlement.subscriptionId ===
        normalizedSubscriptionId
    );
  }

  getActiveForSubject(
    subjectType: EcosEntitlementSubjectType,
    subjectId: string,
    now: Date = new Date()
  ): EcosEntitlement[] {
    return this.getBySubject(
      subjectType,
      subjectId
    ).filter((entitlement) =>
      isEntitlementActive(
        entitlement,
        now
      )
    );
  }

  hasActiveCapability(
    subjectType: EcosEntitlementSubjectType,
    subjectId: string,
    capabilityId: string,
    now: Date = new Date()
  ): boolean {
    const normalizedCapabilityId =
      normalizeEntitlementCapabilityId(
        capabilityId
      );

    return this.getActiveForSubject(
      subjectType,
      subjectId,
      now
    ).some(
      (entitlement) =>
        entitlement.capabilityId ===
        normalizedCapabilityId
    );
  }

  count(): number {
    return this.entitlements.size;
  }

  clear(): void {
    this.entitlements.clear();
  }
}

export const ecosEntitlementRegistry =
  new EcosEntitlementRegistry();

export default ecosEntitlementRegistry;
