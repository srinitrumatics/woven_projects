# Feature Specification: Forgot Password Uses Org Salesforce Config, Not .env

**Feature Branch**: `119-forgot-password-sf-config`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "when forgot password use salesfroce config from table instead of .env"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Password reset uses the requesting tenant's Salesforce org (Priority: P1)

A Client or Partner user on Organization A's portal domain requests a password reset. The system must authenticate to *Organization A's* Salesforce org — using the connection credentials stored on that organization's record — to send the reset code and complete the reset. It must never silently substitute a different Salesforce org's credentials (e.g. a shared/global fallback) to service the request.

**Why this priority**: This is the entire feature — using the wrong Salesforce org for a tenant's password reset can send the reset code through the wrong org, fail to find the user, or (in a misconfigured shared-credential scenario) leak tenant boundaries. This is a correctness and multi-tenant isolation requirement, not a nice-to-have.

**Independent Test**: Configure two organizations with distinct Salesforce connection credentials on their org records. Submit "forgot password" from each organization's portal domain and confirm each request is authenticated against its own org's Salesforce credentials (verifiable via request logs / distinct instance URLs), with no cross-over.

**Acceptance Scenarios**:

1. **Given** a request arrives on a domain that matches an organization with Salesforce connection credentials stored on its record, **When** a user submits "forgot password", **Then** the system authenticates to Salesforce using that organization's stored credentials.
2. **Given** a request arrives on a domain that matches an organization with Salesforce connection credentials stored on its record, **When** a user submits the reset code and new password, **Then** the system completes the reset using that same organization's stored credentials.
3. **Given** two different organizations each with their own distinct Salesforce credentials, **When** users on each organization's domain independently request a password reset, **Then** each request is serviced against its own organization's Salesforce org, never the other's.

---

### User Story 2 - Clear failure when no organization configuration is found (Priority: P2)

If the requesting domain doesn't match any configured organization (e.g. a misconfigured or unrecognized host), the forgot-password request must fail with a clear, generic error rather than silently falling back to shared environment-variable credentials, which could point at the wrong Salesforce org entirely.

**Why this priority**: Without this, a configuration gap for one tenant is currently masked by a global fallback — the request "succeeds" against the wrong org instead of surfacing the misconfiguration. Fixing User Story 1 without this would leave the unsafe fallback path in place for any host that doesn't resolve to an org.

**Independent Test**: Submit "forgot password" from a domain with no matching organization record and confirm the request is rejected with a clear error, and confirm (via logs) that no environment-variable Salesforce credentials were used to attempt the call.

**Acceptance Scenarios**:

1. **Given** the requesting domain does not match any organization record, **When** a user submits "forgot password", **Then** the system returns a generic, user-safe error (not exposing internal configuration detail) and does not attempt the request against fallback environment-variable credentials.
2. **Given** the requesting domain does not match any organization record, **When** the failure occurs, **Then** the system logs the specific cause (no matching org for host) for operator diagnosis.

---

### Edge Cases

- What happens when an organization record exists for the requesting domain but its Salesforce credential fields are only partially filled in (e.g. client ID present, client secret blank)? → Treated the same as "no configuration found" (Story 2): reject with a generic error, log the specific cause.
- What happens if the same physical domain is intentionally shared across multiple organizations? → Out of scope for this feature; org resolution continues to rely on the existing one-organization-per-domain lookup used elsewhere in the app.
- What happens to the existing **login** flow, which resolves Salesforce credentials the same way? → Unchanged by this feature; only the forgot-password and reset-password requests are required to drop the environment-variable fallback (see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a user submits a "forgot password" request, the system MUST resolve Salesforce connection credentials from the requesting organization's stored configuration record, not from shared environment variables.
- **FR-002**: When a user submits a password reset (code + new password), the system MUST use the same organization-resolved Salesforce credentials as the originating "forgot password" request's organization.
- **FR-003**: If no organization configuration can be resolved for the request (or the resolved organization's Salesforce credential fields are incomplete), the system MUST NOT fall back to environment-variable Salesforce credentials for the forgot-password or reset-password requests.
- **FR-004**: If no usable organization Salesforce configuration is found, the system MUST return a generic, non-revealing error response to the user and MUST log the specific reason internally for diagnosis.
- **FR-005**: The change MUST NOT alter the user-visible behavior of the forgot-password/reset-password flow for any organization that already has complete, correctly-matched Salesforce configuration on its organization record.

### Key Entities *(include if feature involves data)*

- **Organization**: Represents a tenant; holds the Salesforce connection configuration (org URL, auth URL, client credentials) used to service that tenant's requests, including forgot-password/reset-password.
- **Password Reset Request**: The transient forgot-password / reset-password action initiated by a user, scoped to exactly one organization for its entire lifecycle (request code → submit code + new password).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of forgot-password and reset-password requests are serviced using the requesting organization's own stored Salesforce configuration when that configuration is complete — zero requests fall back to shared environment-variable credentials in that case.
- **SC-002**: 100% of forgot-password/reset-password requests for organizations with missing or incomplete Salesforce configuration receive a clear rejection instead of being serviced against an unrelated (fallback) Salesforce org.
- **SC-003**: Operators can identify, from logs alone, every case where a forgot-password/reset-password request was rejected due to missing organization Salesforce configuration, without needing to reproduce the request.

## Assumptions

- "Forgot password" in the request scope covers both steps of the existing flow: the initial reset-code request and the subsequent code+new-password submission (`app/api/auth/forgot-password` and `app/api/auth/reset-password`) — both must resolve credentials the same way since they represent one user journey.
- The existing **login** flow and all other Salesforce-calling features (orders, products, invoices, etc.) are out of scope for this feature and keep their current environment-variable fallback behavior; only forgot-password/reset-password are being tightened. If the underlying credential-resolution helper is shared across features, the fallback-removal will be applied narrowly (e.g. a strict variant or an explicit flag) so other flows are unaffected.
- Organization-to-request matching continues to use the existing mechanism already in place elsewhere in the app (matching the request's host against an organization record) — this feature does not introduce a new way to determine which organization a request belongs to.
- Credential-field encryption/storage hardening for the `organizations` table (e.g. encrypting the stored client secret) is out of scope for this feature.
- "Environment-variable fallback" refers to the existing global Salesforce credentials sourced from process environment variables that currently serve as a last resort when no organization-specific configuration is found.
