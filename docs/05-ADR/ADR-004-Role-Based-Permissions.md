# ADR-004: Role-Based Permissions

**Status:** Accepted  
**Date:** 2026-08-31  
**Project:** Everyday Connect

---

## 1. Decision

Everyday Connect will use a centralized role-based permission architecture for authorization.

Authorization will be treated as a platform-level capability and will operate against the canonical Everyday Connect identity.

The architecture will favor:

**one identity -> defined roles -> defined permissions -> controlled authorization decisions**

rather than allowing individual modules to create independent role and permission systems.

The current permission-model candidate is:

`src/core/identity/PermissionService.ts`

This file already contains the existing role-to-permission mapping and should be treated as the current foundation to be evaluated and consolidated.

---

## 2. Problem

The repository contains authorization-related files and placeholders in multiple locations.

These include:

- `src/core/auth/permissions.ts`
- `src/core/auth/roles.ts`
- `src/core/identity/AuthorizationService.ts`
- `src/core/identity/PermissionService.ts`
- `src/core/identity/RoleService.ts`
- `src/lib/permissions.ts`
- `src/core/errors/PermissionError.ts`

Some of these files are empty placeholders.

Without an explicit ownership decision, different modules could eventually implement incompatible authorization rules.

Everyday Connect therefore requires one clear authorization boundary.

---

## 3. Authorization Boundary

Authorization determines whether an authenticated platform identity is permitted to perform a requested action.

Authorization answers:

**"Is this identity allowed to perform this action?"**

Authentication answers:

**"Can this user prove control of an account?"**

Identity answers:

**"Which platform identity does this authenticated account represent?"**

These responsibilities must remain distinct.

Authorization must consume the canonical identity and applicable role/permission information.

---

## 4. Canonical Identity Relationship

ADR-003 establishes Identity as a platform-level capability.

ADR-004 therefore depends on the canonical identity model established by ADR-003.

The authorization flow should conceptually follow:

```text
Authenticated Account
        |
        v
Canonical Identity
        |
        v
Assigned Role
        |
        v
Permission Evaluation
        |
        v
Authorization Decision
        |
        v
Allow / Deny
```

Authorization decisions must be based on the canonical identity and its applicable authorization context.

---

## 5. Role-Based Authorization Model

Everyday Connect will use roles as a structured mechanism for grouping permissions.

The current role model defined in `src/core/identity/types.ts` contains:

- `founder`
- `admin`
- `business_owner`
- `manager`
- `employee`
- `customer`
- `government`

Roles provide a high-level authorization classification.

Permissions provide the specific capabilities associated with those roles.

The architecture therefore distinguishes:

```text
Identity
   |
   v
Role
   |
   v
Permissions
   |
   v
Authorization Decision
```

A module must not invent a new role model for its own internal convenience when an existing platform role is applicable.

---

## 6. Current Permission Mapping

The existing `PermissionService` contains the following role-to-permission mapping.

### Founder

The founder currently has:

`*`

This represents unrestricted permission within the current model.

### Admin

The current permissions are:

- `users.read`
- `users.write`
- `business.read`
- `business.write`

### Business Owner

The current permissions are:

- `business.read`
- `business.write`
- `employees.read`
- `employees.write`

### Manager

The current permissions are:

- `employees.read`
- `employees.write`

### Employee

The current permission is:

- `employees.read`

### Customer

The current permission set is empty.

### Government

The current permissions are:

- `government.read`
- `government.write`

This mapping is an existing implementation baseline, not a declaration that the final production permission catalog is complete.

---

## 7. Permission Ownership

The current canonical permission-model candidate is:

`src/core/identity/PermissionService.ts`

Permission ownership should remain centralized.

The permission system is responsible for determining whether a role possesses a named permission.

Individual domain modules may request authorization decisions but should not maintain independent copies of the platform-wide role-to-permission mapping.

---

## 8. Role Ownership

The current role definitions are located in:

`src/core/identity/types.ts`

The role model should remain associated with the canonical identity architecture.

Role-related helper behavior currently exists in:

`src/core/identity/RoleService.ts`

RoleService may provide role classification helpers, but it should not become a second role database or independent authorization authority.

---

## 9. Authorization Service

The repository currently contains:

`src/core/identity/AuthorizationService.ts`

The current implementation maintains an `ECOSUser` reference and provides:

- login
- logout
- current-user access
- authentication-state checking

This implementation should be treated as part of the authorization/identity consolidation effort.

It must not create a competing authorization authority separate from `PermissionService`.

AuthorizationService should ultimately coordinate authorization decisions using:

- canonical identity
- assigned role
- permissions
- session context
- applicable security policy

---

## 10. Authentication Separation

Authentication remains the responsibility of the existing authentication architecture.

The primary working authentication implementation is:

`src/core/auth/AuthenticationService.ts`

It uses Supabase authentication.

ADR-004 does not replace the authentication system.

The responsibility boundary remains:

```text
Authentication
    |
    v
Prove account control
    |
    v
Identity
    |
    v
Determine platform identity
    |
    v
Authorization
    |
    v
Evaluate permissions
```

Authentication and authorization must not be merged into a single uncontrolled mechanism.

---

## 11. Protected Routes

The repository contains:

`src/core/auth/ProtectedRoute.tsx`

ProtectedRoute currently checks whether an authenticated user exists before allowing access to protected UI.

This is an authentication gate.

It should not be confused with complete authorization.

Future protected UI requiring specific permissions should perform an authorization check in addition to checking authentication.

Conceptually:

```text
Protected Route
       |
       +---- Authenticated?
       |
       +---- Authorized?
       |
       v
     Access
```

---

## 12. Empty Authorization Placeholders

The following files are currently empty placeholders:

`src/core/auth/permissions.ts`

`src/core/auth/roles.ts`

`src/core/auth/authGuard.ts`

`src/lib/permissions.ts`

`src/core/errors/PermissionError.ts`

Their existence does not establish them as competing authorization authorities.

They should remain placeholders until their ownership and implementation requirements are explicitly determined.

No duplicate permission system should be created merely by filling these files.

---

## 13. Module Authorization

Domain modules must consume the platform authorization capability.

A module may ask:

```text
Can this identity perform X?
```

It should not independently redefine:

```text
What does an admin mean?
What does an employee mean?
What does a founder mean?
```

unless a future ADR explicitly establishes a domain-specific authorization boundary.

---

## 14. Domain Permissions

Permissions should describe capabilities rather than UI locations.

Examples include:

- `users.read`
- `users.write`
- `business.read`
- `business.write`
- `employees.read`
- `employees.write`
- `government.read`
- `government.write`

The permission naming convention should remain predictable and extensible.

Domain-specific permissions may be added when genuinely required.

New permissions should be documented and assigned deliberately rather than created ad hoc inside UI components.

---

## 15. Least Privilege

Everyday Connect authorization should follow the principle of least privilege.

An identity should receive only the permissions necessary for its legitimate responsibilities.

The existence of a role does not automatically justify access to every domain.

Authorization must therefore evaluate the requested capability rather than relying solely on a broad UI role check.

---

## 16. Founder Authority

The current implementation gives the `founder` role the wildcard permission:

`*`

This is the current architectural baseline.

Any future restriction or refinement of founder authority must be handled deliberately and should be documented through the appropriate architecture or security decision.

The wildcard must not be silently copied to other roles.

---

## 17. Admin Authority

The current `admin` role has user and business permissions.

Its current permission set is limited to:

- `users.read`
- `users.write`
- `business.read`
- `business.write`

Additional administrative capabilities should not be assumed merely because the role is named `admin`.

Permissions should be explicitly granted.

---

## 18. Business Ownership

The `business_owner` role currently has:

- `business.read`
- `business.write`
- `employees.read`
- `employees.write`

Business ownership authorization must still respect the relationship between the identity and the specific business record being accessed.

Having a business-owner role does not automatically imply unrestricted access to every business on the platform.

Record-level authorization may therefore be required in addition to role-level authorization.

---

## 19. Manager and Employee Access

The current manager role provides:

- `employees.read`
- `employees.write`

The current employee role provides:

- `employees.read`

These permissions describe capability categories.

Actual access should additionally respect the applicable domain relationship and security rules.

For example, a manager's ability to manage employees should not automatically grant access to unrelated private records outside the manager's legitimate scope.

---

## 20. Customer Access

The current customer role has no permissions in the existing mapping.

This does not mean customers can never perform actions.

Customer capabilities may be introduced through explicitly defined permissions as the platform domains mature.

Until such permissions are defined, modules must not silently assume unrestricted customer access.

---

## 21. Government Access

The current government role has:

- `government.read`
- `government.write`

Government access must remain subject to applicable platform security, privacy, authorization, and domain policies.

A government role does not automatically grant access to unrelated private user information.

---

## 22. Permission Evaluation

Permission evaluation should be centralized.

The current implementation is:

`PermissionService.hasPermission(role, permission)`

The architectural direction is:

```text
Identity
   |
   v
Role
   |
   v
PermissionService
   |
   v
hasPermission()
   |
   v
Allow / Deny
```

Permission checks should not be scattered as duplicated role-specific logic throughout the application.

---

## 23. Authorization Context

A permission check may eventually require more than a role.

Relevant context may include:

- identity
- role
- requested permission
- target resource
- ownership
- organizational relationship
- session
- security policy
- privacy restrictions

Therefore the simple role-to-permission mapping is the foundation, while richer contextual authorization may be introduced as domain requirements mature.

---

## 24. Record-Level Authorization

Role-based permission checks are not always sufficient.

For example:

```text
business.write
```

may indicate that a role can modify business records, but it does not necessarily mean that the role can modify every business record.

The authorization architecture must therefore allow future resource-level checks.

Conceptually:

```text
Role Permission
      +
Resource Relationship
      +
Security Policy
      |
      v
Authorization Decision
```

---

## 25. Client-Side Authorization

Client-side authorization is useful for user experience.

Examples include:

- hiding unavailable actions
- disabling controls
- preventing navigation to unavailable features
- displaying appropriate messages

However, client-side checks must not be treated as the ultimate security boundary.

The backend and database security model must independently enforce protected operations.

---

## 26. Supabase and Database Security

Everyday Connect uses Supabase infrastructure.

Authorization-sensitive data operations must ultimately be protected at the appropriate backend/database boundary.

Frontend permission checks are not sufficient protection for sensitive records.

The architecture should therefore maintain a distinction between:

```text
UI Permission Check
        |
        v
User Experience

Backend / Database Enforcement
        |
        v
Security Boundary
```

---

## 27. AI Authorization

ADR-005 establishes AI as a platform-level capability.

AI systems must not bypass authorization.

An AI capability requesting identity, business, employment, marketplace, property, vehicle, or other protected information must operate within the applicable authorization and privacy boundaries.

AI access must be:

- purpose-limited
- authorized
- privacy-aware
- auditable where required
- consistent with user permissions

AI availability does not imply unrestricted data access.

---

## 28. Identity Relationship

ADR-003 establishes the canonical identity boundary.

ADR-004 consumes that identity.

Therefore:

```text
Authentication
      |
      v
Canonical Identity
      |
      v
Role
      |
      v
Permissions
      |
      v
Authorization
```

No module should create an alternative platform-wide identity solely to implement authorization.

---

## 29. Session Relationship

Authorization decisions may depend on session context.

The current session-related implementation exists in:

`src/core/identity/SessionService.ts`

The session must represent authenticated context.

It must not become a replacement for the canonical identity.

Session state should be validated and used only within the appropriate security boundary.

---

## 30. Role Assignment

Role assignment must be treated as a controlled operation.

A client-side component must not be allowed to grant itself an elevated role merely by modifying local state.

Role assignment should ultimately be controlled by trusted application/backend mechanisms and protected by appropriate authorization.

The role stored or resolved for an identity must have an authoritative source.

---

## 31. Privilege Escalation Protection

The authorization architecture must prevent unauthorized privilege escalation.

Examples of prohibited behavior include:

- changing one's own role through uncontrolled client state
- assigning oneself `founder`
- granting oneself wildcard permissions
- bypassing authorization through direct UI manipulation
- trusting client-supplied role values without validation

Security-sensitive role changes require appropriate trusted enforcement.

---

## 32. Permission Naming

Permissions should follow a consistent structure.

The current convention is:

```text
resource.action
```

Examples:

```text
users.read
users.write
business.read
business.write
employees.read
employees.write
government.read
government.write
```

This convention should be retained unless a future ADR establishes a better model.

---

## 33. Permission Expansion

New permissions should be introduced when a real authorization requirement exists.

Before creating a new permission:

1. Search the existing permission model.
2. Determine whether an existing permission already covers the capability.
3. Determine whether resource-level restrictions are sufficient.
4. Determine the appropriate role assignments.
5. Add the permission deliberately.
6. Update documentation where necessary.
7. Test both allowed and denied cases.

---

## 34. Deny by Default

Authorization should favor deny-by-default behavior.

If a role does not explicitly possess a permission, the expected result should be denial.

Conceptually:

```text
Permission exists for role?
        |
   +----+----+
   |         |
  YES        NO
   |         |
 ALLOW      DENY
```

The founder wildcard is an explicit exception represented in the current permission model.

---

## 35. Error Handling

The repository contains:

`src/core/errors/PermissionError.ts`

This is currently an empty placeholder.

Future authorization failures may use a dedicated permission error where appropriate.

Error handling must not expose sensitive security information to unauthorized clients.

Authorization failures should produce predictable application behavior without revealing internal security configuration.

---

## 36. Auditability

Security-sensitive authorization operations should be auditable where required.

Potential audit events include:

- role assignment
- role removal
- permission changes
- privileged access
- administrative actions
- sensitive identity access
- security-policy changes

The exact audit implementation is outside the scope of this ADR unless a future ADR establishes it.

---

## 37. Privacy

Authorization and privacy are closely related.

A technically valid role does not automatically eliminate privacy restrictions.

Access to personal information, documents, employment records, properties, vehicles, or other sensitive information must respect:

- authorization
- purpose
- privacy requirements
- applicable consent
- data minimization
- security policy

---

## 38. No Independent Module Roles

Modules must not create competing platform roles.

For example, a marketplace module should not independently create another definition of:

```text
admin
employee
customer
```

when the platform role model already defines those concepts.

If a domain genuinely requires a new role, the architectural implications should be evaluated before introducing it.

---

## 39. No Independent Module Permissions

Modules must not create isolated permission maps that contradict the canonical permission model.

For example, a module should not contain:

```text
admin = everything
```

while the canonical authorization model grants the admin role only specific permissions.

Such duplication creates inconsistent security behavior.

---

## 40. Authorization API Direction

The long-term authorization API should allow application code to express capability checks clearly.

A conceptual interface may eventually resemble:

```text
authorize(identity, permission, resource)
```

or:

```text
can(identity, permission, resource)
```

The exact implementation is intentionally not fixed by this ADR.

The architectural requirement is that authorization remain centralized and consistent.

---

## 41. UI Integration

UI components may consume authorization results.

For example:

```text
if can("business.write")
    show Edit Business
```

However, UI logic must not become the source of truth for authorization.

The UI represents authorization state for user experience.

Security enforcement remains outside the presentation layer.

---

## 42. Service Integration

Application services may request authorization before performing sensitive operations.

The service layer should coordinate:

```text
Identity
   +
Permission
   +
Resource
   |
   v
Authorization Decision
   |
   v
Domain Operation
```

Authorization should occur before protected operations are executed.

---

## 43. Repository Integration

Repositories are responsible for persistence operations.

Repositories should not independently redefine platform roles.

Where security enforcement belongs at the database or infrastructure boundary, the repository should operate within those controls rather than bypassing them.

---

## 44. Infrastructure Integration

Infrastructure adapters must not expose privileged credentials to browser code.

Authorization-sensitive infrastructure operations should occur through appropriate trusted boundaries.

Supabase access should follow the project's established security model.

---

## 45. Testing Requirements

Authorization implementation should eventually include tests for:

- permitted role/permission combinations
- denied role/permission combinations
- wildcard permissions
- unknown permissions
- unknown roles
- resource ownership
- role assignment
- privilege escalation attempts
- protected service operations
- AI access to protected data

Both positive and negative authorization paths are important.

---

## 46. Unknown Permissions

An unknown permission should not automatically grant access.

The safe default is denial.

This prevents accidental privilege creation through misspelled or undefined permission names.

---

## 47. Unknown Roles

An unknown role should not automatically receive access.

The safe default is denial.

Role values must come from the canonical identity model or another explicitly trusted source.

---

## 48. Migration Rule

Existing authorization-related implementations must be consolidated incrementally.

Migration should follow:

```text
Existing Code
     |
     v
Identify Responsibility
     |
     v
Compare with Canonical Model
     |
     v
Reuse / Adapt / Move
     |
     v
Remove Duplication
```

Working authentication must be preserved while authorization ownership is consolidated.

---

## 49. Placeholder Rule

The existence of files such as:

- `permissions.ts`
- `roles.ts`
- `PermissionError.ts`

does not mean they should immediately be implemented.

Empty files remain placeholders until their ownership and purpose are established.

No placeholder should be populated merely to make the directory appear complete.

---

## 50. Consolidation Rule

Before implementing new authorization functionality:

1. Search `src/core/identity/`.
2. Search `src/core/auth/`.
3. Search `src/lib/`.
4. Search relevant domain modules.
5. Determine whether the capability already exists.
6. Reuse the canonical authorization capability where possible.
7. Avoid creating another role or permission map.
8. Record an ADR if a genuinely new architectural boundary is required.

---

## 51. Security Principle

Authorization is a security boundary.

Therefore:

**Fail closed.**

When authorization state is uncertain, the system should not assume permission.

Examples include:

- missing role
- invalid role
- unknown permission
- unavailable authorization context
- invalid session
- ambiguous resource ownership

The safe result should be denial unless trusted policy explicitly determines otherwise.

---

## 52. Consequences

### Positive

- Establishes a centralized authorization model.
- Prevents competing role systems.
- Prevents duplicate permission maps.
- Provides a clear relationship between identity, roles, and permissions.
- Supports future resource-level authorization.
- Improves security consistency.
- Provides a foundation for AI authorization.
- Makes authorization easier to audit and evolve.

### Negative

- Existing authorization placeholders will require consolidation decisions.
- Domain modules will need to depend on the canonical authorization model.
- Resource-level authorization will require additional implementation.
- Database-level enforcement must complement client-side checks.
- Role assignment requires trusted infrastructure.

---

## 53. Current Status

The authorization architecture is established conceptually, but implementation consolidation is incomplete.

The immediate priority is:

1. Preserve working authentication.
2. Preserve the canonical identity architecture established by ADR-003.
3. Treat `PermissionService.ts` as the current permission-model candidate.
4. Avoid creating parallel role or permission systems.
5. Keep empty authorization placeholders empty until ownership is clear.
6. Introduce authorization implementation incrementally.
7. Add resource-level enforcement where domain requirements demand it.
8. Ensure sensitive operations are protected at the appropriate trusted boundary.

---

## 54. Relationship to Other ADRs

This decision should be considered together with:

- ADR-002: Modular Architecture
- ADR-003: Identity Module
- ADR-005: AI Operating System

ADR-003 establishes the identity foundation.

ADR-004 establishes authorization against that identity.

ADR-005 establishes AI as a platform capability that must respect identity, authorization, privacy, and security boundaries.

---

## 55. Final Principle

Everyday Connect should evolve toward:

**One Identity -> Defined Roles -> Defined Permissions -> Authorization Decision -> Protected Operation**

rather than:

**Multiple Roles -> Duplicate Permission Maps -> Conflicting Authorization -> Security Gaps**

---

**Everyday Connect — Making Daily Life Worth Living.**
