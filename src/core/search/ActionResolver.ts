import type {
  EcosAction,
  EcosIntent,
} from "./SearchTypes";

function normalize(
  value: string
): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(
  query: string,
  values: string[]
): boolean {
  return values.some(
    (value) =>
      query.includes(
        normalize(value)
      )
  );
}

export function resolveAction(
  query: string,
  intent: EcosIntent = "unknown"
): EcosAction {
  const normalized =
    normalize(query);

  if (!normalized) {
    return "unknown";
  }

  /*
   * =======================================================
   * MANAGE
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "manage my business",
      "manage my company",
      "manage my shop",
      "manage my restaurant",
      "manage my car wash",
      "manage my business profile",
      "manage my profile",
      "manage business",
      "business dashboard",
      "my business dashboard",
      "open my dashboard",
      "open business dashboard",
      "go to my dashboard",
      "take me to my dashboard",
      "manage my account",
    ])
  ) {
    return "manage";
  }

  /*
   * =======================================================
   * REGISTER BUSINESS / TALENT / SERVICE
   * =======================================================
   *
   * We intentionally support natural language such as:
   *
   * "I want my business registered"
   * "I want to register my business"
   * "Help me register my business"
   * "Get my business registered"
   * "I want to register my talent"
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "register my business",
      "register a business",
      "register business",
      "register my company",
      "register a company",
      "register my shop",
      "register a shop",
      "register my restaurant",
      "register a restaurant",
      "register my car wash",
      "register a car wash",
      "register my service",
      "register a service",

      "registered my business",
      "business registered",
      "get my business registered",
      "get my company registered",
      "get my shop registered",
      "get my car wash registered",
      "have my business registered",
      "have my company registered",
      "have my shop registered",
      "have my car wash registered",

      "i want my business registered",
      "i want my company registered",
      "i want my shop registered",
      "i want my car wash registered",

      "business registration",
      "register my talent",
      "register a talent",
      "register talent",
      "register as a talent",
      "register myself as a professional",
      "register as a professional",
      "register my profession",
      "register my service",
      "list my business",
      "list my company",
      "list my service",
      "list my talent",
      "add my business",
      "add my company",
      "add my service",
      "add my talent",
    ])
  ) {
    return "register";
  }

  /*
   * Natural-language registration fallback.
   *
   * This catches variations such as:
   *
   * "I need to get my business registered"
   * "Can I get my business registered?"
   * "Help me register my business"
   */

  const hasRegistrationWord =
    containsAny(normalized, [
      "register",
      "registered",
      "registration",
      "registering",
    ]);

  const hasBusinessWord =
    containsAny(normalized, [
      "business",
      "company",
      "shop",
      "restaurant",
      "car wash",
      "service",
      "talent",
      "professional",
      "profession",
    ]);

  if (
    hasRegistrationWord &&
    hasBusinessWord
  ) {
    return "register";
  }

  /*
   * =======================================================
   * BOOK
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "book a car wash",
      "book car wash",
      "book my car wash",
      "book a service",
      "book service",
      "make a booking",
      "make a reservation",
      "schedule an appointment",
      "schedule my appointment",
      "reserve",
      "reservation",
    ])
  ) {
    return "book";
  }

  /*
   * =======================================================
   * APPLY
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "apply for",
      "apply to",
      "submit an application",
      "submit application",
      "make an application",
    ])
  ) {
    return "apply";
  }

  /*
   * =======================================================
   * CONTACT
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "contact",
      "call",
      "message",
      "whatsapp",
      "get in touch",
      "contact them",
      "contact the business",
    ])
  ) {
    return "contact";
  }

  /*
   * =======================================================
   * CREATE
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "create a business",
      "create my business",
      "create a company",
      "create my company",
      "create a profile",
      "create my profile",
      "create an account",
      "create my account",
    ])
  ) {
    return "create";
  }

  /*
   * =======================================================
   * FIND
   * =======================================================
   */

  if (
    containsAny(normalized, [
      "find",
      "search",
      "show me",
      "where can i find",
      "looking for",
      "where do i find",
    ])
  ) {
    return "find";
  }

  /*
   * =======================================================
   * FALLBACK
   * =======================================================
   */

  if (intent !== "unknown") {
    return "find";
  }

  return "discover";
}
