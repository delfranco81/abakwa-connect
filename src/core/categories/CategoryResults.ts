import { supabase } from "@/lib/supabase";

import {
  getCategoryItems,
} from "./CategoryData";

import {
  getCategoriesForEcosystem,
} from "./CategoryMappings";

import type {
  EcosCategoryItem,
} from "./CategoryData";


export type CategoryResult = {
  id: string;

  source:
    | "category"
    | "business"
    | "place";

  name: string;

  category?: string | null;

  description?: string | null;

  address?: string | null;

  area?: string | null;

  city?: string | null;

  phone?: string | null;

  website?: string | null;

  image?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  verified?: boolean | null;

  rating?: number | null;

  url: string;

  score: number;
};


/*
 * =========================================================
 * CATEGORY ITEM
 * =========================================================
 */

function mapCategoryItem(
  item: EcosCategoryItem
): CategoryResult {
  return {
    id: item.id,
    source: "category",

    name: item.name,

    category:
      item.subcategory ||
      item.category_slug,

    description: item.description,

    address: item.address,
    area: item.area,
    city: item.city,

    phone: item.phone,
    website: item.website,

    image: item.image,

    latitude: item.latitude,
    longitude: item.longitude,

    verified: item.verified,

    rating:
      Number(item.rating) || 0,

    url:
      `/category/${item.category_slug}/${item.id}`,

    score:
      Number(
        item.popularity_score
      ) || 0,
  };
}


/*
 * =========================================================
 * BUSINESS
 * =========================================================
 */

function mapBusiness(
  business: Record<string, unknown>
): CategoryResult {
  const id =
    String(business.id);

  const rating =
    Number(
      business.rating || 0
    );

  const verified =
    business.verified === true;

  const featured =
    business.featured === true;

  return {
    id,

    source: "business",

    name:
      business.name
        ? String(business.name)
        : "Unnamed business",

    category:
      business.category
        ? String(business.category)
        : null,

    description:
      business.description
        ? String(
            business.description
          )
        : null,

    address:
      business.address
        ? String(
            business.address
          )
        : null,

    area:
      business.area
        ? String(
            business.area
          )
        : null,

    city:
      business.city
        ? String(
            business.city
          )
        : null,

    phone:
      business.phone
        ? String(
            business.phone
          )
        : null,

    website:
      business.website
        ? String(
            business.website
          )
        : null,

    image:
      business.cover_image
        ? String(
            business.cover_image
          )
        : business.logo
        ? String(
            business.logo
          )
        : null,

    latitude:
      business.latitude != null
        ? Number(
            business.latitude
          )
        : null,

    longitude:
      business.longitude != null
        ? Number(
            business.longitude
          )
        : null,

    verified,

    rating,

    url:
      `/business/${id}`,

    score:
      rating +
      (featured ? 10 : 0) +
      (verified ? 5 : 0),
  };
}


/*
 * =========================================================
 * PLACE
 * =========================================================
 */

function mapPlace(
  place: Record<string, unknown>
): CategoryResult {
  const id =
    String(place.id);

  const rating =
    Number(
      place.rating || 0
    );

  const verified =
    place.verified === true;

  const featured =
    place.featured === true;

  return {
    id,

    source: "place",

    name:
      place.name
        ? String(place.name)
        : "Unnamed place",

    category:
      place.category
        ? String(place.category)
        : null,

    description:
      place.description
        ? String(
            place.description
          )
        : null,

    address:
      place.address
        ? String(
            place.address
          )
        : null,

    city:
      place.city
        ? String(
            place.city
          )
        : null,

    phone:
      place.phone
        ? String(
            place.phone
          )
        : null,

    website:
      place.website
        ? String(
            place.website
          )
        : null,

    image:
      place.image
        ? String(
            place.image
          )
        : null,

    latitude:
      place.latitude != null
        ? Number(
            place.latitude
          )
        : null,

    longitude:
      place.longitude != null
        ? Number(
            place.longitude
          )
        : null,

    verified,

    rating,

    url: `/search?search=${encodeURIComponent(String(place.name || ""))}`,

    score:
      rating +
      (featured ? 10 : 0) +
      (verified ? 5 : 0),
  };
}


/*
 * =========================================================
 * DEDUPLICATION
 * =========================================================
 */

function deduplicateResults(
  results: CategoryResult[]
): CategoryResult[] {
  const seen =
    new Set<string>();

  return results.filter(
    (result) => {
      const key =
        `${result.source}:${result.id}`;

      if (
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}


/*
 * =========================================================
 * GET UNIFIED CATEGORY RESULTS
 * =========================================================
 */

export async function getCategoryResults(
  ecosystemSlug: string,
  limit = 24
): Promise<CategoryResult[]> {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        limit,
        100
      )
    );


  /*
   * -------------------------------------------------------
   * 1. Dedicated ECOS category records
   * -------------------------------------------------------
   */

  const categoryItems =
    await getCategoryItems(
      ecosystemSlug,
      safeLimit
    );

  const results =
    categoryItems.map(
      mapCategoryItem
    );


  /*
   * -------------------------------------------------------
   * 2. Existing business categories
   * -------------------------------------------------------
   */

  const existingCategories =
    getCategoriesForEcosystem(
      ecosystemSlug
    );


  if (
    existingCategories.length > 0
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from("business")
        .select(`
          id,
          name,
          category,
          description,
          address,
          area,
          city,
          phone,
          website,
          cover_image,
          logo,
          latitude,
          longitude,
          verified,
          featured,
          rating
        `)
        .in(
          "category",
          existingCategories
        )
        .order(
          "featured",
          {
            ascending: false,
          }
        )
        .order(
          "rating",
          {
            ascending: false,
          }
        )
        .limit(
          safeLimit
        );


    if (error) {

      console.error(
        "Category business loading error:",
        error
      );

    } else if (data) {

      results.push(
        ...data.map(
          mapBusiness
        )
      );
    }
  }


  /*
   * -------------------------------------------------------
   * 3. Existing places
   * -------------------------------------------------------
   */

  if (
    existingCategories.length > 0
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from("places")
        .select(`
          id,
          name,
          category,
          type,
          city,
          description,
          image,
          phone,
          email,
          website,
          address,
          featured,
          verified,
          rating,
          latitude,
          longitude
        `)
        .in(
          "category",
          existingCategories
        )
        .order(
          "featured",
          {
            ascending: false,
          }
        )
        .order(
          "rating",
          {
            ascending: false,
          }
        )
        .limit(
          safeLimit
        );


    if (error) {

      console.error(
        "Category places loading error:",
        error
      );

    } else if (data) {

      results.push(
        ...data.map(
          mapPlace
        )
      );
    }
  }


  /*
   * -------------------------------------------------------
   * 4. Remove duplicates
   * -------------------------------------------------------
   */

  const unique =
    deduplicateResults(
      results
    );


  /*
   * -------------------------------------------------------
   * 5. Rank
   * -------------------------------------------------------
   */

  unique.sort(
    (a, b) =>
      b.score -
      a.score
  );


  return unique.slice(
    0,
    safeLimit
  );
}

