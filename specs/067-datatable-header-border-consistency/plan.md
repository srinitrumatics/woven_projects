# Implementation Plan: Standardize Data Table Header Corners & Border Styling

**Branch**: `067-datatable-header-border-consistency` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/067-datatable-header-border-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Every data table in the web app must render with rounded top corners on its header, no full border framing the outer table, and a bottom border under every row — in both light and dark mode. The codebase already centralizes table markup in a shared `components/ui/DataTable.tsx` primitive (`Table`, `THead`, `TBody`, `Tr`, `Th`, `Td`) used by ~98 files, but rounding and outer-border treatment are currently applied ad hoc by each page's own wrapper `<div>`, producing the "curvy vs sharp" and "bordered vs borderless" inconsistency the user reported. The approach is to standardize the rounded-corner + no-outer-border wrapper pattern (an existing, already-proven pattern used by e.g. the Proposal Elements tab, including compatibility with sticky headers) at the shared-component level so it propagates automatically, remove the handful of per-page `border` classes that currently frame some tables, confirm the existing `TBody` `divide-y` row-bottom-border already covers every row, and bring the one raw-markup outlier (`components/UserManagement/UserList.tsx`) in line by hand.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 19 (matches project baseline; no version change required)

**Primary Dependencies**: Tailwind CSS (existing `tailwind.config.ts` custom palette, `darkMode: 'class'`); no new dependencies

**Storage**: N/A — presentation-only change, no data model or persistence involved

**Testing**: `npm run lint`; manual visual verification across representative pages in light and dark mode (no automated visual-regression tooling exists in this project)

**Target Platform**: Web (desktop + responsive browser), same as the rest of the portal

**Project Type**: Web application (existing single Next.js App Router project — no frontend/backend split for this change)

**Performance Goals**: N/A — CSS-only change, no measurable performance target beyond "no layout shift / no added render cost"

**Constraints**: Must not break existing sticky-header behavior (Elements tab, Taxes tab) or horizontal-scroll clipping (Inventory, PO Lines, wide tables); must preserve `SortableHeader` and column-resize handle behavior inside header cells

**Scale/Scope**: ~98 files importing `components/ui/DataTable.tsx` across Orders, Proposals, Quotes, Purchase Orders, Invoices, Supplier Bills, Inventory, Shipments, and their detail-page sub-tabs, plus 1 raw-markup outlier (`components/UserManagement/UserList.tsx`); the printable PDF export template (`app/orders/[id]/components/PDFTemplate.tsx`) is explicitly out of scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data access, SOQL, or service-layer changes; purely presentational.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; no permission gating changes.
- **III. Next.js 15 App Router Patterns** — N/A. No new routes, no dynamic param handling changes.
- **IV. Multi-Tenant Isolation** — N/A. No database queries or org-scoped data involved.
- **V. Simplicity & Phase-Driven Scope** — **APPLIES.** The fix must reuse the existing, already-proven rounded-corner wrapper pattern (seen in the Proposal Elements/Taxes tabs) rather than inventing a new table-wrapper abstraction or a configurable "table variant" system. Per-page wrapper `border` classes are simply removed; no feature flags, no backwards-compatibility shims for the old bordered look.
- **Technology Stack Constraints — Styling** — **APPLIES.** Must stay within Tailwind CSS and the existing custom palette / `darkMode: 'class'` convention; no new CSS framework or inline styles.
- **Technology Stack Constraints — UI Component Conventions** — **APPLIES.** Must preserve `SortableHeader` + `useSortableData` + `useResizableColumns` behavior inside header cells, since header cells are exactly where the corner-rounding is applied.

**Gate result**: PASS. No violations requiring Complexity Tracking justification.

**Related work**: `specs/062-ui-consistency-tabs-tables` already tracks broader tab/table/typography consistency as a separate, larger initiative. This feature is intentionally narrower (header corners, outer border, row separators only) so it can ship independently; it does not supersede or duplicate that spec.

## Project Structure

### Documentation (this feature)

```text
specs/067-datatable-header-border-consistency/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Existing single Next.js 15 App Router project (no frontend/backend split). Changes are confined
to the shared table primitive, the small number of page/tab files that currently add their own
outer-border wrapper classes, and one raw-markup outlier:

```text
components/
├── ui/
│   └── DataTable.tsx                          # Shared Table/THead/TBody/Tr/Th/Td primitives
│                                                # — standardize rounded header corners + remove
│                                                # outer border here so the fix propagates to
│                                                # every consumer automatically
└── UserManagement/
    └── UserList.tsx                            # Raw <table> markup outlier — update by hand to
                                                  # match the same standardized styling

app/
├── orders/page.tsx                              # "Sharp corner" example — remove ad-hoc styling
├── proposals/page.tsx                           # "Sharp corner" example
├── inventory/page.tsx                           # Ad-hoc `rounded-lg` wrapper — align with standard
├── orders/[id]/components/ReturnsTab.tsx        # "Full border" example — remove outer border
├── proposals/[id]/components/ElementsTab.tsx    # Already-correct rounded pattern — reference case
├── proposals/[id]/components/TaxesTab.tsx       # "Full border" example — remove outer border
├── purchase-orders/[id]/components/POLinesTable.tsx  # "Full border" example
├── quotes/[id]/components/QuoteLinesTab.tsx     # "Sharp corner" example
├── invoices/[id]/components/InvoiceFilesTab.tsx # "Sharp corner" example
└── .../[id]/components/*Tab.tsx                 # Remaining detail-page tabs using DataTable
                                                  # primitives, audited for the same wrapper pattern
```

**Structure Decision**: No new directories or projects. This is a targeted styling correction
within the existing single Next.js App Router codebase. The primary fix lives in
`components/ui/DataTable.tsx` (shared `Table`/`THead`/`TBody` primitives) so it propagates to the
~98 files that already import it; a bounded list of page/tab files that currently add
contradicting wrapper classes (ad-hoc `border`, missing `rounded-lg`) are updated to drop those
overrides; and the one raw-markup table (`UserList.tsx`) is updated by hand since it does not
consume the shared primitives.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
