# ADR-005: Identity, Authorization, Module Access, and Transaction Model

**Status:** Accepted
**Date:** 2026-09-01

## 1. Decision

Everyday Connect will separate user identity, user type, module access, permissions, business relationship, transaction authority, payment state, and settlement authority.

Authorization will not be determined solely by a user's global role.

## 2. Platform Founder

The Everyday Connect Founder is the platform-level authority responsible for the overall platform.

The Founder may:

- approve registered businesses
- grant business access
- revoke or suspend business access
- manage platform-level users
- oversee platform configuration
- manage platform-level authorization
- intervene in disputes
- oversee transaction and settlement controls

The Founder is represented by the ounder platform role.

## 3. Business Users

People registering businesses on Everyday Connect are business users.

A business user does not automatically receive unrestricted platform access.

Business access depends on:

- registered business
- business type
- selected business profile
- payment or subscription status
- Founder approval
- assigned permissions
- applicable module access

The usiness_owner role represents an approved owner/operator of a registered business.

## 4. Additional Business Roles

Business organizations may contain additional roles including:

- manager
- employee

Their access is constrained by the business to which they belong and by the permissions assigned to their role.

## 5. Customer Access

Customers may access customer-facing modules without requiring administrative permission for ordinary activities.

Examples include:

- searching for services
- booking hotel rooms
- booking car wash services
- requesting cleaning services
- purchasing eligible goods or property

Normal customer activity does not require the customer to possess an administrative permission.

## 6. Government Access

Government users may receive government-specific access according to the platform's authorization rules.

The government role represents this user category.

## 7. Module Access

Module access is separate from global user role.

A user may have access to one module without automatically receiving access to every module.

Examples include:

- hotel
- car wash
- cleaning
- property
- marketplace
- rentals
- other Everyday Connect modules

A business user's module access is determined by the business registration, business type, selected profile, payment/subscription state, Founder approval, and applicable permissions.

## 8. Permission Model

Permissions describe actions a user is authorized to perform.

Permissions must not be confused with module access or transaction state.

Examples include:

- reading business information
- managing business information
- managing employees
- validating a business transaction
- administering a platform function

The existing PermissionService provides the initial permission foundation.

## 9. Business Relationship

Business permissions must be scoped to the business relationship where applicable.

A business owner, manager, or employee should not automatically receive authority over unrelated businesses.

Business-scoped authorization must verify the relevant business relationship.

## 10. Transaction Authorization

Transaction authorization is separate from ordinary module authorization.

A user being allowed to access a module does not automatically grant authority to approve, settle, refund, or otherwise control money.

Transaction actions must consider:

- user identity
- user type
- business relationship
- module
- transaction state
- payment state
- applicable permissions
- required confirmations
- dispute state

## 11. Payment Hold

Where Everyday Connect facilitates a transaction requiring protected settlement, funds may be held by the platform/payment system until the applicable transaction conditions are satisfied.

The initial conceptual flow is:

INITIATED
→ PAYMENT_PENDING
→ PAYMENT_RECEIVED
→ FUNDS_HELD
→ PROVIDER_VALIDATED
→ SERVICE_OR_PRODUCT_DELIVERED
→ CUSTOMER_APPROVED
→ READY_FOR_SETTLEMENT
→ SETTLED

Alternative states may include:

- CANCELLED
- REFUNDED
- DISPUTED
- UNDER_REVIEW
- RESOLVED

Exact payment implementation will be defined separately and must comply with applicable payment-provider and legal requirements.

## 12. Provider Validation

For applicable bookings and services, the provider/business may validate or accept a transaction after payment has been received or held.

Examples include:

- hotel owner validating a hotel booking
- car wash owner validating a booking
- cleaning-service provider accepting a service request

Provider validation does not by itself constitute final settlement authority.

## 13. Customer Confirmation

For applicable transactions, the customer may confirm that the service or product has been delivered.

Customer confirmation is one of the conditions that may make a transaction eligible for settlement.

## 14. Settlement

Settlement occurs only when the applicable transaction conditions have been satisfied.

The platform must not equate:

payment received

with:

provider entitled to settlement.

The transaction engine must evaluate the complete transaction state.

## 15. Disputes

A customer or provider may enter a transaction into a dispute state where appropriate.

A disputed transaction must not automatically proceed to settlement until the dispute process has been resolved according to the applicable rules.

## 16. Property Transactions

Property transactions may require additional verification and closing conditions.

Property transactions must not automatically use the same final approval logic as ordinary service bookings.

Additional requirements may include:

- property verification
- seller verification
- documentation
- transaction/closing verification
- required approvals

## 17. Architectural Separation

Everyday Connect will maintain the following conceptual separation:

Identity
→ User Type / Role
→ Module Access
→ Permission
→ Business Relationship
→ Transaction Authorization
→ Payment State
→ Settlement

No single role field should attempt to represent all of these concepts.

## 18. Authentication

Supabase authentication remains the current authentication mechanism.

The existing working authentication implementation in src/core/auth remains the active authentication layer while the canonical identity and authorization architecture is integrated incrementally.

The identity/authorization layer must not replace the working authentication system without an explicit migration decision.

## 19. Legacy Compatibility

Existing values such as usiness may represent business entities, registration modes, search/map categories, database tables, or other non-role concepts.

They must not be globally renamed to usiness_owner.

Role migration must distinguish user roles from business entities and module/domain values.

## 20. Implementation Principle

Implementation will proceed incrementally.

No existing authentication, business registration, booking, search, map, or payment-related functionality will be removed solely because a newer architectural model exists.

Each migration must first establish:

1. current consumers
2. current data shape
3. compatibility requirements
4. replacement implementation
5. verification
6. migration
7. cleanup

## 21. Final Principle

Everyday Connect authorization is contextual.

A user's authority is determined by who they are, what module they are using, what business they are associated with, what they registered for, what access the Founder has granted, what permissions they possess, and the state of the transaction involved.

Authentication identifies the user.

Authorization determines what the user may do.

Transaction authorization determines what the user may do with a particular transaction.

Payment state determines where the money is in the transaction lifecycle.

Settlement occurs only after the applicable conditions have been satisfied.

These concerns must remain architecturally distinct.
