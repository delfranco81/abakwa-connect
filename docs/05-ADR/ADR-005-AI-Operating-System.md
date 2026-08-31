# ADR-005: AI Operating System

**Status:** Accepted  
**Date:** 2026-08-31  
**Project:** Everyday Connect

---

## 1. Decision

Everyday Connect will treat Artificial Intelligence as a platform-level capability rather than as multiple independent AI systems distributed across individual modules.

The AI architecture will operate as part of the ECOS intelligent operating layer.

The architecture will favor:

**one AI foundation -> multiple specialized capabilities -> many consumers**

rather than multiple competing AI foundations.

---

## 2. Problem

The repository currently contains AI-related code in multiple locations:

- `src/core/ai/`
- `src/ai/`
- `src/modules/ai/`
- `src/services/ai/`

There are also AI-related responsibilities distributed across:

- ECOS Brain
- Search
- Recommendations
- Business functionality
- Identity
- Notifications
- other domain modules

Without an explicit ownership decision, these areas could evolve into competing AI implementations.

---

## 3. Architectural Principle

AI is a cross-platform capability.

Domain modules may consume AI capabilities, but domain modules should not create independent platform-wide AI foundations.

AI responsibilities should be separated into clear architectural concerns.

These include:

- AI engine
- AI providers
- AI orchestration
- agents
- context
- memory
- reasoning
- recommendations
- knowledge
- ethics and governance
- AI services

---

## 4. ECOS Relationship

ECOS is the intelligent operating layer of Everyday Connect.

ECOS consists of:

- ECOS Kernel
- ECOS Brain

The ECOS Kernel provides the execution foundation.

The ECOS Brain provides platform intelligence and knowledge coordination.

The AI architecture must integrate with ECOS rather than creating a competing operating layer.

---

## 5. Current Canonical AI Foundation

The repository already contains substantial AI infrastructure under:

`src/core/ai/`

This area contains existing implementations for:

- AI engine
- AI manager
- AI provider
- AI registry
- orchestration
- intent resolution
- task planning
- workflow execution

These existing implementations are the primary candidates for the canonical AI foundation.

They must be evaluated and extended before creating new AI foundations.

---

## 6. ECOS Brain Boundary

The ECOS Brain remains the platform intelligence and knowledge coordination layer:

`src/core/ECOS Brain/`

The Brain should coordinate platform knowledge and intelligence.

The Brain must not become a second independent AI engine.

Where appropriate, the Brain may consume or coordinate the canonical AI foundation.

---

## 7. Search Boundary

Search remains owned by:

`src/core/search/`

Search is a platform capability that may use AI.

AI-enhanced search must not create a second independent search architecture.

The existing:

`src/core/ai/search/`

directory therefore remains subject to architectural consolidation and is not automatically a second canonical search system.

---

## 8. Recommendation Boundary

Recommendations are an AI capability.

The repository contains planned recommendation responsibilities including:

- business recommendations
- job recommendations
- property recommendations
- recommendation engine

Recommendation logic should ultimately consume the canonical AI foundation.

It must not create an independent AI platform.

The currently empty:

`src/core/recommendations/`

directory is therefore classified as **planned** until implementation ownership is formally established.

No implementation should be added there merely because the directory exists.

---

## 9. Agent Architecture

Specialized agents may exist for domain-specific tasks.

Examples include:

- Business Agent
- Finance Agent
- Government Agent
- Housing Agent
- Marketplace Agent

Agents are specialized consumers of the canonical AI foundation.

They are not independent AI operating systems.

---

## 10. Domain AI

Domain modules may expose AI-powered features.

Examples include:

- business intelligence
- booking assistance
- job recommendations
- customer support
- analytics
- moderation
- security

These capabilities should consume shared AI services and orchestration rather than implementing competing platform-wide AI foundations.

---

## 11. AI Memory

AI memory is a platform capability.

The repository contains planned memory components including:

- MemoryEngine
- MemoryStore
- MemoryPolicy
- MemoryPermissions

Memory must respect:

- user consent
- privacy
- authorization
- data minimization
- security

Memory must not be implemented as unrestricted access to all user or business data.

---

## 12. AI Ethics and Governance

AI capabilities must operate under the platform's security and privacy principles.

The architecture anticipates dedicated responsibilities for:

- bias checking
- consent
- privacy
- transparency
- ethics

These capabilities should support the canonical AI architecture rather than becoming independent AI systems.

---

## 13. AI Provider Boundary

External AI providers must be accessed through controlled provider abstractions.

Application code should not become tightly coupled to individual AI providers.

Provider credentials must not be exposed to browser code.

Server-side credentials must remain within appropriate secure infrastructure.

---

## 14. Consolidation Rule

Before creating any new AI implementation:

1. Search `src/core/ai/`.
2. Search `src/core/ECOS Brain/`.
3. Search `src/core/search/`.
4. Search existing AI services and agents.
5. Determine whether the capability already exists.
6. Extend the appropriate owner when possible.
7. Record a new ADR if a new architectural boundary is genuinely required.

---

## 15. Placeholder Rule

The existence of an AI file or directory does not mean that the capability is implemented.

Empty AI files remain classified as:

- Planned
- Future
- Placeholder
- Legacy
- To Be Implemented

They must not be populated automatically.

---

## 16. Consequences

### Positive

- Prevents competing AI foundations.
- Provides a clear path for future AI expansion.
- Allows specialized agents without fragmenting the platform.
- Allows recommendations, search, business intelligence, and other AI features to share infrastructure.
- Supports the ECOS vision.
- Reduces duplicated orchestration and provider logic.

### Negative

- Existing AI directories will require consolidation.
- Some existing code may need to be relocated or deprecated.
- Architectural decisions must precede large-scale AI implementation.
- Some planned features will remain placeholders until their ownership is established.

---

## 17. Current Status

AI architecture is established conceptually but implementation consolidation is incomplete.

The immediate priority is therefore:

1. Preserve working AI implementations.
2. Identify canonical ownership.
3. Avoid creating parallel AI foundations.
4. Consolidate duplicated responsibilities gradually.
5. Implement capabilities only after ownership is established.

---

## 18. Final Principle

Everyday Connect should evolve toward:

**One AI Foundation -> Shared Intelligence -> Specialized Agents -> Domain Capabilities -> User Value**

rather than:

**Many AI Systems -> Duplicated Logic -> Conflicting Intelligence**

---

**Everyday Connect — Making Daily Life Worth Living.**
