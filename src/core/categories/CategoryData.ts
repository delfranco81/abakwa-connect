import { supabase } from "@/lib/supabase";
import {
  CATEGORY_MAPPINGS,
} from "./CategoryMappings";

export type EcosCategoryItem = {
  id: string;
  category_slug: string;
  subcategory?: string | null;
  name: string;
  description?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  region?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  verified?: boolean | null;
  rating?: number | null;
  status: string;
  popularity_score?: number | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type CategorySource =
  | "ecos"
  | "business"
  | "place";

export type CategoryResult = {
  id: string;
  source: CategorySource;
  category_slug: string;
  subcategory?: string | null;
  name: string;
  description?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  region?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  verified?: boolean | null;
  rating?: number | null;
  popularity_score: number;
  url: string;
};


/*
 * =========================================================
 * NORMALIZATION
 * =========================================================
 */

function normalize(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


/*
 * =========================================================
 * FIND DATABASE CATEGORIES BELONGING TO ECOSYSTEM
 * =========================================================
 */

function getExistingCategoryNames(
  ecosystemSlug: string
): string[] {
  const names = new Set<string>();

  for (const mapping of CATEGORY_MAPPINGS) {
    if (
      normalize(mapping.ecosystemSlug) ===
      normalize(ecosystemSlug)
    ) {
      names.add(
        normalize(mapping.existingCategory)
      );

      for (const alias of mapping.aliases || []) {
        names.add(normalize(alias));
      }
    }
  }

  return Array.from(names);
}


/*
 * =========================================================
 * CATEGORY ITEMS
 * =========================================================
 */

export async function getCategoryItems(
  categorySlug: string,
  limit = 24
): Promise<EcosCategoryItem[]> {
  const safeLimit = Math.max(
    1,
    Math.min(limit, 100)
  );

  const {
    data,
    error,
  } = await supabase
    .from("ecos_category_items")
    .select(`
      id,
      category_slug,
      subcategory,
      name,
      description,
      address,
      area,
      city,
      region,
      phone,
      email,
      website,
      image,
      latitude,
      longitude,
      verified,
      rating,
      status,
      popularity_score,
      metadata,
      created_at,
      updated_at
    `)
    .eq(
      "category_slug",
      categorySlug
    )
    .eq(
      "status",
      "approved"
    )
    .order(
      "popularity_score",
      {
        ascending: false,
      }
    )
    .order(
      "name",
      {
        ascending: true,
      }
    )
    .limit(safeLimit);

  if (error) {
    console.error(
      "ECOS category data error:",
      error
    );

    throw error;
  }

  return (
    data || []
  ) as EcosCategoryItem[];
}


/*
 * =========================================================
 * SUBCATEGORY
 * =========================================================
 */

export async function getCategoryItemsBySubcategory(
  categorySlug: string,
  subcategory: string,
  limit = 24
): Promise<EcosCategoryItem[]> {
  const safeLimit = Math.max(
    1,
    Math.min(limit, 100)
  );

  const {
    data,
    error,
  } = await supabase
    .from("ecos_category_items")
    .select(`
      id,
      category_slug,
      subcategory,
      name,
      description,
      address,
      area,
      city,
      region,
      phone,
      email,
      website,
      image,
      latitude,
      longitude,
      verified,
      rating,
      status,
      popularity_score,
      metadata,
      created_at,
      updated_at
    `)
    .eq(
      "category_slug",
      categorySlug
    )
    .eq(
      "subcategory",
      subcategory
    )
    .eq(
      "status",
      "approved"
    )
    .order(
      "popularity_score",
      {
        ascending: false,
      }
    )
    .order(
      "name",
      {
        ascending: true,
      }
    )
    .limit(safeLimit);

  if (error) {
    console.error(
      "ECOS category subcategory error:",
      error
    );

    throw error;
  }

  return (
    data || []
  ) as EcosCategoryItem[];
}


/*
 * =========================================================
 * ONE CATEGORY ITEM
 * =========================================================
 */

export async function getCategoryItem(
  id: string
): Promise<EcosCategoryItem | null> {
  const {
    data,
    error,
  } = await supabase
    .from("ecos_category_items")
    .select(`
      id,
      category_slug,
      subcategory,
      name,
      description,
      address,
      area,
      city,
      region,
      phone,
      email,
      website,
      image,
      latitude,
      longitude,
      verified,
      rating,
      status,
      popularity_score,
      metadata,
      created_at,
      updated_at
    `)
    .eq(
      "id",
      id
    )
    .eq(
      "status",
      "approved"
    )
    .maybeSingle();

  if (error) {
    console.error(
      "ECOS category item error:",
      error
    );

    throw error;
  }

  return data as EcosCategoryItem | null;
}


/*
 * =========================================================
 * CATEGORY COUNT
 * =========================================================
 */

export async function getCategoryCount(
  categorySlug: string
): Promise<number> {
  const {
    count,
    error,
  } = await supabase
    .from("ecos_category_items")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "category_slug",
      categorySlug
    )
    .eq(
      "status",
      "approved"
    );

  if (error) {
    console.error(
      "ECOS category count error:",
      error
    );

    return 0;
  }

  return count || 0;
}


/*
 * =========================================================
 * GET BUSINESSES FOR ECOSYSTEM CATEGORY
 * =========================================================
 */

async function getCategoryBusinesses(
  ecosystemSlug: string,
  limit: number
): Promise<CategoryResult[]> {
  const categoryNames =
    getExistingCategoryNames(
      ecosystemSlug
    );

  const {
    data,
    error,
  } = await supabase
    .from("business")
    .select(`
      id,
      name,
      category,
      subcategory,
      description,
      about,
      phone,
      website,
      area,
      address,
      latitude,
      longitude,
      verified,
      rating,
      logo,
      cover_image
    `)
    .limit(
      Math.max(
        limit * 4,
        50
      )
    );

  if (error) {
    console.error(
      "ECOS category business error:",
      error
    );

    return [];
  }

  const rows =
    (data || []) as Array<
      Record<string, unknown>
    >;

  const results =
    rows
      .filter((row) => {
        const category =
          normalize(
            row.category
          );

        const subcategory =
          normalize(
            row.subcategory
          );

        return categoryNames.some(
          (name) =>
            category === name ||
            subcategory === name ||
            category.includes(name) ||
            name.includes(category)
        );
      })
      .map((row) => ({
        id: String(row.id),

        source: "business" as const,

        category_slug:
          ecosystemSlug,

        subcategory:
          row.subcategory
            ? String(row.subcategory)
            : null,

        name:
          String(
            row.name ||
              "Unnamed business"
          ),

        description:
          row.description
            ? String(
                row.description
              )
            : row.about
            ? String(row.about)
            : null,

        address:
          row.address
            ? String(row.address)
            : null,

        area:
          row.area
            ? String(row.area)
            : null,

        phone:
          row.phone
            ? String(row.phone)
            : null,

        website:
          row.website
            ? String(row.website)
            : null,

        latitude:
          row.latitude != null
            ? Number(
                row.latitude
              )
            : null,

        longitude:
          row.longitude != null
            ? Number(
                row.longitude
              )
            : null,

        verified:
          row.verified === true,

        rating:
          Number(
            row.rating || 0
          ),

        image:
          row.logo
            ? String(row.logo)
            : row.cover_image
            ? String(
                row.cover_image
              )
            : null,

        popularity_score:
          Number(
            row.rating || 0
          ) * 10,

        url:
          `/business/${row.id}`,
      }));

  return results
    .sort(
      (a, b) =>
        b.popularity_score -
        a.popularity_score
    )
    .slice(
      0,
      limit
    );
}


/*
 * =========================================================
 * GET PLACES FOR ECOSYSTEM CATEGORY
 * =========================================================
 */

async function getCategoryPlaces(
  ecosystemSlug: string,
  limit: number
): Promise<CategoryResult[]> {
  const categoryNames =
    getExistingCategoryNames(
      ecosystemSlug
    );

  const {
    data,
    error,
  } = await supabase
    .from("places")
    .select(`
      id,
      name,
      category,
      description,
      history,
      address,
      city,
      subdivision,
      division,
      region,
      latitude,
      longitude,
      verified,
      rating,
      image,
      cover_image
    `)
    .limit(
      Math.max(
        limit * 4,
        50
      )
    );

  if (error) {
    console.error(
      "ECOS category places error:",
      error
    );

    return [];
  }

  const rows =
    (data || []) as Array<
      Record<string, unknown>
    >;

  return rows
    .filter((row) => {
      const category =
        normalize(
          row.category
        );

      return categoryNames.some(
        (name) =>
          category === name ||
          category.includes(name) ||
          name.includes(category)
      );
    })
    .map((row) => ({
      id: String(row.id),

      source: "place" as const,

      category_slug:
        ecosystemSlug,

      subcategory:
        row.category
          ? String(row.category)
          : null,

      name:
        String(
          row.name ||
            "Unnamed place"
        ),

      description:
        row.description
          ? String(
              row.description
            )
          : row.history
          ? String(
              row.history
            )
          : null,

      address:
        row.address
          ? String(
              row.address
            )
          : null,

      city:
        row.city
          ? String(
              row.city
            )
          : null,

      region:
        row.region
          ? String(
              row.region
            )
          : null,

      latitude:
        row.latitude != null
          ? Number(
              row.latitude
            )
          : null,

      longitude:
        row.longitude != null
          ? Number(
              row.longitude
            )
          : null,

      verified:
        row.verified === true,

      rating:
        Number(
          row.rating || 0
        ),

      image:
        row.image
          ? String(
              row.image
            )
          : row.cover_image
          ? String(
              row.cover_image
            )
          : null,

      popularity_score:
        Number(
          row.rating || 0
        ) * 10,

      url:
        `/place/${row.id}`,
    }))
    .sort(
      (a, b) =>
        b.popularity_score -
        a.popularity_score
    )
    .slice(
      0,
      limit
    );
}


/*
 * =========================================================
 * ECOS CATEGORY ITEMS → CATEGORY RESULTS
 * =========================================================
 */

function categoryItemToResult(
  item: EcosCategoryItem
): CategoryResult {
  return {
    id: item.id,

    source: "ecos",

    category_slug:
      item.category_slug,

    subcategory:
      item.subcategory,

    name:
      item.name,

    description:
      item.description,

    address:
      item.address,

    area:
      item.area,

    city:
      item.city,

    region:
      item.region,

    phone:
      item.phone,

    email:
      item.email,

    website:
      item.website,

    image:
      item.image,

    latitude:
      item.latitude,

    longitude:
      item.longitude,

    verified:
      item.verified,

    rating:
      item.rating,

    popularity_score:
      Number(
        item.popularity_score || 0
      ),

    url:
      `/category/${item.category_slug}/${item.id}`,
  };
}


/*
 * =========================================================
 * UNIFIED CATEGORY RESULTS
 * =========================================================
 *
 * This is the main function CategoryPage should use.
 *
 * It combines:
 *
 * 1. Dedicated ECOS category records
 * 2. Existing businesses
 * 3. Existing places
 *
 * Then removes obvious duplicates and ranks them.
 */

export async function getCategoryResults(
  categorySlug: string,
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

  const [
    ecosItems,
    businesses,
    places,
  ] =
    await Promise.all([
      getCategoryItems(
        categorySlug,
        safeLimit
      ),

      getCategoryBusinesses(
        categorySlug,
        safeLimit
      ),

      getCategoryPlaces(
        categorySlug,
        safeLimit
      ),
    ]);

  const combined: CategoryResult[] = [
    ...ecosItems.map(
      categoryItemToResult
    ),
    ...businesses,
    ...places,
  ];

  /*
   * =======================================================
   * DEDUPLICATION
   * =======================================================
   */

  const seen =
    new Set<string>();

  const deduplicated =
    combined.filter(
      (result) => {
        const name =
          normalize(
            result.name
          );

        const address =
          normalize(
            result.address
          );

        const key =
          `${name}|${address}`;

        if (
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);

        return true;
      }
    );

  /*
   * =======================================================
   * RANKING
   * =======================================================
   */

  return deduplicated
    .sort((a, b) => {
      if (
        b.popularity_score !==
        a.popularity_score
      ) {
        return (
          b.popularity_score -
          a.popularity_score
        );
      }

      if (
        Boolean(b.verified) !==
        Boolean(a.verified)
      ) {
        return b.verified
          ? 1
          : -1;
      }

      return a.name.localeCompare(
        b.name
      );
    })
    .slice(
      0,
      safeLimit
    );
}
