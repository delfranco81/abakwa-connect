export type EcosCapabilityStatus =
  | "active"
  | "planned"
  | "deprecated";

export type EcosCapabilityScope =
  | "platform"
  | "category"
  | "business"
  | "user"
  | "transaction";

export type EcosCapabilityDependencyType =
  | "requires"
  | "supports"
  | "enhances"
  | "optional";

export interface EcosCapabilityRelationship {
  capabilityId: string;
  relationship: EcosCapabilityDependencyType;
}

export interface EcosCapabilityDiscovery {
  searchTerms: string[];
  keywords: string[];
  description: string;
}

export interface EcosCapability {
  id: string;
  name: string;
  description: string;
  status: EcosCapabilityStatus;
  scope: EcosCapabilityScope;
  categorySlugs: string[];
  relationships: EcosCapabilityRelationship[];
  discovery: EcosCapabilityDiscovery;
  metadata?: Record<string, unknown>;
}

export function normalizeCapabilityId(value: string): string {
  return value.trim().toLowerCase();
}

export function cloneCapability(
  capability: EcosCapability
): EcosCapability {
  return {
    ...capability,
    categorySlugs: [...capability.categorySlugs],
    relationships: capability.relationships.map((relationship) => ({
      ...relationship,
    })),
    discovery: {
      searchTerms: [...capability.discovery.searchTerms],
      keywords: [...capability.discovery.keywords],
      description: capability.discovery.description,
    },
    metadata: capability.metadata
      ? { ...capability.metadata }
      : undefined,
  };
}
