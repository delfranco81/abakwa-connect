import type {
  EcosResultType,
} from "./SearchTypes";

/*
 * =========================================================
 * ECOS SEARCH FILTERS
 * =========================================================
 *
 * SearchFilters defines the constraints that ECOS can use
 * when narrowing a search result set.
 *
 * This file contains the filter contract only.
 * It does not perform database queries.
 */

export type EcosSearchFilters = {
  /*
   * Restrict results to a specific ECOS result type.
   *
   * Examples:
   * - business
   * - place
   * - category
   */
  type?: EcosResultType;

  /*
   * Restrict results to a category.
   *
   * Examples:
   * restaurant
   * school
   * car wash
   * hotel
   */
  category?: string;

  /*
   * Geographic filters.
   */
  city?: string;

  subdivision?: string;

  division?: string;

  region?: string;

  country?: string;

  /*
   * Verification filter.
   *
   * When true, only verified records should remain.
   */
  verified?: boolean;

  /*
   * Minimum acceptable rating.
   *
   * Example:
   * 4 means results rated 4.0 or higher.
   */
  minRating?: number;

  /*
   * User/device location.
   *
   * These coordinates are used when ECOS needs
   * to calculate proximity.
   */
  latitude?: number;

  longitude?: number;

  /*
   * Maximum distance from the user's location.
   *
   * Distance is expressed in kilometres.
   */
  radiusKm?: number;

  /*
   * Optional result limit.
   *
   * This is a filtering/output constraint and does not
   * replace ECOS pagination.
   */
  limit?: number;
};

/*
 * =========================================================
 * EMPTY FILTERS
 * =========================================================
 *
 * Returns a fresh filter object so callers can safely
 * modify it without sharing mutable state.
 */

export function emptySearchFilters(): EcosSearchFilters {
  return {};
}

/*
 * =========================================================
 * NORMALIZE FILTERS
 * =========================================================
 *
 * Removes empty string values and invalid numeric values.
 *
 * This keeps the filter layer predictable before filters
 * are applied to ECOS results.
 */

export function normalizeSearchFilters(
  filters: EcosSearchFilters = {}
): EcosSearchFilters {
  const normalized: EcosSearchFilters = {};

  if (filters.type) {
    normalized.type = filters.type;
  }

  if (filters.category?.trim()) {
    normalized.category =
      filters.category.trim().toLowerCase();
  }

  if (filters.city?.trim()) {
    normalized.city =
      filters.city.trim().toLowerCase();
  }

  if (filters.subdivision?.trim()) {
    normalized.subdivision =
      filters.subdivision.trim().toLowerCase();
  }

  if (filters.division?.trim()) {
    normalized.division =
      filters.division.trim().toLowerCase();
  }

  if (filters.region?.trim()) {
    normalized.region =
      filters.region.trim().toLowerCase();
  }

  if (filters.country?.trim()) {
    normalized.country =
      filters.country.trim().toLowerCase();
  }

  if (typeof filters.verified === "boolean") {
    normalized.verified = filters.verified;
  }

  if (
    typeof filters.minRating === "number" &&
    Number.isFinite(filters.minRating)
  ) {
    normalized.minRating =
      Math.max(
        0,
        Math.min(
          5,
          filters.minRating
        )
      );
  }

  if (
    typeof filters.latitude === "number" &&
    Number.isFinite(filters.latitude)
  ) {
    normalized.latitude =
      Math.max(
        -90,
        Math.min(
          90,
          filters.latitude
        )
      );
  }

  if (
    typeof filters.longitude === "number" &&
    Number.isFinite(filters.longitude)
  ) {
    normalized.longitude =
      Math.max(
        -180,
        Math.min(
          180,
          filters.longitude
        )
      );
  }

  if (
    typeof filters.radiusKm === "number" &&
    Number.isFinite(filters.radiusKm) &&
    filters.radiusKm > 0
  ) {
    normalized.radiusKm =
      filters.radiusKm;
  }

  if (
    typeof filters.limit === "number" &&
    Number.isFinite(filters.limit) &&
    filters.limit > 0
  ) {
    normalized.limit =
      Math.floor(filters.limit);
  }

  return normalized;
}
