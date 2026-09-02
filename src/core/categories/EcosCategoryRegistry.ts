import {
  CATEGORY_DEFINITIONS,
} from "./CategoryDefinitions";

import type {
  EcosCategory,
  EcosCategoryRelationship,
  EcosCategoryStatus,
} from "./EcosCategory.types";

import {
  categoryDefinitionToEcosCategory,
} from "./EcosCategory.types";


/**
 * ECOS Category Registry
 *
 * This registry is the ecosystem-level abstraction
 * over the existing Everyday Connect category definitions.
 *
 * IMPORTANT:
 *
 * The existing CategoryDefinitions.ts remains the source
 * for the current discovery/category presentation model.
 *
 * This registry does not replace that system.
 *
 * It provides the foundation required by ADR-006 for:
 *
 * - category identity
 * - category status
 * - capabilities
 * - ecosystem relationships
 * - discovery configuration
 *
 * Future registries will connect:
 *
 * Category
 *     ↓
 * Capability
 *     ↓
 * Subscription
 *     ↓
 * Entitlement
 *
 * without coupling those concerns together.
 */
class EcosCategoryRegistry {
  private readonly categories: EcosCategory[];

  constructor() {
    this.categories =
      CATEGORY_DEFINITIONS.map(
        categoryDefinitionToEcosCategory
      );
  }


  /**
   * Return every registered ECOS category.
   */
  getAll(): EcosCategory[] {
    return this.categories.map(
      (category) => ({
        ...category,
        capabilities: [
          ...category.capabilities,
        ],
        relationships: [
          ...category.relationships,
        ],
        discovery: {
          searchTerm:
            category.discovery.searchTerm,

          popularSearches: [
            ...category.discovery.popularSearches,
          ],

          subcategories: [
            ...category.discovery.subcategories,
          ],
        },
      })
    );
  }


  /**
   * Return only categories with the requested status.
   */
  getByStatus(
    status: EcosCategoryStatus
  ): EcosCategory[] {
    return this.getAll().filter(
      (category) =>
        category.status === status
    );
  }


  /**
   * Find a category by its stable slug.
   */
  getBySlug(
    slug: string
  ): EcosCategory | null {
    const normalized =
      this.normalize(slug);

    const category =
      this.categories.find(
        (item) =>
          this.normalize(item.slug) ===
          normalized
      );

    return category
      ? this.cloneCategory(category)
      : null;
  }


  /**
   * Determine whether a category exists.
   */
  has(
    slug: string
  ): boolean {
    return this.getBySlug(slug) !== null;
  }


  /**
   * Return the category discovery configuration.
   */
  getDiscovery(
    slug: string
  ): EcosCategory["discovery"] | null {
    const category =
      this.getBySlug(slug);

    if (!category) {
      return null;
    }

    return {
      searchTerm:
        category.discovery.searchTerm,

      popularSearches: [
        ...category.discovery.popularSearches,
      ],

      subcategories: [
        ...category.discovery.subcategories,
      ],
    };
  }


  /**
   * Return categories connected to a category.
   *
   * Relationships are intentionally empty during
   * the first registry implementation.
   *
   * They will be populated by the ecosystem
   * relationship architecture.
   */
  getRelatedCategories(
    slug: string
  ): EcosCategory[] {
    const category =
      this.getBySlug(slug);

    if (!category) {
      return [];
    }

    const relatedSlugs =
      category.relationships.map(
        (relationship) =>
          relationship.categorySlug
      );

    return relatedSlugs
      .map((relatedSlug) =>
        this.getBySlug(relatedSlug)
      )
      .filter(
        (
          related
        ): related is EcosCategory =>
          related !== null
      );
  }


  /**
   * Add an ecosystem relationship.
   *
   * This method is deliberately internal-facing
   * for the initial implementation.
   *
   * Future persistence can move relationships
   * into a dedicated data layer without changing
   * consumers of the registry.
   */
  registerRelationship(
    categorySlug: string,
    relationship: EcosCategoryRelationship
  ): boolean {
    const category =
      this.categories.find(
        (item) =>
          this.normalize(item.slug) ===
          this.normalize(categorySlug)
      );

    if (!category) {
      return false;
    }

    const alreadyExists =
      category.relationships.some(
        (existing) =>
          this.normalize(
            existing.categorySlug
          ) ===
            this.normalize(
              relationship.categorySlug
            ) &&
          existing.relationship ===
            relationship.relationship
      );

    if (!alreadyExists) {
      category.relationships.push(
        {
          ...relationship,
        }
      );
    }

    return true;
  }


  /**
   * Return the number of registered categories.
   */
  count(): number {
    return this.categories.length;
  }


  /**
   * Normalize registry lookups.
   */
  private normalize(
    value: string
  ): string {
    return String(value || "")
      .trim()
      .toLowerCase();
  }


  /**
   * Protect registry state from accidental
   * mutation by consumers.
   */
  private cloneCategory(
    category: EcosCategory
  ): EcosCategory {
    return {
      ...category,

      capabilities: [
        ...category.capabilities,
      ],

      relationships: [
        ...category.relationships,
      ],

      discovery: {
        searchTerm:
          category.discovery.searchTerm,

        popularSearches: [
          ...category.discovery.popularSearches,
        ],

        subcategories: [
          ...category.discovery.subcategories,
        ],
      },
    };
  }
}


/**
 * Singleton registry used by the ECOS application.
 */
export const ecosCategoryRegistry =
  new EcosCategoryRegistry();

export default ecosCategoryRegistry;
