# Everyday Connect Architecture Constitution

**Status:** Foundation / Canonical

This document defines the architectural rules for Everyday Connect.

## Core Principles

1. Save Time
2. Help People Earn Money
3. Increase Trust
4. Improve Daily Life
5. Privacy by Default
6. Security by Design

## Architecture

Everyday Connect is organized around:

- Platform
- ECOS
- ECOS Kernel
- ECOS Brain
- Core
- Modules
- Services
- Repositories
- Infrastructure

## Canonical Systems

Search:
`src/core/search/`

ECOS Brain:
`src/core/ECOS Brain/`

ECOS Kernel:
`src/core/ECOS Kernel/`

Platform:
`src/platform/`

Supabase:
`src/lib/supabase.ts`

Web Search:
`supabase/functions/ecos-web-search/`

## Architectural Rule

Before creating a new system, determine whether an existing implementation already owns the responsibility.

Do not create duplicate systems without an explicit Architecture Decision Record.

## Placeholder Rule

A file existing in the repository does not mean that its capability is implemented.

Files may be:

- Implemented
- Partial
- Planned
- Future
- Legacy
- Placeholder

## Security Rule

Private API keys and service-role credentials must never be exposed to browser code.

## Documentation Rule

Major architectural changes must be documented in the appropriate `docs` section and important architectural decisions should be recorded in `docs/05-ADR/`.

## Current Status

The project contains both working implementations and architectural placeholders.

The goal of the foundation phase is to consolidate the architecture before expanding functionality.

**Everyday Connect — Making Daily Life Worth Living.**
