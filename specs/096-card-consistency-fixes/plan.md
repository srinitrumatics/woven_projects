# Implementation Plan: Card Consistency Fixes

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`095`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/096-card-consistency-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Three independent, verified card-styling defects, scoped down after a fresh current-state re-audit found the original audit substantially overstated the defect surface — the dominant 37-file detail-card pattern is already fully consistent, and 2 of the audit's 3 named "older shadow" pages are moot (Dashboard deleted in spec 085; Unauthorized already uses `shadow-md`, not the bare `shadow` the audit claimed). This spec covers: (1) a copy-paste icon-color bug recurring identically across Order/Quote/Proposal Billing-info cards — each pairs a `bg-blue-50` icon bubble with a mismatched `text-green-600` icon, while the already-correct Invoice and Supplier Bill siblings consistently pair blue bubbles with blue icons; fix changes only the icon color in the 3 buggy files to match the majority-correct blue-on-blue convention. (2) Product Detail's info card (`ProductInfoCard.tsx`) uses a visually heavier `rounded-2xl shadow-xl hover:shadow-2xl` treatment than the Product catalog card it conceptually pairs with (`rounded-xl shadow-sm hover:shadow-lg`); fix reconciles Product Detail's card onto the catalog card's shape/shadow tokens, dropping the hover effect entirely since the Detail card's root element has no click behavior of its own (only its internal buttons do). (3) Reports page is the one remaining page still on the legacy bare `shadow` token; fix is a single-token change to `shadow-md`, matching Unauthorized's already-correct reference pattern. The 37-file dominant detail-card population, the 5-file Home/Profile stat-card population, and the 7-file list-page stat/filter-card population are all confirmed already internally consistent and are explicitly left untouched.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix is a `className` string edit on existing JSX elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`095` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders; every change is a like-for-like className replacement

**Constraints**:
- FR-002: the icon-bubble fix changes only the icon's `<svg>` className in the 3 named files — the bubble background, layout, and every other element on those cards MUST remain byte-identical.
- FR-005: Product Detail's info card MUST NOT gain a hover-shadow affordance — its root element has no `onClick`, so removing `hover:shadow-2xl`/`transition-all` entirely (not toning it down) is required, distinct from the catalog card which legitimately keeps its own hover effect as a clickable `<Link>`.
- FR-007/FR-008: none of the 37-file dominant detail-card population, the 5-file Home/Profile stat-card population, or the 7-file list-page stat/filter-card population may be touched — each is a separately confirmed-consistent, appropriately distinct design language for a different UI role.
- No business logic, data-fetching, or Salesforce read/write changes anywhere — every change is presentation-layer className styling.

**Scale/Scope**: 5 files touched (3 one-line icon-color fixes, 1 card-shape/shadow reconciliation, 1 single-token shadow fix) — 5 total file operations, no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every fix is a targeted className correction on a confirmed defect — no new abstraction, no shared `Card` component introduced. The 37/5/7-file already-consistent populations are explicitly left untouched rather than forced into one universal card primitive, avoiding a premature, unrequested redesign (YAGNI).

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/096-card-consistency-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal className edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/orders/[id]/components/BillingInfo.tsx                             # fix: icon <svg> (line 19) text-green-600/400 -> text-blue-600/400
app/quotes/[id]/components/QuoteBillingInfo.tsx                        # fix: icon <svg> (line 13) text-green-600/400 -> text-blue-600/400
app/proposals/[id]/components/BillingInfo.tsx                          # fix: icon <svg> (line 13) text-green-600/400 -> text-blue-600/400

app/products/[id]/components/ProductInfoCard.tsx                       # fix: root <div> (line 24) rounded-2xl shadow-xl border-gray-100 hover:shadow-2xl/transition-all -> rounded-xl shadow-sm border-gray-200, hover/transition removed

app/reports/page.tsx                                                    # fix: card <div> (line 13) shadow -> shadow-md
```

**Structure Decision**: Single Next.js project. 5 files edited, no new files, no deletions, no new dependency. US1 (icon-bubble color) touches 3 independent files with an identical one-line fix each; US2 (Product Detail reconciliation) and US3 (Reports shadow) are each single-file, single-token fixes, fully independent of US1 and of each other.

## Complexity Tracking

*No violations — table intentionally empty.*
