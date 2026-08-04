# Implementation Plan: Admin-Portal Polish

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`099`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/100-admin-portal-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Three independent, verified defects on the Super Admin portal, confirmed via fresh direct-codebase investigation before this spec's authoring. This spec covers: (1) Organization Detail's sync-run history renders each run's status via a page-local, hand-rolled color rule instead of the shared `StatusBadge` component already used consistently elsewhere; fix migrates to `<StatusBadge status={run.status} variant="compact" />`, adding a `completed_with_errors` case to `StatusBadge`'s green bucket (confirmed via codebase-wide search to be a real, non-colliding status value) so the migration preserves the exact current visual behavior. (2) Organization Detail's page heading uses `font-bold` where Organization List's equivalent heading uses `font-semibold` for the same visual tier within the same page family; fix converges Detail onto List's weight. (3) Admin Login's 4 decorative icons (ShieldCheck, Mail, Lock, ArrowRight) lack `aria-hidden="true"`, so they may be redundantly announced to assistive technology alongside their already-labeled sibling content; fix adds it to all 4. The broader indigo/purple/amber action-button color scheme on Organization Detail/Create is explicitly out of scope — a separate, undecided judgment call, not a confirmed defect.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — `StatusBadge` already exists at `components/ui/StatusBadge.tsx` and is imported, not created; no new component, route, or npm package is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`099` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; swapping one JSX element and adding one switch-case have no runtime performance implication

**Constraints**:
- FR-002/FR-003/FR-004: the `StatusBadge` migration MUST preserve today's exact 3-way visual outcome (completed/completed_with_errors → green, failed → red, anything else → gray) — no new color semantics are introduced.
- FR-006: Organization Detail's heading MUST NOT change in size, color, or text content — only the font-weight token changes.
- FR-008: Admin Login's `aria-hidden` additions MUST NOT change any visible rendering.
- FR-009: the indigo/purple/amber action-button color scheme MUST NOT be touched by this feature.
- FR-010: no business logic, data-fetching, or Salesforce/sync-service changes anywhere — every change is a presentation-layer correction.

**Scale/Scope**: 3 files touched (1 file gaining an import + a JSX swap, 1 shared component gaining one switch-case, 1 file's heading className token change, 1 file gaining 4 `aria-hidden` attributes — note Organization Detail's page is touched by both US1 and US2) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface. This feature touches only the already-existing Super Admin portal, distinct from the deleted Admin RBAC subsystem.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every fix reuses an already-existing shared primitive (`StatusBadge`) or is a single-token/single-attribute correction — no new abstraction. The indigo/purple/amber action-color question is explicitly left undecided rather than forcing a premature consolidation.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/100-admin-portal-polish/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal className/JSX/attribute edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/(admin-portal)/admin-portal/organizations/[id]/page.tsx    # fix: import StatusBadge, replace raw status span (line 662) with <StatusBadge>; fix: heading className (line 308) font-bold -> font-semibold
components/ui/StatusBadge.tsx                                   # fix: add "completed_with_errors" case to the green color bucket alongside "completed"

app/(admin-portal)/admin-login/page.tsx                         # fix: add aria-hidden="true" to ShieldCheck (54), Mail (71), Lock (86), ArrowRight (104)
```

**Structure Decision**: Single Next.js project. 3 files edited, no new files, no deletions, no new dependency. US1 touches `organizations/[id]/page.tsx` (status migration) and `StatusBadge.tsx` (vocabulary addition); US2 touches `organizations/[id]/page.tsx` (same file as US1, non-overlapping region — the heading vs. the sync-history row); US3 touches `admin-login/page.tsx` independently of both.

## Complexity Tracking

*No violations — table intentionally empty.*
