import type { CategoryDefinition } from "./CategoryDefinitions";

export type EcosCategoryStatus =
  | "active"
  | "planned"
  | "deprecated";

export type EcosCategoryCapability =
  | string;

export interface EcosCategoryRelationship {
  categorySlug: string;
  relationship:
    | "complements"
    | "supports"
    | "connects"
    | "depends_on"
    | "related";
}

export interface EcosCategoryDiscovery {
  searchTerm: string;
  popularSearches: string[];
  subcategories: string[];
}

export interface EcosCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;

  status: EcosCategoryStatus;

  capabilities: EcosCategoryCapability[];

  relationships: EcosCategoryRelationship[];

  discovery: EcosCategoryDiscovery;
}

export function categoryDefinitionToEcosCategory(
  definition: CategoryDefinition
): EcosCategory {
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    color: definition.color,

    status: "active",

    /*
     * Capabilities will be populated by the
     * ECOS Capability Registry.
     *
     * We deliberately keep this empty at this stage
     * so category identity is not coupled to
     * subscription or capability logic.
     */
    capabilities: [],

    /*
     * Relationships will be populated as the
     * ecosystem relationship architecture is introduced.
     */
    relationships: [],

    discovery: {
      searchTerm: definition.searchTerm,
      popularSearches: [
        ...definition.popularSearches,
      ],
      subcategories: [
        ...definition.subcategories,
      ],
    },
  };
}
