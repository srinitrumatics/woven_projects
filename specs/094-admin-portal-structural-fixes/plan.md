# Implementation Plan: Admin-Portal Structural Fixes

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`093`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/094-admin-portal-structural-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Four independent, verified defects in the Admin-Portal (the separate Super Admin console under `app/(admin-portal)/admin-portal/`), all re-confirmed against current source: (1) `Header.tsx` (shared with the main commerce app) always renders an account-selector button and notification bell, neither of which makes sense for a Super Admin/Admin session — the account-selector literally shows "Accounts Missing" text — even though `Sidebar.tsx` (the other half of the same shared shell) already correctly special-cases this exact role check for its own nav rendering; fix mirrors that identical check to conditionally hide just these 2 elements. (2) Organizations List renders an unpaginated, unfiltered card grid with no search or sort, unlike every other list page in the app; fix adds a search input, a sort `<select>` wired to the already-generic `useSortableData` hook, and the shared `Pagination` component. (3) Organizations List's fetch failure (network error or unsuccessful API response) is silently swallowed and falls through to the same empty-state UI as a genuinely-empty list; fix adds a distinct error state using the existing `ErrorMessage` component with a retry action. (4) 3 native blocking `window.alert()` calls (1 in Organizations List, 2 in Organization Create) are replaced with the `useToast` pattern already working elsewhere in the same module.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix reuses existing hooks/components already present in the codebase (`useSortableData`, `components/ui/Pagination.tsx`, `components/ui/ErrorMessage.tsx`, `components/ui/Toast.tsx`'s `useToast`)

**Storage**: N/A — no schema, query, or data-fetching *source* changes; item 3 adds client-side error-state handling around the existing `/api/admin/organizations` fetch, it doesn't change the API itself

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`093` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls beyond an existing fetch's already-planned retry path

**Constraints**:
- FR-003: the main commerce app's Header rendering for non-admin-portal users MUST remain completely unchanged — the new `isAdminPortalUser` check must be additive (an extra `&&` condition), never replacing existing logic.
- FR-009: Organizations List's genuine empty-state (fetch succeeds, zero organizations) MUST remain unchanged and distinguishable from the new error state — both states must be reachable and visually distinct.
- FR-011: no business logic, Salesforce/provisioning logic, or permission-check changes anywhere — every fix is either role-conditional UI-chrome, a presentation-layer list-page consistency fix, or a notification-mechanism swap.
- The Create-page "Complete Load/Index Products first" alert-to-toast conversion must preserve the existing (already-unconditional) `router.push` behavior exactly — confirmed via source read that the current `alert()` does not gate navigation today.

**Scale/Scope**: 3 files touched (`components/Header.tsx`, `app/(admin-portal)/admin-portal/organizations/page.tsx`, `app/(admin-portal)/admin-portal/organizations/create/page.tsx`), no new files, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes — Organizations List's error-state fix wraps the existing `/api/admin/organizations` fetch, it doesn't introduce a new query or bypass the existing service layer.
- **II. RBAC-First Feature Design**: PASS. The new `isAdminPortalUser` check in `Header.tsx` reuses `Sidebar.tsx`'s existing `user?.role` check exactly — no new permission surface, no divergent role-detection logic introduced.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. The two isolated auth systems (main portal vs. admin portal) remain untouched — this feature only adjusts which UI elements the shared `Header` component shows based on the already-established `user.role` field, not the auth systems themselves.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved — Organizations List's search/sort/pagination operate client-side over data already scoped by the existing `/api/admin/organizations` endpoint.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every fix reuses an existing hook/component (`useSortableData`, `Pagination`, `ErrorMessage`, `useToast`) rather than building new ones — a net-simplicity improvement, consistent with the Modal/SubTabs/ReadOnlyField consolidation precedent, just applied to already-existing shared primitives instead of new ones.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/094-admin-portal-structural-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every fix is an internal UI/state change to existing components; no new external interface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/Header.tsx                                                          # fix: isAdminPortalUser check hides account-selector (lines 70-137) + notification bell (139-144)

app/(admin-portal)/admin-portal/organizations/page.tsx                         # fix: search input, sort <select> via useSortableData, Pagination wrap, error state via ErrorMessage, alert() -> errorToast (line 138)

app/(admin-portal)/admin-portal/organizations/create/page.tsx                  # fix: 2 alert() calls -> errorToast (lines 262, 692), add useToast import
```

**Structure Decision**: Single Next.js project. 3 files touched, no new files, no new dependency. Every fix reuses an existing shared hook/component. US1 (Header) is independent of US2-US4 (both Organizations pages); US2/US3/US4 share one file (`organizations/page.tsx`) but touch disjoint code regions (search/sort/pagination vs. error state vs. one `alert()` call) so are implemented together in one pass rather than as separately-ordered edits.

## Complexity Tracking

*No violations — table intentionally empty.*
