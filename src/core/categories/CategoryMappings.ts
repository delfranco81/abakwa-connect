export type CategoryMapping = {
  existingCategory: string;
  ecosystemSlug: string;
  aliases?: string[];
};

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    existingCategory: "Government",
    ecosystemSlug: "government",
    aliases: [
      "government",
      "ministry",
      "public service",
      "public services",
      "municipality",
      "council",
    ],
  },

  {
    existingCategory: "Education",
    ecosystemSlug: "education",
    aliases: [
      "education",
      "school",
      "schools",
      "college",
      "colleges",
      "academy",
      "training",
    ],
  },

  {
    existingCategory: "University",
    ecosystemSlug: "education",
    aliases: [
      "university",
      "universities",
    ],
  },

  {
    existingCategory: "Tourism",
    ecosystemSlug: "tourism",
    aliases: [
      "tourism",
      "tourist",
      "travel",
      "hotel",
      "hotels",
    ],
  },

  {
    existingCategory: "Attraction",
    ecosystemSlug: "tourism",
    aliases: [
      "attraction",
      "attractions",
    ],
  },

  {
    existingCategory: "Landmark",
    ecosystemSlug: "tourism",
    aliases: [
      "landmark",
      "landmarks",
    ],
  },

  {
    existingCategory: "Culture",
    ecosystemSlug: "community",
    aliases: [
      "culture",
      "cultural",
    ],
  },

  {
    existingCategory: "Cultural",
    ecosystemSlug: "community",
    aliases: [
      "cultural",
      "culture",
    ],
  },

  {
    existingCategory: "Religion",
    ecosystemSlug: "community",
    aliases: [
      "religion",
      "religious",
      "church",
      "churches",
      "mosque",
      "mosques",
    ],
  },

  {
    existingCategory: "Religious",
    ecosystemSlug: "community",
    aliases: [
      "religious",
      "religion",
    ],
  },

  {
    existingCategory: "Healthcare",
    ecosystemSlug: "services",
    aliases: [
      "healthcare",
      "health",
      "medical",
      "clinic",
      "clinics",
    ],
  },

  {
    existingCategory: "Hospital",
    ecosystemSlug: "services",
    aliases: [
      "hospital",
      "hospitals",
    ],
  },

  {
    existingCategory: "Restaurant",
    ecosystemSlug: "food",
    aliases: [
      "restaurant",
      "restaurants",
      "food",
      "catering",
      "cafe",
      "cafes",
      "bakery",
      "bakeries",
    ],
  },

  {
    existingCategory: "Shopping",
    ecosystemSlug: "discover",
    aliases: [
      "shopping",
      "shop",
      "shops",
      "market",
      "markets",
    ],
  },

  {
    existingCategory: "Market",
    ecosystemSlug: "discover",
    aliases: [
      "market",
      "markets",
      "shopping",
    ],
  },

  {
    existingCategory: "Sports",
    ecosystemSlug: "discover",
    aliases: [
      "sport",
      "sports",
    ],
  },

  {
    existingCategory: "Technology",
    ecosystemSlug: "discover",
    aliases: [
      "technology",
      "tech",
      "computer",
      "computers",
    ],
  },
];

export function normalizeCategoryValue(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getEcosystemSlug(
  existingCategory: string
): string | undefined {
  const normalized =
    normalizeCategoryValue(existingCategory);

  for (const mapping of CATEGORY_MAPPINGS) {
    if (
      normalizeCategoryValue(
        mapping.existingCategory
      ) === normalized
    ) {
      return mapping.ecosystemSlug;
    }

    if (
      mapping.aliases?.some(
        (alias) =>
          normalizeCategoryValue(alias) ===
          normalized
      )
    ) {
      return mapping.ecosystemSlug;
    }
  }

  return undefined;
}

export function getCategoriesForEcosystem(
  ecosystemSlug: string
): string[] {
  const normalized =
    normalizeCategoryValue(ecosystemSlug);

  return CATEGORY_MAPPINGS
    .filter(
      (mapping) =>
        normalizeCategoryValue(
          mapping.ecosystemSlug
        ) === normalized
    )
    .map(
      (mapping) =>
        mapping.existingCategory
    );
}
