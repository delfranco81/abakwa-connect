import type {
  EcosKnowledgeEntry,
} from "../BrainTypes";

export const platformKnowledge: EcosKnowledgeEntry[] = [
  {
    id: "platform.search",
    domain: "platform",
    name: "Everyday Connect Search",
    description:
      "Search for businesses, places, services, people, opportunities, and useful information through ECOS.",
    keywords: [
      "search",
      "find",
      "discover",
      "business",
      "businesses",
      "services",
      "places",
      "people",
      "opportunities",
    ],
    capabilities: [
      "search businesses",
      "search places",
      "find services",
      "discover opportunities",
      "find local information",
    ],
    module: "ecos",
    service: "SearchEngine",
    enabled: true,
  },

  {
    id: "platform.business-registration",
    domain: "platform",
    name: "Business Registration",
    description:
      "Register a business on Everyday Connect so customers can discover it.",
    keywords: [
      "register",
      "business",
      "company",
      "shop",
      "restaurant",
      "car wash",
      "listing",
    ],
    capabilities: [
      "register a business",
      "list a business",
      "add a business",
    ],
    module: "business",
    enabled: true,
  },

  {
    id: "platform.service-registration",
    domain: "platform",
    name: "Service Registration",
    description:
      "Register a service so people can discover and use it through Everyday Connect.",
    keywords: [
      "register",
      "service",
      "services",
      "professional service",
      "listing",
    ],
    capabilities: [
      "register a service",
      "list a service",
      "add a service",
    ],
    module: "business",
    enabled: true,
  },

  {
    id: "platform.talent-registration",
    domain: "platform",
    name: "Talent Registration",
    description:
      "Register professional skills and talents so people can discover qualified individuals.",
    keywords: [
      "talent",
      "professional",
      "skills",
      "worker",
      "freelancer",
      "artisan",
      "register",
    ],
    capabilities: [
      "register talent",
      "list professional skills",
      "discover professionals",
    ],
    module: "profile",
    enabled: true,
  },

  {
    id: "platform.business-management",
    domain: "platform",
    name: "Business Management",
    description:
      "Manage a registered business and access its business management tools.",
    keywords: [
      "manage",
      "business",
      "dashboard",
      "company",
      "shop",
      "restaurant",
    ],
    capabilities: [
      "manage business",
      "open business dashboard",
      "manage business profile",
    ],
    module: "business",
    enabled: true,
  },

  {
    id: "platform.carwash-booking",
    domain: "platform",
    name: "Car Wash Booking",
    description:
      "Find and book car wash services through Everyday Connect.",
    keywords: [
      "car wash",
      "wash",
      "booking",
      "book",
      "reservation",
      "vehicle",
    ],
    capabilities: [
      "find car wash",
      "book car wash",
      "schedule car wash",
    ],
    module: "carwash",
    service: "BookingService",
    enabled: true,
  },

  {
    id: "platform.jobs",
    domain: "platform",
    name: "Jobs",
    description:
      "Discover employment opportunities and job-related information.",
    keywords: [
      "jobs",
      "job",
      "employment",
      "career",
      "vacancy",
      "work",
    ],
    capabilities: [
      "find jobs",
      "discover employment",
      "find vacancies",
    ],
    module: "jobs",
    enabled: true,
  },

  {
    id: "platform.housing",
    domain: "platform",
    name: "Housing",
    description:
      "Discover houses, apartments, land, and other property opportunities.",
    keywords: [
      "housing",
      "house",
      "home",
      "rent",
      "property",
      "land",
      "apartment",
    ],
    capabilities: [
      "find houses",
      "find rental property",
      "find land",
      "discover housing",
    ],
    module: "housing",
    enabled: true,
  },

  {
    id: "platform.education",
    domain: "platform",
    name: "Education",
    description:
      "Discover schools, universities, training opportunities, and education services.",
    keywords: [
      "school",
      "schools",
      "university",
      "college",
      "education",
      "training",
      "course",
    ],
    capabilities: [
      "find schools",
      "find universities",
      "find training",
      "discover education services",
    ],
    module: "education",
    enabled: true,
  },

  {
    id: "platform.government",
    domain: "platform",
    name: "Government Services",
    description:
      "Discover government offices, public services, and government-related information.",
    keywords: [
      "government",
      "ministry",
      "public",
      "passport",
      "immigration",
      "tax",
      "council",
    ],
    capabilities: [
      "find government services",
      "find public offices",
      "discover government information",
    ],
    module: "government",
    enabled: true,
  },

  {
    id: "platform.transport",
    domain: "platform",
    name: "Transportation",
    description:
      "Discover transportation services, vehicle rentals, taxis, motorbikes, and related services.",
    keywords: [
      "transport",
      "taxi",
      "motorbike",
      "bike",
      "bus",
      "rental",
      "vehicle",
    ],
    capabilities: [
      "find transportation",
      "find taxis",
      "find vehicle rentals",
      "discover transport services",
    ],
    module: "transport",
    enabled: true,
  },
];
