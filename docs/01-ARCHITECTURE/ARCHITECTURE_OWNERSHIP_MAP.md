# Everyday Connect Architecture Ownership Map

**Status:** Foundation / Canonical
**Project:** Everyday Connect

This document defines architectural ownership across Everyday Connect.

Its purpose is to prevent competing implementations, duplicated responsibilities, and uncontrolled dependencies.

---

# 1. Ownership Principle

Every major capability must have one clearly identifiable architectural owner.

Other layers may consume, support, or adapt that capability, but they must not independently recreate its responsibility.

Before creating a new implementation:

1. Search for the existing capability.
2. Identify its current owner.
3. Determine whether it is implemented, partial, planned, or legacy.
4. Extend the appropriate owner when possible.
5. Create a new owner only when an Architecture Decision Record explicitly justifies it.

---

# 2. Platform Ownership

**Canonical location:**

`src/platform/`

The Platform layer owns:

- Platform bootstrap
- Platform lifecycle
- Platform configuration
- Feature flags
- Module registration
- Service registration
- Platform status
- Platform-level initialization

The Platform must not contain domain-specific business logic.

---

# 3. ECOS Ownership

ECOS is the intelligent operating layer of Everyday Connect.

ECOS consists of:

- ECOS Kernel
- ECOS Brain

---

# 4. ECOS Kernel Ownership

**Canonical location:**

`src/core/ECOS Kernel/`

The ECOS Kernel owns the execution foundation of ECOS.

Responsibilities include:

- Kernel initialization
- Kernel lifecycle
- Kernel-level coordination
- Core ECOS runtime structures

The Kernel should remain independent from individual business domains.

---

# 5. ECOS Brain Ownership

**Canonical location:**

`src/core/ECOS Brain/`

The ECOS Brain owns the platform intelligence foundation.

Responsibilities include:

- Platform knowledge
- Business knowledge
- Intelligence registration
- Brain initialization
- AI knowledge coordination

The Brain should coordinate intelligence rather than allowing individual modules to create competing platform-wide intelligence systems.

---

# 6. Search Ownership

**Canonical location:**

`src/core/search/`

The canonical Search system currently contains:

- SearchEngine
- IntentResolver
- ActionResolver
- SearchFilters
- SearchIndex
- SearchRanking
- SearchTypes
- AnswerBuilder

`src/core/search/` is the primary search implementation.

The existence of:

`src/core/ai/search/`

does not automatically create a second search system.

Its future role must be determined through architectural decisions.

Application pages and modules may consume the canonical Search system.

---

# 7. AI Ownership

AI currently exists in several locations:

- `src/core/ai/`
- `src/ai/`
- `src/modules/ai/`
- `src/services/ai/`

These locations must not be treated as four independent AI platforms.

AI ownership is currently **under consolidation**.

The future canonical AI architecture must define:

- AI engine
- AI providers
- AI orchestration
- Agents
- Context
- Memory
- Reasoning
- Recommendations
- Ethics
- Knowledge
- AI services

Until that architecture is formally established, new parallel AI foundations should not be created.

---

# 8. Identity Ownership

Identity-related code currently exists in:

- `src/core/identity/`
- `src/core/auth/`
- `src/modules/identity/`
- `src/modules/profile/`
- `src/services/identity/`
- `src/services/user/`

These are overlapping responsibilities.

Identity ownership is therefore **not yet fully consolidated**.

Authentication, authorization, identity data, profiles, documents, skills, employment, properties, and vehicles must eventually be assigned to clearly defined owners.

No new competing identity system should be introduced before that decision.

---

# 9. Authentication Ownership

The current substantial authentication implementation is:

`src/core/auth/`

Existing authentication components include:

- AuthenticationService
- AuthProvider
- ProtectedRoute
- authentication types

This is currently the primary authentication candidate.

Other authentication implementations must not be expanded without reviewing this system first.

---

# 10. Business Domain Ownership

Business-related functionality currently exists across:

- `src/modules/business/`
- `src/services/business/`
- `src/repositories/BusinessRepository.ts`
- business models
- application components

The Business domain should own business-specific functionality.

Repositories should own data access.

Services should coordinate application/domain operations.

UI components should remain presentation-focused.

---

# 11. Booking Ownership

Booking functionality currently exists across:

- `src/modules/carwash/booking/`
- `src/services/booking/`
- booking models
- application booking components

The existing Car Wash booking implementation is substantial and must be preserved as an existing domain implementation.

A future platform-wide Booking architecture must determine which responsibilities belong to:

- domain modules
- shared booking services
- repositories
- models

New booking functionality should extend the appropriate owner rather than creating parallel booking systems.

---

# 12. Notifications Ownership

Notification functionality currently exists across:

- `src/core/notifications/`
- notification components
- `src/services/notification/`
- other application notification code

Notification ownership is currently **under consolidation**.

The final architecture must establish one canonical notification orchestration boundary.

Channels such as:

- In-App
- Email
- SMS
- WhatsApp
- Push

should be treated as delivery mechanisms rather than independent notification platforms.

---

# 13. Location Ownership

Location-related functionality currently exists across:

- `src/core/location/`
- `src/lib/location.ts`
- location services
- booking location components

Location ownership requires separation between:

- location acquisition
- geolocation utilities
- distance calculations
- maps
- business proximity
- booking-specific location selection

Existing working implementations should be reused before new location systems are introduced.

---

# 14. Data Access Ownership

Data access should follow this boundary:

UI
 |
 v
Modules / Application Services
 |
 v
Repositories
 |
 v
Infrastructure
 |
 v
Supabase / External Systems

Repositories should own data-access operations.

Infrastructure should own external-system integration.

UI components should not become the primary location for database logic.

---

# 15. Supabase Infrastructure Ownership

Existing Supabase integrations include:

- `src/lib/supabase.ts`
- `src/infrastructure/supabase/`
- `src/core/database/`

These currently overlap.

A future architecture decision must establish the canonical Supabase infrastructure boundary.

The browser must only receive public/publishable credentials appropriate for client-side use.

Private service-role credentials must never be exposed to browser code.

---

# 16. Web Search Provider Ownership

The ECOS web search Edge Function is:

`supabase/functions/ecos-web-search/`

This function owns server-side communication with the external web-search provider.

The browser SearchEngine communicates with the Edge Function rather than directly exposing the provider's private API credential.

The intended boundary is:

Browser
 |
 v
Everyday Connect SearchEngine
 |
 v
Supabase Edge Function
 |
 v
External Web Search Provider

---

# 17. Design System Ownership

The shared design system under:

`src/design/`

should provide reusable UI primitives.

Individual modules should reuse these components instead of creating unnecessary parallel design systems.

---

# 18. SDK Ownership

The SDK under:

`src/sdk/`

is the public application-facing interface for reusable Everyday Connect capabilities.

The SDK should expose stable interfaces rather than allowing applications to depend directly on internal implementation details.

---

# 19. Placeholder Rule

An empty file does not represent an implemented capability.

Empty architectural files remain classified as:

- Planned
- Future
- Placeholder
- Legacy
- To Be Implemented

They must not be implemented merely because they exist.

---

# 20. Historical File Rule

Files containing names such as:

- `.backup`
- `.before-*`
- `.stable`
- historical snapshots

are historical references unless explicitly promoted.

They are not competing production systems.

---

# 21. Domain Boundary Rule

Domain modules own domain behavior.

Shared platform capabilities belong in appropriate core/platform infrastructure rather than being duplicated inside each domain.

---

# 22. Architecture Decision Rule

When ownership is ambiguous, do not guess.

Create an Architecture Decision Record in:

`docs/05-ADR/`

The ADR should explain:

- The problem
- Existing implementations
- Options considered
- Decision
- Reason
- Consequences

---

# 23. Foundation Rule

The purpose of this map is to establish architectural ownership before expansion.

The project should prefer:

**one responsibility -> one owner -> many consumers**

rather than:

**one responsibility -> many competing implementations**

---

**Everyday Connect — Making Daily Life Worth Living.**
