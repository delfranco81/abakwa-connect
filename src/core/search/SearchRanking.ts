import type {
  EcosIntent,
  EcosSearchResult,
} from "./SearchTypes";

/*
 * =========================================================
 * ECOS SEARCH RANKING
 * =========================================================
 *
 * SearchRanking provides reusable ranking utilities for ECOS.
 *
 * The ranking layer does not fetch data.
 * It does not perform database queries.
 * It does not perform web searches.
 *
 * Its responsibility is simply:
 *
 *     matching results -> relevance score -> ordered results
 *
 * The existing ECOS search engine can continue to use its
 * current ranking implementation while this foundation is
 * introduced.
 */

/*
 * =========================================================
 * RANKING OPTIONS
 * =========================================================
 */

export type EcosRankingOptions = {
  intent?: EcosIntent;

  query?: string;

  verifiedBonus?: number;

  ratingWeight?: number;

  exactNameBonus?: number;

  categoryMatchBonus?: number;

  locationMatchBonus?: number;
};

/*
 * =========================================================
 * DEFAULT RANKING OPTIONS
 * =========================================================
 */

const DEFAULT_OPTIONS: Required<
  Omit<EcosRankingOptions, "intent" | "query">
> = {
  verifiedBonus: 10,

  ratingWeight: 4,

  exactNameBonus: 40,

  categoryMatchBonus: 20,

  locationMatchBonus: 15,
};

/*
 * =========================================================
 * RANK RESULTS
 * =========================================================
 */

export function rankEcosResults(
  results: EcosSearchResult[],
  options: EcosRankingOptions = {}
): EcosSearchResult[] {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const query =
    normalizeText(
      options.query || ""
    );

  const queryWords =
    query
      ? query.split(/\s+/)
      : [];

  return results
    .map(
      (result) => {
        const bonus =
          calculateRankingBonus(
            result,
            query,
            queryWords,
            config
          );

        return {
          ...result,

          score:
            result.score +
            bonus,
        };
      }
    )
    .sort(
      (a, b) => {
        if (
          b.score !==
          a.score
        ) {
          return (
            b.score -
            a.score
          );
        }

        return a.name.localeCompare(
          b.name
        );
      }
    );
}

/*
 * =========================================================
 * CALCULATE RANKING BONUS
 * =========================================================
 */

function calculateRankingBonus(
  result: EcosSearchResult,
  query: string,
  queryWords: string[],
  options: Required<
    Omit<EcosRankingOptions, "intent" | "query">
  >
): number {
  let bonus = 0;

  const name =
    normalizeText(
      result.name
    );

  const category =
    normalizeText(
      result.category || ""
    );

  const address =
    normalizeText(
      result.address || ""
    );

  const city =
    normalizeText(
      result.city || ""
    );

  /*
   * -------------------------------------------------------
   * EXACT NAME MATCH
   * -------------------------------------------------------
   */

  if (
    query &&
    name === query
  ) {
    bonus +=
      options.exactNameBonus;
  }

  /*
   * -------------------------------------------------------
   * NAME MATCH
   * -------------------------------------------------------
   */

  if (
    query &&
    name.includes(query)
  ) {
    bonus +=
      options.exactNameBonus / 2;
  }

  /*
   * -------------------------------------------------------
   * QUERY WORD MATCHES
   * -------------------------------------------------------
   */

  for (const word of queryWords) {
    if (
      word.length < 2
    ) {
      continue;
    }

    if (
      name.includes(word)
    ) {
      bonus += 8;
    }

    if (
      category.includes(word)
    ) {
      bonus +=
        options.categoryMatchBonus;
    }

    if (
      address.includes(word) ||
      city.includes(word)
    ) {
      bonus +=
        options.locationMatchBonus;
    }
  }

  /*
   * -------------------------------------------------------
   * VERIFIED RESULT
   * -------------------------------------------------------
   */

  if (
    result.verified === true
  ) {
    bonus +=
      options.verifiedBonus;
  }

  /*
   * -------------------------------------------------------
   * RATING
   * -------------------------------------------------------
   */

  if (
    typeof result.rating ===
      "number" &&
    Number.isFinite(
      result.rating
    )
  ) {
    bonus +=
      Math.max(
        0,
        Math.min(
          5,
          result.rating
        )
      ) *
      options.ratingWeight;
  }

  return bonus;
}

/*
 * =========================================================
 * INTENT BONUS
 * =========================================================
 */

export function intentBonus(
  result: EcosSearchResult,
  intent: EcosIntent
): number {
  const text =
    normalizeText(
      [
        result.name,
        result.category,
        result.description,
        result.address,
        result.city,
      ]
        .filter(Boolean)
        .join(" ")
    );

  if (!text) {
    return 0;
  }

  const terms =
    INTENT_TERMS[intent] || [];

  let bonus = 0;

  for (const term of terms) {
    if (
      text.includes(term)
    ) {
      bonus += 12;
    }
  }

  return bonus;
}

/*
 * =========================================================
 * INTENT TERMS
 * =========================================================
 */

const INTENT_TERMS: Record<
  EcosIntent,
  string[]
> = {
  discover: [],

  unknown: [],

  location: [
    "location",
    "near",
    "area",
    "city",
    "address",
  ],

  service: [
    "service",
    "services",
    "cleaning",
    "repair",
    "maintenance",
    "installation",
  ],

  talent: [
    "professional",
    "freelancer",
    "artisan",
    "carpenter",
    "builder",
    "plumber",
    "electrician",
    "mechanic",
    "tailor",
    "designer",
    "developer",
    "photographer",
    "technician",
  ],

  government: [
    "government",
    "ministry",
    "public",
    "council",
    "municipality",
    "passport",
    "tax",
    "permit",
    "license",
    "licence",
  ],

  education: [
    "school",
    "university",
    "college",
    "education",
    "academy",
    "training",
    "course",
    "student",
    "teacher",
  ],

  housing: [
    "house",
    "home",
    "property",
    "apartment",
    "flat",
    "rent",
    "rental",
    "land",
    "estate",
    "housing",
  ],

  jobs: [
    "job",
    "jobs",
    "employment",
    "career",
    "vacancy",
    "vacancies",
    "recruitment",
    "hiring",
    "internship",
    "work",
  ],

  community: [
    "community",
    "event",
    "group",
    "association",
    "organization",
    "organisation",
  ],

  tourism: [
    "tourism",
    "tourist",
    "attraction",
    "landmark",
    "museum",
    "heritage",
    "culture",
    "waterfall",
    "mountain",
    "park",
  ],

  food: [
    "food",
    "restaurant",
    "meal",
    "cuisine",
    "cafe",
    "coffee",
    "bakery",
    "pizza",
    "chicken",
  ],

  transport: [
    "taxi",
    "bike",
    "motorbike",
    "transport",
    "driver",
    "bus",
    "travel",
    "vehicle",
    "motorcycle",
    "rental",
  ],
};

/*
 * =========================================================
 * SORT BY RELEVANCE
 * =========================================================
 */

export function sortByRelevance(
  results: EcosSearchResult[]
): EcosSearchResult[] {
  return [...results].sort(
    (a, b) => {
      if (
        b.score !==
        a.score
      ) {
        return (
          b.score -
          a.score
        );
      }

      return a.name.localeCompare(
        b.name
      );
    }
  );
}

/*
 * =========================================================
 * TEXT NORMALIZATION
 * =========================================================
 */

function normalizeText(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /\s+/g,
      " "
    );
}
