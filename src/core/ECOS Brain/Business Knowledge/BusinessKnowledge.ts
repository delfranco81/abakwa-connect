import type {
  EcosKnowledgeEntry,
} from "../BrainTypes";

export const businessKnowledge: EcosKnowledgeEntry[] = [
  {
    id: "business.discovery",
    domain: "business",
    name: "Business Discovery",
    description:
      "Discover businesses and business listings through Everyday Connect and ECOS.",
    keywords: [
      "business",
      "businesses",
      "company",
      "companies",
      "shop",
      "restaurant",
      "business listing",
      "find business",
      "discover business",
    ],
    capabilities: [
      "find businesses",
      "discover business listings",
      "search businesses",
    ],
    module: "business",
    service: "SearchEngine",
    enabled: true,
  },

  {
    id: "business.registration",
    domain: "business",
    name: "Business Registration",
    description:
      "Register and list a business on Everyday Connect so it can be discovered through the platform.",
    keywords: [
      "register",
      "registration",
      "business",
      "company",
      "shop",
      "restaurant",
      "listing",
      "list business",
      "add business",
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
    id: "business.management",
    domain: "business",
    name: "Business Management",
    description:
      "Manage a registered business through the business management area of Everyday Connect.",
    keywords: [
      "manage",
      "management",
      "business",
      "company",
      "dashboard",
      "business dashboard",
      "business profile",
    ],
    capabilities: [
      "manage a business",
      "open business management",
      "manage business profile",
    ],
    module: "business",
    enabled: true,
  },

  {
    id: "business.positions",
    domain: "business",
    name: "Business Positions",
    description:
      "Manage positions belonging to a business, including employment type, salary range, branch, department, probation, and attendance-related thresholds.",
    keywords: [
      "position",
      "positions",
      "job position",
      "job positions",
      "employment",
      "full time",
      "part time",
      "contract",
      "internship",
      "temporary",
      "salary",
      "branch",
      "department",
      "probation",
    ],
    capabilities: [
      "view business positions",
      "create a business position",
      "update a business position",
      "delete a business position",
      "define employment type",
      "define salary range",
    ],
    module: "business",
    service: "positionService",
    enabled: true,
  },
];
