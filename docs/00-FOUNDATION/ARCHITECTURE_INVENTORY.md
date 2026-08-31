# Everyday Connect Architecture Inventory

**Status:** Foundation / Audit
**Project:** Everyday Connect

This document records the current repository architecture before consolidation.

---

## 1. Purpose

The purpose of this inventory is to identify existing systems, implementations, placeholders, duplicates, backups, and architectural boundaries before further development.

This inventory is an audit document. It does not declare every existing file to be implemented or canonical.

---

## 2. Architectural Layers Observed

The repository currently contains the following major architectural areas:

- Application pages and components
- Platform
- ECOS
- ECOS Brain
- ECOS Kernel
- Core
- Modules
- Services
- Repositories
- Infrastructure
- SDK
- AI
- Models
- Routes
- Design system
- Hooks
- Utilities
- Data
- Supabase integration

---

## 3. Canonical Architecture Candidates

The following systems are currently designated as the primary candidates for architectural ownership:

### Search
`src/core/search/`

Contains substantial existing implementations including:

- SearchEngine
- IntentResolver
- ActionResolver
- SearchFilters
- SearchIndex
- SearchRanking
- SearchTypes
- AnswerBuilder

### ECOS Brain
`src/core/ECOS Brain/`

Contains:

- BrainBootstrap
- BrainRegistry
- BrainTypes
- BusinessKnowledge
- PlatformKnowledge

### ECOS Kernel
`src/core/ECOS Kernel/`

Contains:

- EcosKernel
- EcosKernelTypes
- index

### Platform
`src/platform/`

Contains:

- PlatformBootstrap
- Platform configuration
- Platform kernel
- Module registry
- Service registry
- Platform status

### Business Repository
`src/repositories/BusinessRepository.ts`

### Existing Business Services
`src/services/business/`

### Existing Authentication
`src/core/auth/`

and existing application authentication components.

---

## 4. Significant Architectural Duplication

The repository currently contains multiple implementations or planned implementations for several responsibilities.

### AI

Existing areas include:

- `src/ai/`
- `src/core/ai/`
- `src/modules/ai/`
- `src/services/ai/`

These must not automatically become four separate AI systems.

A future Architecture Decision Record must establish ownership.

### Identity

Existing areas include:

- `src/core/identity/`
- `src/modules/identity/`
- `src/modules/profile/`
- `src/services/identity/`
- `src/services/user/`

These represent overlapping identity/profile responsibilities and require consolidation.

### Notifications

Existing areas include:

- `src/core/notifications/`
- `src/notifications/`
- `src/services/notification/`
- notification components

These require a canonical ownership decision.

### Search

Existing search systems include:

- `src/core/search/`
- `src/core/ai/search/`
- application search components
- search pages

`src/core/search/` currently contains the most substantial implementation and is therefore the primary candidate for canonical search ownership.

### Booking

Booking functionality exists across:

- `src/modules/carwash/booking/`
- `src/services/booking/`
- `src/components/booking/`
- booking models and types

This requires domain ownership to be clarified before expansion.

---

## 5. Placeholder Classification

Many files under `src/core` are currently empty.

An empty file is not considered an implemented capability.

Empty files must be classified as one of:

- Planned
- Future
- Placeholder
- Legacy
- To Be Implemented

They must not be filled merely because their names suggest a desired architectural component.

---

## 6. Backup and Historical Files

The repository contains numerous files with names such as:

- `.backup`
- `.before-*`
- `.stable`
- historical snapshots

These files are considered historical references unless explicitly promoted into the active architecture.

They must not be treated as competing production implementations.

---

## 7. Design System

The repository contains an emerging design system under:

`src/design/`

including reusable EC-prefixed components such as:

- ECAlert
- ECAvatar
- ECBadge
- ECChart
- ECCheckbox
- ECConfirmDialog
- ECDropdown
- ECEmptyState
- ECInput
- ECLoading
- ECMap
- ECModal
- ECPagination
- ECRadio
- ECSearch
- ECSelect
- ECSkeleton
- ECStepper
- ECSwitch
- ECTable
- ECTabs
- ECTextarea
- ECTooltip

The design system should be evaluated as a shared UI foundation rather than duplicated by individual modules.

---

## 8. Infrastructure

The repository currently contains Supabase infrastructure integrations under:

- `src/infrastructure/supabase/`
- `src/core/database/`
- existing application Supabase integration

These must be reviewed to establish a single canonical infrastructure boundary.

---

## 9. Architectural Risks

The current repository presents the following risks:

1. Duplicate implementations may diverge.
2. Empty architectural files may create false assumptions about implemented capabilities.
3. Historical backups may be mistaken for active systems.
4. Multiple service layers may create competing business logic.
5. Multiple identity systems may create inconsistent user state.
6. Multiple AI systems may create conflicting orchestration.
7. Multiple notification systems may create duplicate delivery logic.
8. Infrastructure access may become inconsistent if boundaries are not enforced.

---

## 10. Consolidation Rule

Before creating or implementing a new system:

1. Search the repository for existing implementations.
2. Determine which system currently owns the responsibility.
3. Determine whether the existing system is implemented, partial, planned, or legacy.
4. Reuse or extend the canonical system when appropriate.
5. If a new system is genuinely required, document the architectural decision.

---

## 11. Foundation Objective

The immediate objective is not to implement every empty file.

The immediate objective is to establish architectural ownership.

Once ownership is established, implementation can proceed without creating unnecessary parallel systems.

---

## 12. Status

This inventory represents the repository state observed during the Foundation Architecture Audit.

It should be updated when major architectural ownership decisions are made.

**Everyday Connect — Making Daily Life Worth Living.**
