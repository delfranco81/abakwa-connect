import type { EcosIntent } from "./SearchTypes";

/*
 * =========================================================
 * ECOS INTENT RESOLVER
 * =========================================================
 *
 * ECOS first determines what the user is looking for.
 *
 * The resolver supports:
 *
 *   discover
 *   service
 *   talent
 *   location
 *   government
 *   education
 *   housing
 *   jobs
 *   community
 *   tourism
 *   food
 *   transport
 *
 * Exact phrases receive stronger scores than individual
 * keywords. Contextual rules are then applied so that
 * related categories do not incorrectly override each
 * other.
 * =========================================================
 */

type IntentRule = {
  intent: EcosIntent;
  phrases: string[];
  keywords: string[];
};

const rules: IntentRule[] = [
  /*
   * =======================================================
   * GOVERNMENT
   * =======================================================
   */
  {
    intent: "government",

    phrases: [
      "government office",
      "government offices",
      "government service",
      "government services",
      "public service",
      "public services",
      "birth certificate",
      "birth registration",
      "national id",
      "national identity card",
      "identity card",
      "id card",
      "driving license",
      "driving licence",
      "residence permit",
      "work permit",
      "tax office",
      "tax registration",
      "passport office",
      "immigration office",
      "government ministry",
      "government ministry office",
      "municipal council",
      "council office",
      "public office",
      "public institution",
    ],

    keywords: [
      "government",
      "immigration",
      "passport",
      "visa",
      "tax",
      "ministry",
      "minister",
      "administration",
      "administrative",
      "certificate",
      "permit",
      "license",
      "licence",
      "public",
      "municipality",
      "municipal",
      "council",
      "prefecture",
      "subdivision",
      "governor",
      "governmental",
      "official",
    ],
  },

  /*
   * =======================================================
   * EDUCATION
   * =======================================================
   */
  {
    intent: "education",

    phrases: [
      "primary school",
      "secondary school",
      "high school",
      "nursery school",
      "kindergarten school",
      "boarding school",
      "university admission",
      "university admissions",
      "school admission",
      "school admissions",
      "school fees",
      "university fees",
      "college fees",
      "school registration",
      "university registration",
      "computer training",
      "vocational training",
      "training center",
      "training centre",
      "training school",
      "technical school",
      "teacher training",
      "teacher training college",
      "distance learning",
      "online learning",
      "online course",
      "online courses",
      "educational institution",
      "education institution",
      "study in bamenda",
      "schools in bamenda",
      "universities in bamenda",
      "colleges in bamenda",
    ],

    keywords: [
      "school",
      "schools",
      "university",
      "universities",
      "college",
      "colleges",
      "education",
      "educational",
      "student",
      "students",
      "teacher",
      "teachers",
      "course",
      "courses",
      "institution",
      "institutions",
      "admission",
      "admissions",
      "transcript",
      "degree",
      "degrees",
      "scholarship",
      "scholarships",
      "training",
      "academy",
      "academies",
      "campus",
      "class",
      "classes",
      "lesson",
      "lessons",
      "learning",
      "study",
      "studies",
      "schooling",
      "tuition",
      "exam",
      "exams",
      "examination",
      "certificate",
      "diploma",
      "faculty",
      "department",
      "professor",
      "lecturer",
    ],
  },

  /*
   * =======================================================
   * JOBS
   * =======================================================
   */
  {
    intent: "jobs",

    phrases: [
      "job opportunities",
      "job opportunity",
      "jobs available",
      "jobs in bamenda",
      "job in bamenda",
      "work in bamenda",
      "employment opportunities",
      "employment opportunity",
      "job vacancy",
      "job vacancies",
      "job opening",
      "job openings",
      "looking for work",
      "looking for a job",
      "find a job",
      "find jobs",
      "find work",
      "government job",
      "government jobs",
      "part time job",
      "part time jobs",
      "full time job",
      "full time jobs",
      "remote job",
      "remote jobs",
      "work from home",
      "internship opportunity",
      "internship opportunities",
      "graduate jobs",
      "jobs for graduates",
      "career opportunities",
      "career opportunity",
    ],

    keywords: [
      "job",
      "jobs",
      "employment",
      "employer",
      "employers",
      "career",
      "careers",
      "vacancy",
      "vacancies",
      "recruitment",
      "recruiter",
      "recruiters",
      "hiring",
      "hire",
      "work",
      "works",
      "internship",
      "internships",
      "intern",
      "graduate",
      "graduates",
      "profession",
      "professional",
      "salary",
      "salaries",
      "wage",
      "wages",
      "occupation",
      "occupations",
      "application",
      "applications",
      "cv",
      "resume",
    ],
  },

  /*
   * =======================================================
   * HOUSING
   * =======================================================
   */
  {
    intent: "housing",

    phrases: [
      "house for rent",
      "houses for rent",
      "house for sale",
      "houses for sale",
      "home for rent",
      "homes for rent",
      "home for sale",
      "homes for sale",
      "apartment for rent",
      "apartments for rent",
      "apartment for sale",
      "apartments for sale",
      "room for rent",
      "rooms for rent",
      "room to rent",
      "rooms to rent",
      "land for sale",
      "land for rent",
      "plot for sale",
      "plots for sale",
      "real estate",
      "real estate agent",
      "real estate agents",
      "property for sale",
      "property for rent",
      "properties for sale",
      "properties for rent",
      "commercial property",
      "commercial properties",
      "office space for rent",
      "shop for rent",
      "shops for rent",
      "house hunting",
      "property rental",
      "property rentals",
    ],

    keywords: [
      "house",
      "houses",
      "home",
      "homes",
      "property",
      "properties",
      "apartment",
      "apartments",
      "flat",
      "flats",
      "room",
      "rooms",
      "rent",
      "rental",
      "rentals",
      "land",
      "plot",
      "plots",
      "estate",
      "housing",
      "property",
      "tenant",
      "tenants",
      "landlord",
      "landlords",
      "bedroom",
      "bedrooms",
      "studio",
      "compound",
      "duplex",
      "villa",
    ],
  },

  /*
   * =======================================================
   * TALENT / PROFESSIONAL
   * =======================================================
   *
   * Used when the user is looking for a person who can
   * perform a specific task.
   * =======================================================
   */
  {
    intent: "talent",

    phrases: [
      "who can help",
      "who can repair",
      "someone who can repair",
      "someone to repair",
      "find a technician",
      "find a mechanic",
      "find a plumber",
      "find an electrician",
      "find a carpenter",
      "find a builder",
      "find a tailor",
      "find a photographer",
      "find a designer",
      "find a developer",
      "find a cleaner",
      "find a driver",
      "looking for a plumber",
      "looking for a mechanic",
      "looking for an electrician",
      "looking for a carpenter",
      "looking for a builder",
      "looking for a photographer",
      "looking for a designer",
      "looking for a technician",
    ],

    keywords: [
      "carpenter",
      "builder",
      "plumber",
      "electrician",
      "mechanic",
      "tailor",
      "designer",
      "developer",
      "photographer",
      "cleaner",
      "driver",
      "technician",
      "professional",
      "worker",
      "freelancer",
      "artisan",
      "repairman",
      "repairer",
    ],
  },

  /*
   * =======================================================
   * TOURISM
   * =======================================================
   */
  {
    intent: "tourism",

    phrases: [
      "places to visit",
      "things to do",
      "tourist attractions",
      "tourist attraction",
      "places to see",
      "where to visit",
      "tourist places",
      "tourist sites",
      "places of interest",
      "places of tourist interest",
      "tourist destinations",
      "tourist destination",
      "places to explore",
      "things to see",
    ],

    keywords: [
      "tourist",
      "tourism",
      "visit",
      "visiting",
      "attraction",
      "attractions",
      "landmark",
      "landmarks",
      "palace",
      "museum",
      "culture",
      "cultural",
      "traditional",
      "dance",
      "festival",
      "heritage",
      "waterfall",
      "mountain",
      "park",
      "sightseeing",
      "destination",
      "destinations",
      "travel",
      "explore",
      "exploring",
    ],
  },

  /*
   * =======================================================
   * FOOD
   * =======================================================
   */
  {
    intent: "food",

    phrases: [
      "places to eat",
      "where to eat",
      "food near me",
      "restaurant near me",
      "restaurants near me",
      "best restaurant",
      "best restaurants",
      "african food",
      "local food",
      "food delivery",
      "takeaway food",
      "take away food",
      "places to have lunch",
      "places to have dinner",
      "food in bamenda",
    ],

    keywords: [
      "food",
      "foods",
      "restaurant",
      "restaurants",
      "meal",
      "meals",
      "eat",
      "eating",
      "chop",
      "cuisine",
      "bar",
      "bars",
      "cafe",
      "cafes",
      "coffee",
      "bakery",
      "bakeries",
      "pizza",
      "chicken",
      "snack",
      "snacks",
      "catering",
      "caterer",
    ],
  },

  /*
   * =======================================================
   * TRANSPORT
   * =======================================================
   */
  {
    intent: "transport",

    phrases: [
      "transport service",
      "transport services",
      "taxi service",
      "taxi near me",
      "motorbike taxi",
      "bike taxi",
      "car rental",
      "car rentals",
      "bike rental",
      "bike rentals",
      "motorbike rental",
      "motorbike rentals",
      "bus station",
      "bus stations",
      "travel agency",
      "travel agencies",
      "airport transport",
      "transportation service",
      "transportation services",
    ],

    keywords: [
      "taxi",
      "taxis",
      "bike",
      "bikes",
      "motorbike",
      "motorbikes",
      "transport",
      "transportation",
      "driver",
      "car",
      "cars",
      "travel",
      "bus",
      "buses",
      "rental",
      "rentals",
      "vehicle",
      "vehicles",
      "motorcycle",
      "motorcycles",
      "station",
    ],
  },

  /*
   * =======================================================
   * COMMUNITY
   * =======================================================
   */
  {
    intent: "community",

    phrases: [
      "community event",
      "community events",
      "local events",
      "community group",
      "church group",
      "community meeting",
      "local meeting",
      "community organization",
      "community organisation",
      "community organizations",
      "community organisations",
      "local organization",
      "local organisation",
      "non profit organization",
      "nonprofit organization",
      "non governmental organization",
      "non governmental organisation",
    ],

    keywords: [
      "community",
      "communities",
      "event",
      "events",
      "group",
      "groups",
      "church",
      "churches",
      "association",
      "associations",
      "meeting",
      "meetings",
      "people",
      "organization",
      "organisation",
      "organizations",
      "organisations",
      "ngo",
      "ngos",
      "nonprofit",
      "volunteer",
      "volunteering",
    ],
  },

  /*
   * =======================================================
   * SERVICES
   * =======================================================
   *
   * General commercial/service requests.
   * =======================================================
   */
  {
    intent: "service",

    phrases: [
      "cleaning service",
      "cleaning services",
      "car wash",
      "car washing",
      "computer repair",
      "computer repairs",
      "laptop repair",
      "laptop repairs",
      "phone repair",
      "phone repairs",
      "appliance repair",
      "appliance repairs",
      "repair service",
      "repair services",
      "home service",
      "home services",
      "professional service",
      "professional services",
      "delivery service",
      "delivery services",
      "maintenance service",
      "maintenance services",
    ],

    keywords: [
      "service",
      "services",
      "cleaning",
      "wash",
      "washing",
      "repair",
      "repairs",
      "booking",
      "hotel",
      "hotels",
      "installation",
      "maintenance",
      "delivery",
      "deliveries",
    ],
  },
];

/*
 * =========================================================
 * NORMALIZATION
 * =========================================================
 */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * =========================================================
 * LOCATION WORDS
 * =========================================================
 *
 * Locations are not intents. They provide contextual
 * information to the search engine.
 * =========================================================
 */

const locationWords = [
  "bamenda",
  "bambili",
  "bafut",
  "balikumbat",
  "ndop",
  "kumbo",
  "wum",
  "fundong",
  "mankon",
  "mendankwe",
  "ntamulung",
  "cameroon",
];

/*
 * =========================================================
 * CONTEXTUAL HELPERS
 * =========================================================
 */

function containsAny(
  query: string,
  values: string[]
): boolean {
  return values.some((value) =>
    query.includes(normalize(value))
  );
}

function isLookingForAPlace(
  query: string
): boolean {
  return containsAny(query, [
    "in bamenda",
    "in cameroon",
    "near me",
    "nearby",
    "around me",
    "close to me",
    "in my area",
  ]);
}

function isLookingForAPerson(
  query: string
): boolean {
  return containsAny(query, [
    "who can",
    "someone who",
    "someone to",
    "find a",
    "find an",
    "looking for a",
    "looking for an",
  ]);
}

/*
 * =========================================================
 * RESOLVE INTENT
 * =========================================================
 */

export function resolveIntent(
  query: string
): EcosIntent {
  const normalized = normalize(query);

  if (!normalized) {
    return "unknown";
  }

  let bestIntent: EcosIntent = "unknown";
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;

    /*
     * -------------------------------------------------------
     * PHRASE MATCHES
     * -------------------------------------------------------
     *
     * Exact phrases are intentionally strong.
     */
    for (const phrase of rule.phrases) {
      const normalizedPhrase =
        normalize(phrase);

      if (
        normalized.includes(
          normalizedPhrase
        )
      ) {
        score += 8;
      }
    }

    /*
     * -------------------------------------------------------
     * KEYWORD MATCHES
     * -------------------------------------------------------
     */
    for (const keyword of rule.keywords) {
      const normalizedKeyword =
        normalize(keyword);

      if (
        normalized.includes(
          normalizedKeyword
        )
      ) {
        score += 1;
      }
    }

    /*
     * -------------------------------------------------------
     * EDUCATION CONTEXT
     * -------------------------------------------------------
     *
     * "universities in Bamenda" should strongly favor
     * education.
     */
    if (
      rule.intent === "education" &&
      containsAny(normalized, [
        "school",
        "schools",
        "university",
        "universities",
        "college",
        "colleges",
        "academy",
        "academies",
        "course",
        "courses",
        "training",
        "student",
        "students",
        "teacher",
        "teachers",
      ])
    ) {
      score += 3;
    }

    /*
     * -------------------------------------------------------
     * GOVERNMENT CONTEXT
     * -------------------------------------------------------
     */
    if (
      rule.intent === "government" &&
      containsAny(normalized, [
        "government",
        "ministry",
        "passport",
        "immigration",
        "tax",
        "certificate",
        "permit",
        "council",
        "municipality",
        "public office",
      ])
    ) {
      score += 3;
    }

    /*
     * -------------------------------------------------------
     * JOB CONTEXT
     * -------------------------------------------------------
     */
    if (
      rule.intent === "jobs" &&
      containsAny(normalized, [
        "job",
        "jobs",
        "employment",
        "career",
        "vacancy",
        "vacancies",
        "hiring",
        "recruitment",
        "internship",
        "work",
      ])
    ) {
      score += 3;
    }

    /*
     * -------------------------------------------------------
     * HOUSING CONTEXT
     * -------------------------------------------------------
     */
    if (
      rule.intent === "housing" &&
      containsAny(normalized, [
        "house",
        "houses",
        "home",
        "homes",
        "apartment",
        "apartments",
        "room",
        "rooms",
        "property",
        "properties",
        "rent",
        "rental",
        "land",
        "plot",
      ])
    ) {
      score += 3;
    }

    /*
     * -------------------------------------------------------
     * TALENT CONTEXT
     * -------------------------------------------------------
     */
    if (
      rule.intent === "talent" &&
      isLookingForAPerson(normalized)
    ) {
      score += 5;
    }

    /*
     * -------------------------------------------------------
     * SERVICE CONTEXT
     * -------------------------------------------------------
     */
    if (
      rule.intent === "service" &&
      containsAny(normalized, [
        "service",
        "services",
        "repair",
        "repairs",
        "booking",
        "maintenance",
        "installation",
      ])
    ) {
      score += 2;
    }

    /*
     * -------------------------------------------------------
     * LOCAL SEARCH CONTEXT
     * -------------------------------------------------------
     */
    if (
      isLookingForAPlace(normalized)
    ) {
      if (
        rule.intent === "education" ||
        rule.intent === "government" ||
        rule.intent === "jobs" ||
        rule.intent === "housing" ||
        rule.intent === "service" ||
        rule.intent === "talent" ||
        rule.intent === "food" ||
        rule.intent === "transport" ||
        rule.intent === "tourism"
      ) {
        score += 1;
      }
    }

    /*
     * -------------------------------------------------------
     * SAVE BEST INTENT
     * -------------------------------------------------------
     */
    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
    }
  }

  /*
   * No meaningful category was detected.
   */
  if (bestScore === 0) {
    return "discover";
  }

  return bestIntent;
}

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

export function normalizeSearchQuery(
  query: string
): string {
  return normalize(query);
}

export function extractLocation(
  query: string
): string | null {
  const normalized = normalize(query);

  for (const location of locationWords) {
    if (
      normalized.includes(location)
    ) {
      return location;
    }
  }

  return null;
}

export function hasLocalIntent(
  query: string
): boolean {
  const normalized = normalize(query);

  return (
    normalized.includes("near me") ||
    normalized.includes("nearby") ||
    normalized.includes("around me") ||
    normalized.includes("close to me") ||
    locationWords.some(
      (location) =>
        normalized.includes(location)
    )
  );
}

