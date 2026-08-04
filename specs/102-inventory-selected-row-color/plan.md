# Implementation Plan: Inventory Selected-Row Color Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`101`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/102-inventory-selected-row-color/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

One verified color-token defect on Inventory List, confirmed via fresh direct-codebase investigation before this spec's authoring. Inventory's selected-row highlight uses the brand `bg-primary/5` token on the row itself, but its 2 horizontally-pinned (sticky) columns — the checkbox and product-name cells — both override to an off-brand `bg-blue-50` when selected, instead of a solid primary-family background. This same page's own sticky table header already establishes the correct convention (`bg-primary-light dark:bg-gray-900`), used consistently across at least 8 other list pages in the app. Fix converges both sticky cells' selected-state light-mode token onto `bg-primary-light`, leaving the neutral dark-mode token, the unselected states, and the row's own background untouched.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — this is a className string edit on existing JSX elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`101` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; a className token swap has no runtime performance implication

**Constraints**:
- FR-003/FR-004: neither the dark-mode selected-state token nor either cell's unselected-state background may change.
- FR-005: the row's own non-sticky selected-state background must not change.
- FR-006: no other page or table in the app may be touched.
- FR-007: no business logic, data-fetching, or Salesforce read/write changes anywhere — every change is presentation-layer.

**Scale/Scope**: 1 file touched, 2 className token edits (checkbox cell, product-name cell) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. The fix converges onto a token this exact page and at least 8 others already use — no new abstraction, no new color introduced.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/102-inventory-selected-row-color/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this change is an internal className edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/inventory/page.tsx    # fix: sticky checkbox cell (line 628) and sticky product-name cell (line 637) selected-state bg-blue-50 -> bg-primary-light (light mode only)
```

**Structure Decision**: Single Next.js project. 1 file edited, no new files, no deletions, no new dependency. Single user story, single file, 2 non-conflicting edits.

## Complexity Tracking

*No violations — table intentionally empty.*
