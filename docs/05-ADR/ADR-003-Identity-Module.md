# ADR-003: Identity Module

**Status:** Accepted
**Date:** 2026-08-31
**Project:** Everyday Connect

---

## 1. Decision

Everyday Connect will treat Identity as a platform-level capability with a clearly defined identity boundary.

Identity will provide the authoritative representation of a person or platform user and coordinate identity-related information without creating competing identity systems across modules and services.

The architecture will favor:

**one identity -> controlled identity services -> many consumers**

rather than multiple independent user/profile systems.

---

## 2. Problem

The repository currently contains overlapping identity-related implementations in:

- `src/core/auth/`
- `src/core/identity/`
- `src/modules/identity/`
- `src/modules/profile/`
- `src/services/identity/`
- `src/services/user/`

These areas contain or anticipate responsibilities involving:

- authentication
- authorization
- identity
- profiles
- documents
- education
- employment
- skills
- properties
- vehicles
- security
- preferences

Without an explicit ownership decision, these areas could develop into competing sources of user information.

---

## 3. Identity Boundary

Identity is responsible for the authoritative identity model of a platform user.

Identity concerns include:

- identity record
- account association
- identity attributes
- profile information
- identity-related preferences
- identity-related security state
- relationships between the user and their platform-owned records

Domain modules may consume identity information but should not create competing platform-wide identity records.

---

## 4. Authentication Boundary

Authentication and Identity are related but distinct responsibilities.

Authentication answers:

**"Can this user prove control of an account?"**

Identity answers:

**"Which platform identity does this authenticated account represent?"**

The existing substantial authentication implementation is:

`src/core/auth/`

It remains the primary authentication candidate.

Authentication should integrate with the canonical identity boundary rather than creating a separate identity record system.

---

## 5. Authorization Boundary

Authorization determines what an authenticated identity is allowed to access or perform.

Existing authorization-related code includes:

`src/core/auth/`

and:

`src/core/identity/`

Authorization must operate using the canonical identity and role/permission model.

It must not create independent user identities for individual modules.

---

## 6. Canonical Identity Foundation

The current primary identity foundation candidate is:

`src/core/identity/`

Existing components include:

- IdentityManager
- AuthenticationService
- AuthorizationService
- PermissionService
- RoleService
- SessionService
- identity types

These components should be evaluated and consolidated as the platform identity foundation.

They should not automatically be expanded independently of the existing authentication architecture.

---

## 7. Profile Boundary

The repository contains:

`src/modules/profile/`

Profile functionality should represent user-facing profile information and presentation workflows.

It must consume the canonical identity rather than becoming a second identity system.

Profile-specific UI and application workflows may remain within the profile module.

Identity ownership remains outside individual profile pages.

---

## 8. Identity Module Boundary

The repository also contains:

`src/modules/identity/`

This module contains planned areas for:

- AI profile
- businesses
- certificates
- contact information
- documents
- education
- employment
- personal information
- privacy
- properties
- security
- skills
- vehicles

These capabilities should be treated as identity-domain features rather than independent identity systems.

Their final placement between the identity core, identity module, services, and repositories should be determined during implementation consolidation.

---

## 9. User Service Boundary

The repository contains:

`src/services/user/`

User services may provide application-level operations involving users.

They must consume the canonical identity boundary and must not establish an independent user database abstraction without an explicit architectural decision.

---

## 10. Identity Service Boundary

The repository contains:

`src/services/identity/`

Services in this area may coordinate application operations involving identity.

They should not duplicate the identity authority held by the canonical identity foundation.

---

## 11. Identity Data Ownership

Identity data should follow the standard data-access boundary:

```text
UI
 |
 v
Identity Module / Application Service
 |
 v
Identity Repository
 |
 v
Infrastructure
 |
 v
Supabase
```

Repositories own persistence operations.

Infrastructure owns communication with Supabase or other external systems.

UI components must not become the authoritative owner of identity data.

---

## 12. Identity Repository

The identity architecture should use a repository boundary for persistent identity data.

The repository is responsible for:

- reading identity records
- creating identity records
- updating identity records
- deleting identity records where permitted
- querying identity relationships
- enforcing repository-level data-access contracts

A repository must not contain presentation logic.

A repository must not become an alternative identity authority.

---

## 13. Domain Relationships

Identity may be associated with domain records such as:

- businesses
- employees
- properties
- vehicles
- bookings
- marketplace activity
- jobs

The identity system should maintain appropriate relationships to these records.

It should not duplicate complete domain entities unnecessarily.

For example:

```text
Identity
   |
   +---- Business Ownership
   |
   +---- Employment
   |
   +---- Properties
   |
   +---- Vehicles
   |
   +---- Bookings
```

The domain remains responsible for its own business behavior.

---

## 14. Privacy

Identity is sensitive platform data.

Identity architecture must follow:

- Privacy by Default
- Security by Design
- data minimization
- least privilege
- explicit authorization
- appropriate consent
- controlled access

Identity information must not automatically become available to every AI agent, module, business, or service.

---

## 15. AI Access to Identity

The AI architecture established by ADR-005 may consume identity information when required for a legitimate platform capability.

AI access must be:

- purpose-limited
- authorized
- privacy-aware
- auditable
- consistent with user permissions

The existence of an AI system does not grant unrestricted access to identity data.

---

## 16. Session Ownership

Session management is part of the authentication and identity boundary.

The platform must maintain a clear distinction between:

- authenticated session
- platform identity
- authorization state
- domain records

Session state must not become a substitute for the canonical identity record.

---

## 17. Security Boundary

Identity operations must respect the platform security architecture.

No browser component should receive private infrastructure credentials.

Administrative or privileged identity operations must be protected by appropriate authorization.

Identity changes should be auditable where required.

---

## 18. Authentication Integration

The existing authentication system under:

`src/core/auth/`

should remain the primary authentication implementation unless a future ADR explicitly changes that decision.

Authentication should establish or resolve the relationship between the authenticated account and the canonical Everyday Connect identity.

The identity architecture must not introduce a second authentication mechanism merely to support identity features.

---

## 19. Profile Integration

The profile module may provide user-facing workflows for:

- viewing profile information
- editing profile information
- managing preferences
- displaying skills
- displaying documents
- displaying education
- displaying employment information

These workflows must use the canonical identity boundary.

The profile module must not create an independent user identity store.

---

## 20. Identity Module Integration

`src/modules/identity/` may provide identity-domain application features.

However, its role is to consume and expose the canonical identity capability rather than create another identity foundation.

The module may eventually coordinate features such as:

- personal information
- contact information
- documents
- education
- employment
- skills
- certificates
- properties
- vehicles
- privacy
- security
- AI profile

Final implementation ownership should be determined during consolidation.

---

## 21. User Service Integration

`src/services/user/` may contain application-level user operations.

Such operations must ultimately resolve to the canonical identity model.

The service must not silently introduce another user authority.

---

## 22. Identity Service Integration

`src/services/identity/` may coordinate identity-related application operations.

It should act as an application/service boundary where appropriate rather than becoming a competing identity database abstraction.

---

## 23. Authorization

Authorization must use:

- canonical identity
- roles
- permissions
- session context
- applicable security policies

Authorization decisions should be centralized enough to prevent different modules from implementing incompatible permission models.

---

## 24. Identity and Domain Separation

The following distinction must remain clear:

```text
Identity
   |
   +-- Who the user is
   |
   +-- Account relationship
   |
   +-- Identity attributes
   |
   +-- Access relationships
   |
   v
Domain Systems
   |
   +-- Business
   +-- Jobs
   +-- Properties
   +-- Vehicles
   +-- Bookings
   +-- Marketplace
```

Identity provides the person/account relationship.

Domain systems own domain-specific behavior and data.

---

## 25. Consolidation Rule

Before creating or expanding identity functionality:

1. Search `src/core/identity/`.
2. Search `src/core/auth/`.
3. Search `src/modules/identity/`.
4. Search `src/modules/profile/`.
5. Search `src/services/identity/`.
6. Search `src/services/user/`.
7. Determine whether the capability already exists.
8. Extend the appropriate owner where possible.
9. Record an ADR when a new architectural boundary is genuinely required.

---

## 26. Placeholder Rule

The existence of identity files does not mean that their capabilities are implemented.

Empty identity files remain classified as:

- Planned
- Future
- Placeholder
- Legacy
- To Be Implemented

They must not be populated merely because they exist.

---

## 27. Migration Principle

Identity consolidation should be incremental.

Existing working functionality must be preserved while ownership is clarified.

Migration should generally follow:

```text
Existing Implementation
        |
        v
Identify Responsibility
        |
        v
Assign Canonical Owner
        |
        v
Move / Adapt / Reuse
        |
        v
Remove Duplication
```

No large-scale deletion should occur merely to make the directory structure appear clean.

---

## 28. Consequences

### Positive

- Establishes a single identity authority.
- Reduces duplicate user/profile systems.
- Separates authentication from identity.
- Separates identity from authorization.
- Allows domain modules to consume identity safely.
- Provides a foundation for future personalization and AI capabilities.
- Improves privacy and security boundaries.

### Negative

- Existing identity-related areas will require consolidation.
- Some services and modules may need to be reorganized.
- Existing assumptions about user/profile ownership may need revision.
- Identity implementation will require careful migration planning.

---

## 29. Current Status

Identity architecture is established conceptually, but implementation consolidation is incomplete.

The immediate priority is:

1. Preserve working authentication.
2. Establish canonical identity ownership.
3. Avoid creating parallel identity systems.
4. Separate identity, authentication, authorization, and domain records.
5. Consolidate existing implementations gradually.
6. Implement only after ownership is clear.

---

## 30. Relationship to Other ADRs

This decision should be considered together with:

- ADR-002: Modular Architecture
- ADR-004: Role-Based Permissions
- ADR-005: AI Operating System

Identity provides the foundation consumed by authentication, authorization, domain modules, and approved AI capabilities.

---

## 31. Final Principle

Everyday Connect should evolve toward:

**One Identity -> Authentication -> Authorization -> Domain Relationships -> User Services**

rather than:

**Multiple User Systems -> Duplicate Records -> Conflicting Identity State**

---

**Everyday Connect — Making Daily Life Worth Living.**
