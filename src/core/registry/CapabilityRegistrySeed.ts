import { BUSINESS_SUBSCRIPTION_CAPABILITY } from "./CapabilityCatalog";
import { ecosCapabilityRegistry } from "./CapabilityRegistry";

/**
 * Registers the canonical built-in ECOS capabilities.
 *
 * This function is idempotent so application initialization can safely call
 * it more than once.
 */
export function registerDefaultEcosCapabilities(): void {
  if (!ecosCapabilityRegistry.has(BUSINESS_SUBSCRIPTION_CAPABILITY.id)) {
    ecosCapabilityRegistry.register(BUSINESS_SUBSCRIPTION_CAPABILITY);
  }
}

/**
 * Returns the canonical business subscription capability.
 */
export function getBusinessSubscriptionCapability() {
  registerDefaultEcosCapabilities();

  return ecosCapabilityRegistry.getById(
    BUSINESS_SUBSCRIPTION_CAPABILITY.id
  );
}
