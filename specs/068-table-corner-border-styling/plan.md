# Implementation Plan: Consistent DataTable Corner & Border Styling

**Branch**: `068-table-corner-border-styling` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/068-table-corner-border-styling/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A prior effort (`specs/067-datatable-header-border-consistency`) already applied the standard rounded-header / borderless-outer-edge / row-bottom-border wrapper pattern (`rounded-lg shadow-sm overflow-hidden`, no `border`) to nearly all of the ~98 files that consume the shared `components/ui/DataTable.tsx` primitives. A `/speckit-analyze` audit of that work found the pattern is correctly applied almost everywhere but identified two concrete, unclosed gaps: (1) `app/configure/ConfigureOrderClientPage.tsx` was never touched and still wraps its table in `border border-gray-200 dark:border-gray-700`, and (2) six empty-state containers across `app/proposals/[id]/components/FulfillmentsTab.tsx` and `app/proposals/[id]/components/PurchasesTab.tsx` still carry a leftover `border border-gray-100 dark:border-gray-700` even though the populated-table wrapper in those same files was already fixed. This plan closes those two gaps by applying the exact same already-proven wrapper pattern used everywhere else, and re-verifies the full table inventory (including sticky-header and horizontal-scroll cases named in the spec's edge cases) so no other outlier remains.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 19 (matches project baseline; no version change required)

**Primary Dependencies**: Tailwind CSS (existing `tailwind.config.ts` custom palette, `darkMode: 'class'`); no new dependencies

**Storage**: N/A — presentation-only change, no data model or persistence involved

**Testing**: `npm run lint`; manual visual verification of the two fixed files (and a spot-check of already-compliant pages) in light and dark mode (no automated visual-regression tooling exists in this project)

**Target Platform**: Web (desktop + responsive browser), same as the rest of the portal

**Project Type**: Web application (existing single Next.js App Router project — no frontend/backend split for this change)

**Performance Goals**: N/A — CSS-only change, no measurable performance target beyond "no layout shift / no added render cost"

**Constraints**: Must not disturb the `ConfigureOrderClientPage.tsx` table's existing sticky-toolbar/scroll behavior inside its fixed-height (`h-[600px]`) flex layout; must not change `TableEmptyState`/`TableLoadingState` content or spacing, only the wrapper's border/radius classes

**Scale/Scope**: 2 known outlier locations to fix — 1 file (`app/configure/ConfigureOrderClientPage.tsx`, 1 wrapper) and 2 files with 6 total empty-state wrapper instances (`app/proposals/[id]/components/FulfillmentsTab.tsx` ×4, `app/proposals/[id]/components/PurchasesTab.tsx` ×2) — plus a full re-audit pass across all `DataTable.tsx` consumers to confirm no additional outlier exists beyond what the prior analysis found

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data access, SOQL, or service-layer changes; purely presentational.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; no permission gating changes.
- **III. Next.js 15 App Router Patterns** — N/A. No new routes, no dynamic param handling changes.
- **IV. Multi-Tenant Isolation** — N/A. No database queries or org-scoped data involved.
- **V. Simplicity & Phase-Driven Scope** — **APPLIES.** Fix reuses the exact wrapper pattern already standardized in `067-datatable-header-border-consistency` (`rounded-lg shadow-sm overflow-hidden`, no `border`) rather than inventing a new abstraction, a shared "table variant" system, or touching `components/ui/DataTable.tsx` itself. This is a targeted correction of remaining outliers, not a new design.
- **Technology Stack Constraints — Styling** — **APPLIES.** Must stay within Tailwind CSS utility classes and the existing custom palette / `darkMode: 'class'` convention; no new CSS framework or inline styles.
- **Technology Stack Constraints — UI Component Conventions** — **APPLIES.** Changes are confined to outer wrapper `<div>` classes; must not touch `SortableHeader`, `useSortableData`, `useResizableColumns`, or `TableEmptyState`/`TableLoadingState` internals.

**Gate result**: PASS. No violations requiring Complexity Tracking justification.

**Related work**: This feature is a direct, narrowly-scoped follow-up to `specs/067-datatable-header-border-consistency`, closing the two gaps its own `/speckit-analyze` run identified as unresolved (see spec.md Assumptions). It does not re-litigate or duplicate the broader `specs/062-ui-consistency-tabs-tables` initiative.

## Project Structure

### Documentation (this feature)

```text
specs/068-table-corner-border-styling/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Existing single Next.js 15 App Router project (no frontend/backend split). Changes are confined to
the two known outlier locations plus a verification pass across the existing `DataTable.tsx`
consumer set (no changes expected there, since `067` already brought them into compliance):

```text
app/
├── configure/
│   └── ConfigureOrderClientPage.tsx             # Line ~642: remove `border border-gray-200
│                                                  # dark:border-gray-700` from the table wrapper
│                                                  # div, matching the ElementsTab reference pattern
└── proposals/[id]/components/
    ├── FulfillmentsTab.tsx                      # 4 empty-state wrapper divs (Customer Quotes,
    │                                              # Sales Orders, Invoices, Shipping Manifests
    │                                              # sections): remove `border border-gray-100
    │                                              # dark:border-gray-700`
    └── PurchasesTab.tsx                          # 2 empty-state wrapper divs: same fix
```

**Structure Decision**: No new directories, components, or projects. This is a targeted follow-up
correction within the existing single Next.js App Router codebase, editing only the 3 files above.
No changes to `components/ui/DataTable.tsx` are needed — the shared primitives (`THead`'s
`border-b`, `TBody`'s `divide-y` row separators) already satisfy the spec's requirements, per the
prior feature's analysis; only the page-level wrapper `<div>` classes that still contradict the
standard are corrected.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
