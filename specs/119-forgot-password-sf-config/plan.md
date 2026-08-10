# Implementation Plan: Forgot Password Uses Org Salesforce Config, Not .env

**Branch**: `wovn_mathu` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/119-forgot-password-sf-config/spec.md`

## Summary

The forgot-password and reset-password flows currently authenticate to Salesforce via `getSalesforceSession()` (`lib/salesforce-service.ts`), which resolves each credential field (`clientId`, `clientSecret`, auth/data URLs) independently as `orgConfig?.field || process.env.FIELD`. This means a per-field gap in an organization's stored config — or a failed org lookup — silently falls through to shared environment-variable credentials, potentially authenticating a tenant's password reset against the wrong Salesforce org. The fix adds a strict, non-fallback session resolver (`getSalesforceSessionForOrg()`) used only by `salesforceForgotPassword` and `salesforceResetPassword` (`lib/salesforce-auth.ts`): it requires a fully-populated organization config (all four SF connection fields present) and throws a distinguishable `OrgSalesforceConfigError` otherwise, with **no** environment-variable fallback. The two API routes (`app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`) catch that specific error and return a fixed, generic message instead of leaking `apiError.message` (as they do today), while logging the real cause server-side. All other Salesforce-calling code paths (login, orders, products, etc.) are untouched — they keep using `getSalesforceSession()` and its existing env fallback.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router)

**Primary Dependencies**: Drizzle ORM (existing `organizations` table, no schema change) — no new dependency

**Storage**: PostgreSQL via Drizzle — reads existing `organizations` columns (`salesforce_url`, `salesforce_auth_url`, `client_id`, `client_secret`); no migration needed

**Testing**: Manual verification per `quickstart.md` (no existing automated test suite covers `lib/salesforce-auth.ts` or the auth API routes — consistent with Constitution Principle V)

**Target Platform**: Web server (Next.js API routes), all supported browsers for the consuming form (`components/ForgotPasswordForm.tsx`) — no UI changes

**Project Type**: Web application (Next.js App Router) — backend-only change confined to `lib/` and `app/api/auth/`

**Performance Goals**: N/A — same number of network calls as today (one org-config lookup, one SF token request); no new latency budget

**Constraints**: Must not change the response shape or messaging for successful requests or for legitimate business-validation failures (e.g. wrong verification code) — only the "no usable org config" failure path changes (spec FR-004, FR-005); must not alter behavior of `getSalesforceSession()` for any other caller (spec Assumptions)

**Scale/Scope**: 4 files touched — `lib/salesforce-service.ts` (new strict resolver + error type), `lib/salesforce-auth.ts` (2 functions switched to it), `app/api/auth/forgot-password/route.ts` and `app/api/auth/reset-password/route.ts` (catch + generic-message mapping). No new files, no schema migration, no new routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — Satisfied: no change to how business data is read; the strict resolver still funnels through `lib/salesforce-service.ts`, the sole SF access point. This feature doesn't touch mock-data fallback behavior for other services.
- **II. RBAC-First Feature Design** — N/A: forgot-password/reset-password are necessarily unauthenticated (pre-session) endpoints today, and remain so; no permission gate applies to either route before or after this change.
- **III. Next.js 15 App Router Patterns** — Satisfied: no route signature, param handling, or auth-cookie logic changes; routes continue to return `NextResponse.json(...)`.
- **IV. Multi-Tenant Isolation** — **This feature directly enforces this principle**: it closes the specific gap where a tenant's forgot-password/reset-password request could silently authenticate against shared/global credentials instead of that tenant's own stored Salesforce config, per "credentials MUST NOT be shared across orgs or cached globally without org-keyed invalidation."
- **V. Simplicity & Phase-Driven Scope** — Satisfied: no shared abstraction beyond one new narrowly-scoped function and one error type; explicitly does not generalize the fallback-removal to `getSalesforceSession()` itself or to other callers, per the spec's Assumptions (avoids speculative scope creep into login/orders/etc.).

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/119-forgot-password-sf-config/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── forgot-password-api.md   # Phase 1 output — request/response contract for the two auth routes
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/
├── salesforce-service.ts   # ADD: OrgSalesforceConfigError class + getSalesforceSessionForOrg()
│                            #      (strict variant of getSalesforceSession(); no env fallback,
│                            #      requires all 4 org SF fields non-empty; reuses existing
│                            #      sfSessionCache keyed by org id)
└── salesforce-auth.ts      # MODIFY: salesforceForgotPassword() and salesforceResetPassword()
                             #      call getSalesforceSessionForOrg() instead of getSalesforceSession()

app/api/auth/
├── forgot-password/route.ts   # MODIFY: catch OrgSalesforceConfigError → fixed generic message
│                                #         (other thrown errors keep surfacing their real message)
└── reset-password/route.ts    # MODIFY: same catch/mapping as above
```

**Structure Decision**: No new files, directories, or shared components beyond one new function + one error class inside the existing `lib/salesforce-service.ts` (which already owns all SF session logic). This mirrors the existing pattern of `invalidateSalesforceSessionCache()` living alongside `getSalesforceSession()` in the same file. The two API routes get a small, symmetric catch-block change each — no new middleware or route.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
