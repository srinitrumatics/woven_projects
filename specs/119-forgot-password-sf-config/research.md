# Phase 0 Research: Forgot Password Uses Org Salesforce Config, Not .env

## Current behavior (baseline)

- `app/api/auth/forgot-password/route.ts:16` and `app/api/auth/reset-password/route.ts:33` call `salesforceForgotPassword` / `salesforceResetPassword` in `lib/salesforce-auth.ts`.
- Both of those (`lib/salesforce-auth.ts:14`, `:65`) call `getSalesforceSession()` (`lib/salesforce-service.ts:77-135`), which:
  1. Calls `getOrgConfig()` (`lib/org-config.ts:11-40`) — resolves the organization by matching the request's `host` header against `organizations.siteUrl`. Throws if no match.
  2. **Catches that throw and warns**, continuing with `orgConfig = null` (`salesforce-service.ts:78-81`).
  3. Resolves each of `tokenUrl`, `clientId`, `clientSecret`, and (later) `instanceUrl` independently as `orgConfig?.field || process.env.SF_FIELD` (`salesforce-service.ts:89-91, 127`).
- Net effect: if the org lookup fails, or the matched org row has any of its four SF connection fields blank, the missing pieces are silently filled in from shared environment variables — potentially a different Salesforce org than the requesting tenant's.
- The two API routes then pass `apiError.message` straight through to the client on failure (`forgot-password/route.ts:24`, `reset-password/route.ts:41`), which would leak internal detail (e.g. `"No organization found for host: ..."`) if that were the thrown error.

## Decision: scope of the fix

**Decision**: Add a new, strict session resolver (`getSalesforceSessionForOrg()`) used *only* by the forgot-password/reset-password code paths, rather than changing `getSalesforceSession()` itself or `getOrgConfig()`.

**Rationale**:
- `getSalesforceSession()` is called transitively by ~60+ other files (orders, products, invoices, shipments, quotes, purchase orders, proposals, inventory, `salesforceLogin`, etc. — see spec research). Changing its fallback behavior globally would affect all of them, which is out of scope per the spec's Assumptions and would risk breaking the documented mock-data-fallback behavior (Constitution Principle I: "Services MUST fall back to mock data automatically when Salesforce credentials are absent").
- The spec's User Story 1/2 and FR-001–FR-003 scope the requirement specifically to forgot-password/reset-password.
- A separate function keeps the change fully additive and localized: zero risk of accidentally weakening the fallback for every other Salesforce-calling feature in the app.

**Alternatives considered**:
- *Remove the `.env` fallback from `getSalesforceSession()` globally.* Rejected — breaks login and every other SF-backed feature that currently relies on the fallback (e.g. local/dev environments without a per-org DB row configured), contradicting Constitution Principle I and the spec's explicit Assumption that other flows are unaffected.
- *Add a `strict: boolean` parameter to the existing `getSalesforceSession(strict = false)`.* Considered — functionally equivalent, but a shared function with a silent default risks a future caller flipping (or omitting) the flag incorrectly. A distinctly-named function makes the two call sites' intent unambiguous at the call site and in code review.
- *Resolve the organization from the submitted email instead of the request host.* Rejected — no such lookup exists anywhere in the codebase today (organizations aren't keyed by user email), and introducing one is out of scope per the spec's Assumptions (reuse the existing host-based resolution mechanism).

## Decision: what counts as "no usable org config"

**Decision**: In the strict resolver, "usable" means the resolved `organizations` row has all four SF connection fields non-empty: `salesforceUrl`, `salesforceAuthUrl`, `clientId`, `clientSecret`. If `getOrgConfig()` throws (no matching org for host) OR any of those four fields is null/empty, the strict resolver throws a dedicated `OrgSalesforceConfigError` — no per-field fallback to `process.env`.

**Rationale**: Matches spec Edge Case ("organization record exists but its Salesforce credential fields are only partially filled in... treated the same as no configuration found") and FR-003.

## Decision: error surfacing at the API layer

**Decision**: The two API routes distinguish `OrgSalesforceConfigError` from other thrown errors:
- `OrgSalesforceConfigError` → fixed generic message (e.g. `"Unable to process your request right now. Please contact support."`), HTTP 503, and a `console.error` with the real cause for operator diagnosis.
- Any other error (e.g. a genuine "invalid verification code" or "email not found" response from the SF Apex endpoint) → unchanged behavior, real `apiError.message` still surfaced, since that's normal user-facing validation feedback, not a configuration failure.

**Rationale**: FR-004 requires a "generic, non-revealing error" specifically for the *no organization configuration* case (SC-002), while FR-005 requires no behavior change for already-working organizations, which includes their legitimate error messages (wrong code, unknown email, etc.).

## Decision: caching

**Decision**: Reuse the existing `sfSessionCache` (`salesforce-service.ts:69`), keyed by `orgConfig.id`. No new cache is introduced.

**Rationale**: The strict resolver always has a concrete `orgConfig.id` by the time it would cache (it throws before that point otherwise), so there's no risk of the `'env-fallback'` cache key ever being used or of collisions between orgs — the existing per-org keying already satisfies Constitution Principle IV ("credentials MUST NOT be... cached globally without org-keyed invalidation").

## Open questions

None — all unknowns from the Technical Context are resolved above; no `NEEDS CLARIFICATION` markers remain.
