export type CategoryDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;

  /*
   * The search phrase ECOS uses when connecting
   * this category to the wider Everyday Connect
   * search ecosystem.
   */
  searchTerm: string;

  /*
   * Searches shown to users as useful starting points.
   */
  popularSearches: string[];

  /*
   * Category subdivisions.
   */
  subcategories: string[];
};


export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [

  {
    slug: "government",

    name: "Government",

    description:
      "Find government offices, public services, documents and official information.",

    icon: "🏛️",

    color: "#1d4ed8",

    searchTerm:
      "government services",

    popularSearches: [
      "Government offices in Bamenda",
      "National identity card",
      "Birth certificate",
      "Passport services",
      "Tax services",
      "Licences and permits",
    ],

    subcategories: [
      "Government Offices",
      "Identity & Civil Documents",
      "Immigration",
      "Tax Services",
      "Public Administration",
      "Licences & Permits",
    ],
  },


  {
    slug: "education",

    name: "Education",

    description:
      "Discover schools, universities, training centres, courses and educational services.",

    icon: "🎓",

    color: "#7c3aed",

    searchTerm:
      "education schools universities training",

    popularSearches: [
      "Schools in Bamenda",
      "Universities in Bamenda",
      "Secondary schools",
      "Computer training",
      "Vocational training",
      "Scholarships",
    ],

    subcategories: [
      "Primary Schools",
      "Secondary Schools",
      "Universities",
      "Vocational Training",
      "Computer Training",
      "Scholarships",
      "Educational Services",
    ],
  },


  {
    slug: "housing",

    name: "Housing",

    description:
      "Find houses, apartments, land, rentals and property services.",

    icon: "🏠",

    color: "#059669",

    searchTerm:
      "houses apartments land property",

    popularSearches: [
      "Houses for rent in Bamenda",
      "Houses for sale in Bamenda",
      "Apartments for rent",
      "Land for sale",
      "Real estate agents",
      "Property management",
    ],

    subcategories: [
      "Houses for Rent",
      "Houses for Sale",
      "Apartments",
      "Land",
      "Property Management",
      "Real Estate Agents",
      "Construction",
    ],
  },


  {
    slug: "jobs",

    name: "Jobs",

    description:
      "Discover job opportunities, recruitment, internships and professional opportunities.",

    icon: "💼",

    color: "#d97706",

    searchTerm:
      "jobs employment recruitment",

    popularSearches: [
      "Jobs in Bamenda",
      "Job vacancies",
      "Recruitment",
      "Internships",
      "Part-time jobs",
      "Freelance work",
    ],

    subcategories: [
      "Job Vacancies",
      "Recruitment",
      "Internships",
      "Professional Jobs",
      "Part-Time Jobs",
      "Freelance Work",
      "Career Services",
    ],
  },


  {
    slug: "talent",

    name: "Talents & Professionals",

    description:
      "Find skilled people and professionals who can help with everyday tasks.",

    icon: "🛠️",

    color: "#dc2626",

    searchTerm:
      "professionals technicians skilled workers",

    popularSearches: [
      "Mechanics in Bamenda",
      "Electricians in Bamenda",
      "Plumbers in Bamenda",
      "Carpenters in Bamenda",
      "Tailors in Bamenda",
      "Photographers in Bamenda",
      "Computer technicians",
    ],

    subcategories: [
      "Mechanics",
      "Electricians",
      "Plumbers",
      "Carpenters",
      "Builders",
      "Tailors",
      "Photographers",
      "Designers",
      "Technicians",
    ],
  },


  {
    slug: "tourism",

    name: "Tourism",

    description:
      "Explore attractions, cultural sites, landmarks, activities and places to visit.",

    icon: "🌍",

    color: "#0891b2",

    searchTerm:
      "tourism attractions places to visit",

    popularSearches: [
      "Places to visit in Bamenda",
      "Tourist attractions",
      "Cultural sites",
      "Traditional sites",
      "Nature and parks",
      "Hotels",
      "Tour guides",
    ],

    subcategories: [
      "Tourist Attractions",
      "Hotels",
      "Cultural Sites",
      "Traditional Sites",
      "Nature & Parks",
      "Events & Festivals",
      "Tour Guides",
    ],
  },


  {
    slug: "food",

    name: "Food",

    description:
      "Discover restaurants, local food, cafés, bakeries and food delivery services.",

    icon: "🍽️",

    color: "#ea580c",

    searchTerm:
      "restaurants food cafes bakeries",

    popularSearches: [
      "Restaurants in Bamenda",
      "Local food",
      "African food",
      "Cafés",
      "Bakeries",
      "Food delivery",
      "Catering",
    ],

    subcategories: [
      "Restaurants",
      "Local Food",
      "Cafés",
      "Bakeries",
      "Fast Food",
      "Food Delivery",
      "Catering",
    ],
  },


  {
    slug: "transport",

    name: "Transport",

    description:
      "Find taxis, motorbike transport, vehicle rentals, drivers and travel services.",

    icon: "🚕",

    color: "#2563eb",

    searchTerm:
      "taxi transport car rental bike rental",

    popularSearches: [
      "Taxi in Bamenda",
      "Motorbike taxi",
      "Car rental",
      "Bike rental",
      "Drivers",
      "Bus services",
      "Travel agencies",
    ],

    subcategories: [
      "Taxi",
      "Motorbike Taxi",
      "Car Rental",
      "Bike Rental",
      "Drivers",
      "Bus Services",
      "Travel Agencies",
    ],
  },


  {
    slug: "community",

    name: "Community",

    description:
      "Discover community groups, organizations, events and local activities.",

    icon: "🤝",

    color: "#9333ea",

    searchTerm:
      "community groups organizations events",

    popularSearches: [
      "Community groups",
      "Local organizations",
      "Community events",
      "Associations",
      "Church groups",
      "Social activities",
    ],

    subcategories: [
      "Community Groups",
      "Associations",
      "Church Groups",
      "Community Events",
      "Local Organizations",
      "Meetings",
      "Social Activities",
    ],
  },


  {
    slug: "services",

    name: "Services",

    description:
      "Find businesses and professionals providing everyday services.",

    icon: "⚙️",

    color: "#475569",

    searchTerm:
      "services businesses professionals",

    popularSearches: [
      "Cleaning services",
      "Car wash",
      "Computer repair",
      "Phone repairs",
      "Home services",
      "Maintenance",
      "Installation",
    ],

    subcategories: [
      "Cleaning",
      "Car Wash",
      "Repairs",
      "Computer Services",
      "Phone Repairs",
      "Home Services",
      "Maintenance",
      "Installation",
    ],
  },


  {
    slug: "discover",

    name: "Discover",

    description:
      "Explore businesses, places and useful information around you.",

    icon: "✨",

    color: "#0f766e",

    searchTerm:
      "businesses places local information",

    popularSearches: [
      "Businesses near me",
      "Places near me",
      "Things to do",
      "Local businesses",
      "Places to visit",
      "Local information",
    ],

    subcategories: [
      "Businesses",
      "Places",
      "Events",
      "Local Information",
    ],
  },

];


export function getCategoryBySlug(
  slug: string
): CategoryDefinition | undefined {

  return CATEGORY_DEFINITIONS.find(
    (category) =>
      category.slug.toLowerCase() ===
      slug.trim().toLowerCase()
  );
}


export function getCategoryDefinition(
  slug: string
): CategoryDefinition | undefined {

  return getCategoryBySlug(slug);
}
