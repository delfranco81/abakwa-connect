# ADR-006: ECOS Category, Capability, Subscription and Platform Continuity Architecture

**Status:** Accepted  
**Date:** 2026-09-02  
**Project:** Everyday Connect / ECOS

---

## 1. Decision

Everyday Connect will evolve into an extensible ecosystem platform called ECOS.

ECOS will not be designed around a permanently fixed list of categories.

Instead, the platform will provide a reusable architecture consisting of:

- Identity
- Authorization
- Categories
- Capabilities
- Subscriptions
- Entitlements
- Businesses
- Users
- Transactions
- Integrations
- Discovery
- AI orchestration
- Cross-platform services

New categories and services must be able to use this foundation without requiring a redesign of the core platform.

---

## 2. ECOS as an Extensible Ecosystem

ECOS is an ecosystem engine rather than a collection of unrelated applications.

The ecosystem may contain multiple categories including:

- Business
- Tourism
- Leisure
- Talents
- Events
- Healthcare
- Real Estate
- Construction
- Marketplace
- Rentals
- Marketing and Publicity
- Ideas and Innovation
- Community
- Future categories

Categories may interact with one another.

The architecture must therefore support relationships between categories rather than treating each category as an isolated application.

---

## 3. Category Registry

Categories must be represented through a centralized Category Registry.

The Category Registry defines the identity and metadata of an ECOS category.

A category may contain:

- Category identifier
- Name
- Description
- Status
- Capabilities
- Discovery configuration
- Subscription offerings
- Relationships with other categories
- Localization metadata

The registry must allow new categories to be introduced without changing the core identity architecture.

---

## 4. Dynamic Category Expansion

ECOS must support future categories.

A future category may be introduced when a new business opportunity, community need, service concept, or user idea becomes sufficiently mature.

The core platform must not require hard-coded assumptions that only today's categories will ever exist.

---

## 5. Ecosystem Relationships

Categories must be capable of connecting to other categories.

Examples:

Tourism may connect with:

- Hotels
- Restaurants
- Transport
- Leisure
- Events
- Maps
- Marketplace services

Real estate may connect with:

- Construction
- Property services
- Rentals
- Marketplace
- Marketing

Business may connect with:

- Marketing
- Payments
- Employees
- Marketplace
- Rentals
- Events
- Tourism

These relationships are part of the ecosystem architecture.

---

## 6. Capability Registry

Capabilities represent what ECOS can provide.

A capability is more fundamental than a subscription plan.

Examples include:

- Business management
- Employee management
- Booking
- Marketplace selling
- Property management
- Tourism planning
- Marketing
- Publicity
- Analytics
- AI assistance
- Payment processing
- Integration
- Inventory management

Capabilities must be reusable across categories.

---

## 7. Subscription Architecture

Subscriptions must be constructed around capabilities and entitlements rather than permanently hard-coded plan names.

A subscription may grant one or more capabilities.

This allows ECOS to introduce, modify, bundle, or remove commercial offerings without redesigning the underlying platform.

---

## 8. Entitlements

An entitlement represents the actual access granted to an account or business.

Entitlements may depend on:

- Subscription
- User identity
- Business relationship
- Category
- Capability
- Permission
- Account status
- Delegated authority

The entitlement layer must be separate from the presentation of subscription plans.

---

## 9. Identity and Authorization

Identity establishes who the user is.

Authorization establishes what that identity is allowed to do.

Subscription establishes what capabilities have been purchased or otherwise granted.

These concepts must remain separate.

A subscription must not automatically grant unrestricted administrative authority.

---

## 10. Business Owner Sovereignty

The business owner remains the ultimate authority over their business.

ECOS does not own a business merely because the business is connected to ECOS.

The owner determines:

- What ECOS may access
- What ECOS may manage
- What integrations may be connected
- What actions may be delegated
- What authority may be revoked

---

## 11. Delegated ECOS Authority

When a business connects to ECOS, the owner may delegate defined authority to ECOS.

Delegation must be explicit and scoped.

ECOS may only perform actions within the authority granted by the business owner and platform authorization rules.

Delegated authority must be revocable.

---

## 12. Business Integration Architecture

Businesses may connect existing systems to ECOS.

Possible integrations include:

- Websites
- Booking systems
- Payment systems
- CRMs
- Inventory systems
- Management systems
- APIs
- Other authorized business software

An integration grants only explicitly authorized capabilities.

ECOS AI must operate through authorized integrations rather than bypassing the business's access controls.

---

## 13. ECOS Business Architecture

The highest appropriate business subscription level may provide access to ECOS Business Architecture.

The intended flow is:

Business Owner
→ Business Discovery
→ Business Questions
→ Business Understanding
→ Architecture
→ Management Platform Design
→ Configuration / Development
→ Integrations
→ AI Management
→ Business Growth

ECOS should ask the business owner appropriate questions before designing the business platform.

---

## 14. Business Discovery

Business discovery should establish an understanding of:

- Business model
- Services
- Products
- Customers
- Employees
- Locations
- Operations
- Booking processes
- Payment processes
- Existing systems
- Business goals
- Growth requirements

The resulting information should guide platform configuration.

---

## 15. Business Management Platform

Where appropriate, ECOS may configure or develop business management capabilities.

These may include:

- Employees
- Departments
- Services
- Customers
- Bookings
- Inventory
- Transactions
- Reports
- Operations
- Marketing
- Integrations

Business management must remain scoped to the relevant business.

---

## 16. ECOS Business Growth Studio

ECOS may provide business growth capabilities including:

- Digital marketing
- Brochures
- Flyers
- Social campaigns
- Promotional content
- Business messaging
- Marketing strategies
- Customer acquisition strategies

ECOS should gather business information before producing growth materials.

---

## 17. Marketing and Publicity

Marketing and publicity may be offered as independent capabilities or as components of larger subscriptions.

The architecture must allow them to be combined with other business capabilities.

A business may therefore obtain marketing services without necessarily subscribing to every business-management capability.

---

## 18. Tourism Ecosystem

ECOS may provide a dedicated tourism ecosystem.

Tourism capabilities may include:

- Maps
- Places
- Attractions
- Hotels
- Restaurants
- Transport
- Leisure
- Events
- Tourism planning
- Recommendations

Tourism subscriptions may provide broader access to these services.

---

## 19. Tourism Planning

A tourism user may provide information such as:

- Destination
- Number of days
- Interests
- Budget
- Preferred activities
- Transportation requirements

ECOS may use this information to create a tourism plan.

The tourism architecture should connect relevant ecosystem resources rather than treating tourism as an isolated category.

---

## 20. Leisure Ecosystem

The leisure ecosystem may include:

- Bars
- Drinking spots
- Snacks
- Nightclubs
- Entertainment venues
- Leisure activities
- Events

These resources may participate in tourism recommendations and general ECOS discovery.

---

## 21. Construction Ecosystem

The construction ecosystem may include:

- Construction companies
- Contractors
- Skilled workers
- Materials
- Equipment
- Projects
- Property development
- Related services

Construction may integrate with Real Estate and Marketplace capabilities.

---

## 22. Real Estate Ecosystem

The real estate ecosystem may include:

- Properties
- Property owners
- Agents
- Rentals
- Property services
- Property transactions
- Construction relationships

Property transactions may require additional verification and closing conditions.

---

## 23. Healthcare Ecosystem

The healthcare ecosystem may include:

- Hospitals
- Clinics
- Healthcare providers
- Services
- Locations
- Appointments
- Healthcare discovery

Healthcare information and operations must receive appropriate privacy and authorization treatment.

---

## 24. Talents Ecosystem

The talents ecosystem may allow users and businesses to discover and connect with:

- Skilled individuals
- Creatives
- Professionals
- Service providers
- Performers
- Other talent categories

Talent discovery may connect with Events, Business, Marketing, and Marketplace.

---

## 25. Events Ecosystem

The events ecosystem may support:

- Events
- Event organizers
- Venues
- Tickets
- Participants
- Promotions
- Related services

Events may connect with Tourism, Leisure, Business, Marketing, and Marketplace.

---

## 26. Community Free Principle

ECOS should maintain a free community participation layer where appropriate.

Community participation should not require a paid subscription merely to exist within the ecosystem.

Commercial capabilities may remain separately monetized.

This establishes a distinction between:

- Community participation
- Paid capabilities
- Business subscriptions
- Premium services

---

## 27. Ideas and Innovation

ECOS should provide a path for ideas and innovation to become future ecosystem capabilities or categories.

A new idea should not require immediate redesign of the core platform.

The architecture must allow successful ideas to evolve into:

- Capabilities
- Services
- Categories
- Ecosystems
- Businesses

---

## 28. Localization

ECOS must support localization from the architectural foundation.

User-facing content should be translatable.

The existing Everyday Connect English/French localization architecture must be preserved.

New ECOS features must not introduce unnecessary hard-coded user-visible strings.

---

## 29. Web, iOS and Android

ECOS is intended to support:

- Web
- iOS
- Android

The backend architecture must remain client-neutral.

Client applications may provide platform-specific interfaces, but they must use the same underlying identity, authorization, subscription, entitlement, and transaction authority.

---

## 30. Cross-Platform Account Entitlements

Account-level entitlements must remain associated with the ECOS account rather than with a specific device or application.

A subscription or entitlement granted to an account must be available to authorized clients after successful authentication.

The Web, iOS, and Android applications must not maintain separate entitlement universes.

---

## 31. AI Orchestration

AI may act as an orchestration layer across ECOS capabilities.

AI may assist with:

- Discovery
- Business analysis
- Recommendations
- Business architecture
- Marketing
- Tourism planning
- Content generation
- Workflow assistance
- Management support

AI actions remain subject to identity, permissions, subscriptions, delegated authority, and server-side authorization.

---

## 32. Extensibility and Separation of Concerns

ECOS must preserve separation between:

- Identity
- Authentication
- Authorization
- Categories
- Capabilities
- Subscriptions
- Entitlements
- Businesses
- Transactions
- Payments
- Integrations
- AI
- Client applications

Changing one layer should not unnecessarily require rewriting unrelated layers.

Implementation should proceed incrementally.

Existing working Everyday Connect functionality must not be replaced unnecessarily.

---

## 33. ECOS User Independence

Every ECOS user is an independent account and identity within the platform.

A user who subscribes to or operates a business must not automatically gain access to another business subscriber's:

- Profile
- Private information
- Customers
- Employees
- Transactions
- Financial information
- Management data
- Integrations
- Internal operations

A user may have relationships with multiple businesses only where those relationships are explicitly authorized.

A common ECOS account does not constitute authorization to access another business.

---

## 34. Business Data Isolation

Business data isolation is mandatory.

Access must be enforced at the server and data-access layers.

Frontend visibility, hidden fields, route restrictions, or client-side checks are not sufficient security controls.

For every business-scoped operation, the backend must establish:

1. Authenticated identity
2. Target business
3. User's business relationship
4. Authorized permissions
5. Requested capability
6. Whether the operation is permitted

Business-scoped resources should be associated with an explicit business identifier where appropriate.

Examples include:

- Employees
- Departments
- Services
- Bookings
- Transactions
- Customers
- Inventory
- Subscriptions
- Financial records
- Integrations
- Business documents
- Marketing assets
- Analytics

A user authorized for Business A must not receive Business B data.

Database-level controls such as Row Level Security and server-side authorization policies should be used where supported.

---

## 35. ECOS 6W + How Discovery Principle

Discovery is a foundational ECOS capability.

ECOS should help users answer:

- What?
- Which?
- Where?
- When?
- Why?
- How?

This is the **ECOS 6W + How Discovery Principle**.

The principle applies across categories.

### What

What businesses, services, products, events, places, healthcare resources, tourism resources, talents, properties, or opportunities exist?

### Which

Which option best matches the user's requirements, location, preferences, budget, or timing?

### Where

Where is the relevant resource located?

### When

When is the resource available, when does an event occur, or when can a service be booked?

### Why

Why is an option recommended or relevant?

### How

How can the user access, book, purchase, contact, navigate to, participate in, or use the resource?

Search, structured data, category relationships, availability, location, AI, and authorized integrations may all contribute to these answers.

---

## 36. Payment Provider Architecture

ECOS payment architecture must separate payment providers from transaction authorization and settlement.

Initial payment providers include:

- MTN Mobile Money
- Orange Money

Banking and additional providers may be introduced later.

A payment method represents how funds are initiated or transferred.

It does not determine whether a transaction is:

- Authorized
- Completed
- Held
- Released
- Refunded
- Disputed
- Settled

For example:

`payment_method = MTN_MOBILE_MONEY`

must not imply:

`transaction_status = SETTLED`

Payment providers must integrate with the transaction state machine established by ADR-005.

---

## 37. Mobile/Web Identity Continuity

ECOS must provide one continuous identity across:

- Web
- iOS
- Android

A user must not need separate ECOS identities because they change devices or platforms.

The canonical identity belongs to the ECOS account/backend.

The following remain account-level concepts:

- Identity
- User type
- Business relationships
- Permissions
- Module access
- Subscription state
- Entitlements
- Transaction authority
- Business memberships

---

## 38. Cross-Platform Account Continuity

ECOS account continuity is based on the authenticated account rather than the device.

A user who signs in successfully should be able to continue using authorized ECOS capabilities across supported platforms.

Examples include:

- Starting on Web and continuing on iOS
- Managing a business on Web and continuing on Android
- Discovering a service on Android and continuing on Web
- Changing devices without losing account-level entitlements

The backend remains the source of truth for:

- Identity
- Authorization
- Business relationships
- Subscriptions
- Entitlements
- Transactions
- Payment state
- Delegated authority

Local client state must not become the authoritative source.

---

## 39. Server-Side Authorization Requirement

ECOS authorization must ultimately be enforced on the server and data-access layers.

Web, iOS, and Android applications are clients and must not be trusted as authorization authorities.

Client-side checks may improve user experience but are not security controls.

Every protected backend operation must independently evaluate relevant authorization context.

This may include:

- Authenticated identity
- Account status
- User type
- Business relationship
- Business ownership
- Delegated authority
- Module access
- Capability
- Permission
- Subscription entitlement
- Transaction state
- Resource ownership
- Business scope

No client platform may bypass authorization by modifying:

- Requests
- Routes
- Local state
- Application code

The fundamental ECOS security principle is:

**The client requests; the server decides.**

---

## 40. Architectural Consequence

ECOS is fundamentally a backend-authoritative ecosystem platform.

The client applications are presentation and interaction layers over shared ecosystem authority.

The high-level architecture is:

Web / iOS / Android
→ ECOS Application Layer
→ ECOS Identity & Authorization
→ ECOS Capability & Entitlement Layer
→ Business / Category / Transaction Services
→ Data & Integration Layer

This architecture allows ECOS to expand categories, clients, payment providers, integrations, AI capabilities, and business services without creating separate identity or authorization systems.

---

## 41. Final Principle

ECOS must remain:

**One ecosystem.  
One identity.  
One account authority.  
Many categories.  
Many capabilities.  
Many businesses.  
Strictly isolated private data.  
Cross-platform continuity.  
Server-controlled authorization.**

The ecosystem must be able to grow without requiring the foundation to be redesigned.

---

## 42. Implementation Strategy

Implementation must proceed incrementally.

The initial implementation sequence is:

1. Category Registry
2. Capability Registry
3. Subscription model
4. Entitlement model
5. Identity-to-entitlement resolution
6. Server-side authorization
7. Business data isolation
8. Business integration architecture
9. Discovery / 6W + How architecture
10. AI orchestration
11. Cross-platform client support

Existing authentication and working Everyday Connect features must remain operational during the transition.

---

## 43. Authentication Compatibility

The existing Supabase authentication architecture remains the canonical authentication mechanism for the current Everyday Connect application.

ECOS identity architecture must build on the authenticated account rather than creating a replacement authentication system.

The existing authentication flow must not be unnecessarily replaced.

---

## 44. Legacy Compatibility

Existing application code may contain legacy role terminology, including the existing `"business"` compatibility role.

Migration toward the ECOS role model must be deliberate.

Existing business entity terminology must not be globally renamed merely because the ECOS user-type model uses `business_owner`.

Compatibility must be preserved while authorization semantics are migrated incrementally.

---

## 45. Business Relationship Model

A business relationship must be represented separately from the user's global identity.

Supported relationships include:

- Owner
- Manager
- Employee
- Authorized operator

A user may have different relationships with different businesses.

Authorization must evaluate the relationship against the target business.

---

## 46. Subscription and Authority Separation

A paid subscription does not automatically make a user the owner of a business.

Likewise, business ownership does not automatically grant access to every ECOS capability.

Authorization must evaluate:

Identity
→ Relationship
→ Capability
→ Permission
→ Entitlement
→ Resource scope

This prevents commercial subscription state from being confused with organizational authority.

---

## 47. Payment and Transaction Separation

Payment provider, payment state, transaction state, authorization, and settlement authority must remain distinct.

The transaction state machine defined by ADR-005 remains authoritative.

The planned transaction progression is:

INITIATED
→ PAYMENT_PENDING
→ PAYMENT_RECEIVED
→ FUNDS_HELD
→ PROVIDER_VALIDATED
→ SERVICE_OR_PRODUCT_DELIVERED
→ CUSTOMER_APPROVED
→ READY_FOR_SETTLEMENT
→ SETTLED

Alternative states include:

- CANCELLED
- REFUNDED
- DISPUTED
- UNDER_REVIEW
- RESOLVED

---

## 48. Data Ownership Principle

Business data belongs to the business context to which it is associated.

ECOS provides infrastructure and authorized services but does not use ecosystem membership as justification for unrestricted access to private business data.

Business owners retain control over their business information and delegated integrations.

---

## 49. Future Commercial Flexibility

Commercial decisions such as:

- Pricing
- Subscription duration
- Capability bundles
- Promotional offers
- Free trials
- Regional pricing
- Premium services

must remain configurable.

These decisions must not be embedded into the fundamental identity or authorization architecture.

---

## 50. Future Provider Flexibility

Payment, mapping, communication, AI, analytics, and other external providers may change over time.

The architecture should therefore use provider abstractions where practical.

The core ECOS model must not become dependent on a single external provider.

---

## 51. Regional and Localized Growth

ECOS must be capable of expanding from its initial market and technology environment to additional regions.

Localization should support:

- Languages
- Currency
- Payment providers
- Regional services
- Business practices
- Regulatory requirements

Regional differences should be implemented as configuration and service capabilities where practical rather than through unrelated application forks.

---

## 52. Security Principle

Security must be enforced through architecture rather than interface assumptions.

The system must assume that a client request can be modified.

Therefore:

**Never trust the client to authorize itself.**

The backend must independently validate identity, authority, resource scope, and applicable entitlement.

---

## 53. AI Authority Boundary

AI does not receive authority merely because it can reason about a task.

An AI action must remain subject to the same authorization boundaries as a human-initiated action.

AI must not:

- Access another business without authorization
- Bypass permissions
- Override business-owner restrictions
- Release funds without transaction authority
- Access private data merely because it is technically available

AI operates within ECOS authorization.

---

## 54. Non-Goals

This ADR does not define:

- Final subscription prices
- Final payment-provider contracts
- Final mobile UI
- Final iOS implementation
- Final Android implementation
- Final database schema
- Final AI model selection
- Final business commercial packages

Those decisions may be defined by later ADRs and implementation specifications.

---

## 55. Architectural Conclusion

ADR-006 establishes the foundation for ECOS as an extensible, cross-platform, backend-authoritative ecosystem.

The architecture allows Everyday Connect to evolve from its current application into a broader ecosystem without abandoning existing working functionality.

Future architecture decisions must remain consistent with this ADR unless a later ADR explicitly supersedes it.

