# Implementation Plan: Unauthorized Page Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`102`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/103-unauthorized-page-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two verified color-token defects on the Unauthorized page, confirmed via fresh direct-codebase investigation before this spec's authoring — the highest-severity item still open in the entire audit. `app/unauthorized/page.tsx` has zero `dark:` classes on any of its 5 colored elements, so it visibly breaks under dark mode while every sibling page supports it; fix adds the app's already-established `dark:` pairing to each element. Its "Back to Home" button also uses an off-brand `bg-blue-600`, the same class of defect already fixed on other primary buttons in spec `097`; fix converges it onto `bg-primary`. The audit's separate recommendation to rebuild this page on the shared `ErrorMessage` component was investigated and explicitly declined — that component's shape (inline title/message/retry-button) doesn't fit a full-page 403 landing with a numeral and a real navigation CTA.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 server component

**Primary Dependencies**: None new — every fix is a className string edit on existing JSX elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`102` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; className token edits have no runtime performance implication

**Constraints**:
- FR-003: the page's light-mode appearance must not change as a result of adding dark-mode support.
- FR-005: the button's link destination and hover/transition behavior must not change.
- FR-006: the page must not be rebuilt onto `ErrorMessage` — layout/structure stays as-is.
- FR-007: no business logic, routing, or Salesforce read/write changes anywhere — every change is presentation-layer.

**Scale/Scope**: 1 file touched, 6 className edits (5 dark-mode additions + 1 color-token swap) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface. This is the existing 403 landing page, unchanged in function.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes converge onto already-proven patterns (the app-wide dark-mode pairing convention, spec `097`'s brand-color precedent) — no new abstraction. Extending `ErrorMessage`'s API to fit this one page was explicitly rejected as premature (YAGNI).

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/103-unauthorized-page-consistency/
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

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/unauthorized/page.tsx    # fix: add dark: variants to 5 elements (lines 4-8); converge "Back to Home" button (line 13) bg-blue-600/700 -> bg-primary/primary-dark
```

**Structure Decision**: Single Next.js project. 1 file edited, no new files, no deletions, no new dependency. US1 (dark mode) and US2 (button color) both touch the same single file, in non-overlapping regions (5 background/text elements vs. the 1 button).

## Complexity Tracking

*No violations — table intentionally empty.*
