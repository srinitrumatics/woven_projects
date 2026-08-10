---

description: "Task list for Forgot Password Uses Org Salesforce Config, Not .env"

---

# Tasks: Forgot Password Uses Org Salesforce Config, Not .env

**Input**: Design documents from `/specs/119-forgot-password-sf-config/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/forgot-password-api.md, quickstart.md

**Tests**: Not requested in the feature spec — this feature area has no existing automated test suite (Constitution Principle V). Verification is manual, via `quickstart.md`, at the end of each user-story phase and in Polish.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

## Path Conventions

Next.js App Router (this project): `lib/` (services), `app/api/auth/` (API routes). No new files, directories, or migrations for this feature.

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches the plan's assumptions before editing (no new dependencies or scaffolding needed — this is a 4-file, no-new-file change).

- [X] T001 Re-read `lib/salesforce-service.ts` (`getSalesforceSession`, `sfSessionCache`, `SF_TOKEN_TTL_MS`), `lib/salesforce-auth.ts` (`salesforceForgotPassword`, `salesforceResetPassword`), `app/api/auth/forgot-password/route.ts`, and `app/api/auth/reset-password/route.ts` to confirm current line numbers/behavior still match `research.md`'s baseline description before making any edit.

**Checkpoint**: Baseline confirmed — proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The strict, non-fallback session resolver that both user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add an exported `OrgSalesforceConfigError` class to `lib/salesforce-service.ts` (extends `Error`; constructor takes a `reason: string` message describing which check failed, e.g. "no organization found for host" or "organization <id> is missing clientSecret").
- [X] T003 Implement `getSalesforceSessionForOrg()` in `lib/salesforce-service.ts` (after `getSalesforceSession()`, depends on T002): call `getOrgConfig()` directly (do **not** catch-and-warn — let a lookup failure propagate as `OrgSalesforceConfigError`); once resolved, verify `salesforceUrl`, `salesforceAuthUrl`, `clientId`, and `clientSecret` are all non-empty strings, throwing `OrgSalesforceConfigError` naming the missing field(s) if not; otherwise perform the same `client_credentials` token fetch as `getSalesforceSession()` using **only** the org-sourced values (no `|| process.env.SF_*` fallback anywhere in this function), and reuse the existing `sfSessionCache` keyed by `orgConfig.id`.

**Checkpoint**: `getSalesforceSessionForOrg()` exists and is unit-callable — user story implementation can now begin.

---

## Phase 3: User Story 1 - Password reset uses the requesting tenant's Salesforce org (Priority: P1) 🎯 MVP

**Goal**: Forgot-password and reset-password authenticate to Salesforce using the requesting organization's own stored credentials, never a shared/global fallback, when that organization's config is complete.

**Independent Test**: Configure an organization with a full, distinct set of Salesforce connection fields; submit forgot-password and reset-password from its domain and confirm (via server logs / outbound request URL) that org's own credentials were used, not `.env`-sourced ones.

### Implementation for User Story 1

- [X] T004 [US1] In `lib/salesforce-auth.ts`, change `salesforceForgotPassword()` to call `getSalesforceSessionForOrg()` instead of `getSalesforceSession()`.
- [X] T005 [US1] In `lib/salesforce-auth.ts`, change `salesforceResetPassword()` to call `getSalesforceSessionForOrg()` instead of `getSalesforceSession()`.
- [X] T006 [US1] Manually run `quickstart.md` Step 1 (usable-org path) against `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` for two differently-configured organizations; confirm each request uses its own org's credentials and neither leaks into the other.

**Checkpoint**: Forgot-password/reset-password are fully functional against per-org credentials for organizations with complete configuration — independently testable and demoable.

---

## Phase 4: User Story 2 - Clear failure when no organization configuration is found (Priority: P2)

**Goal**: When an organization's Salesforce config can't be resolved or is incomplete, forgot-password/reset-password reject with a generic, non-revealing error (never falling back to shared `.env` credentials), while logging the real cause for operators.

**Independent Test**: Submit forgot-password/reset-password from a domain with no matching organization (and separately, from a domain matching an organization with an incomplete config) and confirm a generic 503 response plus a diagnosable server log entry, with no outbound request made using `.env`-sourced credentials.

### Implementation for User Story 2

- [X] T007 [P] [US2] In `app/api/auth/forgot-password/route.ts`, in the existing `catch (apiError: any)` block, add a check for `apiError instanceof OrgSalesforceConfigError` (import from `@/lib/salesforce-service`): on match, `console.error` the real `apiError` and return `NextResponse.json({ error: "Unable to process your request right now. Please contact support." }, { status: 503 })`; leave the existing `apiError.message` passthrough behavior unchanged for every other error type.
- [X] T008 [P] [US2] Apply the same catch/mapping change as T007 to `app/api/auth/reset-password/route.ts`.
- [X] T009 [US2] Manually run `quickstart.md` Steps 2–3 (incomplete-org config, and no-matching-org) against both routes; confirm the generic 503 body, confirm the real cause is present in server logs, and confirm (via logs/network inspection) that no request was attempted using `process.env.SF_*` values.

**Checkpoint**: Both user stories now work together — usable org configs succeed with their own credentials (US1), unusable ones fail generically without any env fallback (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that the change is type-safe and hasn't disturbed anything outside its intended scope.

- [X] T010 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors.
- [X] T011 Manually run `quickstart.md` Steps 4 (reset-password mirrors forgot-password) and 5 (login flow, and by extension every other `getSalesforceSession()` caller, is unaffected — still falls back to `.env` as before).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories (T004–T005 and T007–T008 all require `getSalesforceSessionForOrg()`/`OrgSalesforceConfigError` from T002–T003 to exist).
- **User Story 1 (Phase 3)**: Depends on Foundational completion. No dependency on User Story 2.
- **User Story 2 (Phase 4)**: Depends on Foundational completion. Does not require US1's file changes to exist for its own edits to compile (it only imports `OrgSalesforceConfigError`, added in Foundational), but exercising the full failure path in T009 is most meaningful once US1's wiring (T004–T005) is also in place — recommended to complete US1 first.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Within Each User Story

- T004 before T005 before T006 (same file, then validation) — US1.
- T007 and T008 can run in parallel (different files); T009 after both — US2.

### Parallel Opportunities

- T007 and T008 (different route files, same catch-block pattern) can be done in parallel.
- T010 can run any time after all implementation tasks land (independent of manual quickstart runs).

---

## Parallel Example: User Story 2

```bash
# T007 and T008 touch different files with the same mechanical change — safe to parallelize:
Task: "Add OrgSalesforceConfigError catch/mapping to app/api/auth/forgot-password/route.ts"
Task: "Add OrgSalesforceConfigError catch/mapping to app/api/auth/reset-password/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational — the strict resolver).
2. Complete Phase 3 (User Story 1) — org-specific credentials now work end-to-end for well-configured organizations.
3. **STOP and VALIDATE**: run `quickstart.md` Step 1 for at least two organizations.
4. This alone is demoable: the core "use the table, not `.env`" behavior is live, even before the friendlier failure-path polish of US2 exists (a misconfigured org would still surface *some* error today — just not yet the generic 503 — no regression, since Foundational's resolver already throws instead of falling back).

### Incremental Delivery

1. Setup + Foundational → resolver exists, not yet wired.
2. Add User Story 1 → wired and demoable (MVP).
3. Add User Story 2 → generic-failure UX and log-diagnosability land on top, no changes to US1's files required.
4. Polish → type-check + full quickstart sweep.

## Notes

- Every implementation task in this feature is a same-repo, same-branch edit — no worktree isolation or multi-developer parallelization is warranted at this scale (4 files, 2 of which — T007/T008 — are genuinely parallel).
- Commit after each phase checkpoint, not after every individual task, given how small and interdependent T002–T005 are.
