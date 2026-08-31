export type EcosIntent =
  | "discover"
  | "service"
  | "talent"
  | "location"
  | "government"
  | "education"
  | "housing"
  | "jobs"
  | "community"
  | "tourism"
  | "food"
  | "transport"
  | "unknown";
  export type EcosAction =
  | "discover"
  | "find"
  | "register"
  | "create"
  | "book"
  | "apply"
  | "contact"
  | "manage"
  | "unknown";

export type EcosResultType =
  | "business"
  | "place"
  | "category";

export type EcosSearchResult = {
  id: string;
  type: EcosResultType;
  name: string;
  category?: string | null;
  description?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  verified?: boolean | null;
  rating?: number | null;
  image?: string | null;
  url: string;
  score: number;
};

export type EcosWebReference = {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
};

export type EcosSearchResponse = {
  query: string;

  intent: EcosIntent;

  action: EcosAction;

  answer: string;
  /*
   * Results currently returned to the UI.
   */
  results: EcosSearchResult[];

  /*
   * External web results currently returned.
   */
  webReferences: EcosWebReference[];

  /*
   * Total number of matching Everyday Connect
   * results available for this search.
   */
  totalLocalResults: number;

  /*
   * Number of local results currently displayed.
   */
  displayedLocalResults: number;

  /*
   * Total number of web results returned
   * by the current web-search request.
   *
   * This is NOT claimed to be the total
   * number of results on the entire internet.
   */
  totalWebResults: number;

  /*
   * Number of web results currently displayed.
   */
  displayedWebResults: number;

  /*
   * Whether another page of local results
   * can be requested.
   */
  hasMoreLocalResults: boolean;

  /*
   * Whether another page of web results
   * can be requested.
   */
  hasMoreWebResults: boolean;

  /*
   * Current result page.
   */
  page: number;

  /*
   * Number of results requested per page.
   */
  pageSize: number;

  searchedAt: string;

  source: "everyday-connect";
};
