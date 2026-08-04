# Implementation Plan: Button Color Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`096`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/097-button-color-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified button/color-token defects, confirmed via fresh direct-codebase investigation before this spec's authoring. This spec covers: (1) the Products module's "Add to Order" action renders in the correct brand `primary` color on the catalog card, but the identical action drifts to an off-brand `bg-blue-600` on both Product Detail's info card and inside the Add to Order modal — 3 call sites, one semantic action, 2 different colors; fix converges the 2 drifted sites onto the catalog card's already-correct `bg-primary hover:bg-primary-dark` token. (2) Admin Login (`/admin-login`) uses a blue-to-indigo gradient button/icon-bubble and `rounded-2xl` inputs with `focus:ring-blue-500`, reading as an unrelated product from the main portal's `/signin`, which uses the `primary`-token family and `rounded-md` inputs; fix aligns Admin Login's button/icon-bubble/input color and shape tokens onto `/signin`'s exact pattern, while explicitly preserving Admin Login's independent page layout and auth logic (two separate auth systems per `CLAUDE.md`, not merged by this feature). A 3rd candidate finding from the original audit — Orders' "Cancel"/"Save Draft" vs. "Clone" button-style difference — was investigated and found to be a reasonable secondary-action-tier distinction between two different UI regions, not a genuine mismatch, and is explicitly out of scope.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix is a `className` string edit on existing JSX elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`096` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light mode (Admin Login has no dark-mode support today and this feature doesn't add one — out of scope)

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders; every change is a like-for-like className replacement

**Constraints**:
- FR-003: none of the 3 "Add to Order" call sites' disabled/loading visual states may change — only base/hover color tokens are corrected.
- FR-006/FR-007: Admin Login's overall page layout/shell and the two auth systems' structural/functional independence MUST NOT change — this feature is a token/color correction only, not a layout redesign or auth-system merge.
- FR-008: no business logic, data-fetching, authentication behavior, or Salesforce read/write changes anywhere — every change is presentation-layer styling.

**Scale/Scope**: 3 files touched (2 one-line "Add to Order" button color fixes, 1 file with 6 token-level edits on Admin Login) — 8 total className edits, no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface. Admin Login's own `/api/auth/admin/login` call and independent auth flow are untouched.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every fix is a targeted className correction on a confirmed defect — no new abstraction, no shared component introduced, no merging of the two intentionally-separate auth systems.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/097-button-color-consistency/
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
app/products/[id]/components/ProductInfoCard.tsx                       # fix: "Add to Order" button (line 93) bg-blue-600/700 -> bg-primary/primary-dark
app/products/[id]/components/AddToOrderModal.tsx                       # fix: 2 confirm buttons (lines 216, 225) bg-blue-600/700 + shadow-blue-500/20 -> bg-primary/primary-dark + shadow-lg

app/(admin-portal)/admin-login/page.tsx                                 # fix: icon bubble (53), input fields+focus icons (71,77,86,92), submit button (101) -> primary-token family matching /signin
```

**Structure Decision**: Single Next.js project. 3 files edited, no new files, no deletions, no new dependency. US1 (Add to Order color) touches 2 independent files; US2 (Admin Login token alignment) touches 1 file across 6 distinct token edits — fully independent of US1.

## Complexity Tracking

*No violations — table intentionally empty.*
