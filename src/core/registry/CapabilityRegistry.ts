import {
  cloneCapability,
  normalizeCapabilityId,
  type EcosCapability,
  type EcosCapabilityRelationship,
  type EcosCapabilityStatus,
} from "./Capability.types";

export class EcosCapabilityRegistry {
  private readonly capabilities = new Map<string, EcosCapability>();

  constructor(initialCapabilities: EcosCapability[] = []) {
    initialCapabilities.forEach((capability) => {
      this.register(capability);
    });
  }

  register(capability: EcosCapability): EcosCapability {
    const id = normalizeCapabilityId(capability.id);

    if (!id) {
      throw new Error("Capability id is required.");
    }

    if (this.capabilities.has(id)) {
      throw new Error(`Capability "${id}" is already registered.`);
    }

    const normalizedCapability: EcosCapability = {
      ...cloneCapability(capability),
      id,
    };

    this.capabilities.set(id, normalizedCapability);

    return cloneCapability(normalizedCapability);
  }

  upsert(capability: EcosCapability): EcosCapability {
    const id = normalizeCapabilityId(capability.id);

    if (!id) {
      throw new Error("Capability id is required.");
    }

    const normalizedCapability: EcosCapability = {
      ...cloneCapability(capability),
      id,
    };

    this.capabilities.set(id, normalizedCapability);

    return cloneCapability(normalizedCapability);
  }

  unregister(capabilityId: string): boolean {
    return this.capabilities.delete(
      normalizeCapabilityId(capabilityId)
    );
  }

  getById(capabilityId: string): EcosCapability | undefined {
    const capability = this.capabilities.get(
      normalizeCapabilityId(capabilityId)
    );

    return capability
      ? cloneCapability(capability)
      : undefined;
  }

  has(capabilityId: string): boolean {
    return this.capabilities.has(
      normalizeCapabilityId(capabilityId)
    );
  }

  getAll(): EcosCapability[] {
    return Array.from(this.capabilities.values()).map(cloneCapability);
  }

  getByStatus(
    status: EcosCapabilityStatus
  ): EcosCapability[] {
    return this.getAll().filter(
      (capability) => capability.status === status
    );
  }

  getByCategory(categorySlug: string): EcosCapability[] {
    const normalizedCategory = categorySlug.trim().toLowerCase();

    return this.getAll().filter((capability) =>
      capability.categorySlugs.some(
        (slug) => slug.trim().toLowerCase() === normalizedCategory
      )
    );
  }

  getByScope(
    scope: EcosCapability["scope"]
  ): EcosCapability[] {
    return this.getAll().filter(
      (capability) => capability.scope === scope
    );
  }

  addCategory(
    capabilityId: string,
    categorySlug: string
  ): EcosCapability | undefined {
    const id = normalizeCapabilityId(capabilityId);
    const capability = this.capabilities.get(id);

    if (!capability) {
      return undefined;
    }

    const normalizedCategory = categorySlug.trim().toLowerCase();

    if (
      normalizedCategory &&
      !capability.categorySlugs.includes(normalizedCategory)
    ) {
      capability.categorySlugs.push(normalizedCategory);
    }

    return cloneCapability(capability);
  }

  removeCategory(
    capabilityId: string,
    categorySlug: string
  ): EcosCapability | undefined {
    const id = normalizeCapabilityId(capabilityId);
    const capability = this.capabilities.get(id);

    if (!capability) {
      return undefined;
    }

    const normalizedCategory = categorySlug.trim().toLowerCase();

    capability.categorySlugs = capability.categorySlugs.filter(
      (slug) => slug !== normalizedCategory
    );

    return cloneCapability(capability);
  }

  addRelationship(
    capabilityId: string,
    relationship: EcosCapabilityRelationship
  ): EcosCapability | undefined {
    const id = normalizeCapabilityId(capabilityId);
    const capability = this.capabilities.get(id);

    if (!capability) {
      return undefined;
    }

    const relationshipCapabilityId =
      normalizeCapabilityId(relationship.capabilityId);

    if (!relationshipCapabilityId) {
      throw new Error("Related capability id is required.");
    }

    if (
      !capability.relationships.some(
        (item) =>
          item.capabilityId === relationshipCapabilityId &&
          item.relationship === relationship.relationship
      )
    ) {
      capability.relationships.push({
        ...relationship,
        capabilityId: relationshipCapabilityId,
      });
    }

    return cloneCapability(capability);
  }

  getRelatedCapabilities(
    capabilityId: string
  ): EcosCapability[] {
    const capability = this.capabilities.get(
      normalizeCapabilityId(capabilityId)
    );

    if (!capability) {
      return [];
    }

    return capability.relationships
      .map((relationship) =>
        this.capabilities.get(
          normalizeCapabilityId(relationship.capabilityId)
        )
      )
      .filter(
        (related): related is EcosCapability =>
          Boolean(related)
      )
      .map(cloneCapability);
  }

  search(query: string): EcosCapability[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return this.getAll().filter((capability) => {
      const searchableText = [
        capability.id,
        capability.name,
        capability.description,
        ...capability.categorySlugs,
        ...capability.discovery.searchTerms,
        ...capability.discovery.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }

  count(): number {
    return this.capabilities.size;
  }

  clear(): void {
    this.capabilities.clear();
  }
}

export const ecosCapabilityRegistry =
  new EcosCapabilityRegistry();

export default ecosCapabilityRegistry;
