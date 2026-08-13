# Implementation Plan: Single-Line, Non-Ellipsis Data Table Headers Everywhere

**Branch**: `126-single-line-table-headers` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/126-single-line-table-headers/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Across every data table in the app — landing/list pages and detail/manifest/line pages alike — sortable column header labels must always render on a single line with no ellipsis truncation, and must never overlap the sort icon. Today, `components/ui/SortableHeader.tsx` pins each header cell's width via an inline `width`/`minWidth`/`maxWidth` style and wraps long labels onto multiple lines (`break-words`, per the prior spec 125 overlap fix) to avoid clipping under that pinned `maxWidth`. Research (Finding 2) shows every table in the codebase uses the browser's default `table-layout: auto`, with no `table-layout: fixed` anywhere — so dropping the `maxWidth` cap and switching the label to `whitespace-nowrap` restores the browser's native auto-layout behavior: a column renders at least as wide as its label needs, growing past its requested/resized width rather than wrapping, truncating, or overlapping the icon. This also satisfies the new resize-floor requirement (FR-004) as an emergent property, with no change needed to `hooks/useResizableColumns.ts`. Because every affected table already renders through the single shared `SortableHeader` component, the fix is made once at that shared layer, superseding spec 125's multi-line-wrap approach.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15.0.3 (App Router)

**Primary Dependencies**: Tailwind CSS 3.4 (utility classes only; no new dependency needed)

**Storage**: N/A — presentational fix only, no data model, database, or Salesforce interaction

**Testing**: Manual visual verification in the dev server (`npm run dev`) across representative landing/list and detail/manifest pages, per `quickstart.md`; `npm run lint` for static checks where an ESLint config is available. No existing automated visual/UI test harness in this repo for table headers.

**Target Platform**: Web browser (desktop widths primarily, since these are data-dense tables)

**Project Type**: Web application (existing Next.js app; single shared UI component fix, not a new route or feature)

**Performance Goals**: N/A — CSS/layout-only change; must not introduce layout thrash beyond the existing resize-drag behavior

**Constraints**: MUST NOT reintroduce ellipsis/truncation on header labels (FR-002, prior spec 046); MUST NOT change `SortableHeader`'s public prop interface (used at ~90+ call sites, per `contracts/sortable-header-contract.md`); MUST NOT break existing sort/resize/sticky-column behavior; MUST supersede spec 125's multi-line-wrap resolution on detail/manifest pages (FR-005)

**Scale/Scope**: One shared component (`components/ui/SortableHeader.tsx`) consumed by ~90+ call sites across every landing/list page (Orders, Quotes, Invoices, Products, etc.) and every detail/manifest/line-detail tab (Taxes, Fulfillment, Shipping Manifest Lines, etc.) — broader in scope than spec 125, which only covered detail/manifest/line pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data fetching or SOQL involved; presentational fix to a UI component. PASS.
- **II. RBAC-First Feature Design** — N/A. No new functionality exposed; header rendering is not permission-gated today and this fix doesn't change that. PASS.
- **III. Next.js 15 App Router Patterns** — N/A. No new routes, no param handling changes. Component remains a client component with the same prop contract. PASS.
- **IV. Multi-Tenant Isolation** — N/A. No data queries. PASS.
- **V. Simplicity & Phase-Driven Scope** — Fix is scoped to exactly the reported defect (single-line headers, no ellipsis, no overlap) at the one shared layer that causes it. Research (Finding 2) explicitly rejected a more complex JS-measurement alternative in favor of the simpler CSS-only `auto`-table-layout approach, consistent with this principle. PASS.
- **UI Component Conventions** (Technology Stack Constraints) — This feature reinforces the existing mandate that all sortable data-table columns use `SortableHeader`; no new component is introduced, and the fix is made at that single mandated layer. PASS.

No violations. No entries required in Complexity Tracking.

*Post-Phase 1 re-check*: Design artifacts (research.md, data-model.md, contracts/, quickstart.md) confirm no new entities, no new endpoints, no prop-interface change, and no deviation from the mandated `SortableHeader` component. Gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/126-single-line-table-headers/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/
└── ui/
    └── SortableHeader.tsx     # Single shared component to modify — drop maxWidth clamp,
                                #   switch label to whitespace-nowrap, remove label min-w-0

hooks/
└── useResizableColumns.ts     # Unchanged — the existing 50px state floor is harmless;
                                #   the rendered DOM width is now bounded by label content
                                #   width via auto table layout, not by this hook

app/
├── orders/**, quotes/**, proposals/**, invoices/**, purchase-orders/**,
│   supplier-bills/**, shipments/**, inventory/**, products/**
    # ^ Every landing/list page and every lines/[lineid] detail tab across these domains
    #   consumes SortableHeader unchanged — verification targets per quickstart.md,
    #   not files requiring code changes (props are passed through unchanged).

components/ui/DataTable.tsx    # Unchanged — its `Th` is a non-sortable static-table
                                #   header, out of scope per Key Entities in spec.md
```

**Structure Decision**: Single-project Next.js App Router structure (existing). The fix is isolated to one shared component, `components/ui/SortableHeader.tsx`, which every sortable data table across every landing/list and detail/manifest/line page already imports (per the constitution's UI Component Conventions mandate) — no per-page or per-call-site changes are needed or in scope. The `app/**` paths above are verification targets for Phase 2 acceptance testing, not implementation targets.

## Complexity Tracking

*No violations — table not required.*
