import type { EcosCapability } from "./Capability.types";

/**
 * Stable ECOS capability identifiers.
 *
 * These IDs are architectural contracts and must not be changed casually.
 * Subscription plans, payment providers, and UI labels must not be encoded
 * into the capability ID.
 */
export const ECOS_CAPABILITY_IDS = {
  BUSINESS_SUBSCRIPTION: "ecos.business.subscription",
} as const;

export type EcosCapabilityId =
  (typeof ECOS_CAPABILITY_IDS)[keyof typeof ECOS_CAPABILITY_IDS];

/**
 * Canonical capability definition for an active business subscription.
 *
 * The name and description are internal registry metadata.
 * User-facing applications must resolve visible text through the existing
 * English/French translation system rather than displaying these strings
 * directly.
 */
export const BUSINESS_SUBSCRIPTION_CAPABILITY: EcosCapability = {
  id: ECOS_CAPABILITY_IDS.BUSINESS_SUBSCRIPTION,
  name: "Business Subscription Access",
  description:
    "Provides entitlement-backed access associated with an active ECOS business subscription.",
  status: "active",
  scope: "business",
  categorySlugs: [],
  relationships: [],
  discovery: {
    searchTerms: [
      "business subscription",
      "subscription access",
      "paid business access",
      "ecos subscription",
    ],
    keywords: [
      "subscription",
      "business",
      "access",
      "entitlement",
      "paid",
    ],
    description:
      "Subscription-backed business capability used by ECOS entitlement resolution.",
  },
  metadata: {
    translationNamespace: "capabilities.businessSubscription",
    commercialPlans: ["monthly", "yearly"],
    entitlementSubjectType: "business",
    source: "subscription",
  },
};
