# Implementation Plan: Fix Sort Icon Overlap in Menu/Line Detail Table Headers

**Branch**: `125-header-sort-icon-overlap` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/125-header-sort-icon-overlap/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

On menu/manifest and line detail pages (Taxes tabs, Shipping Manifest lines, Fulfillment box-dimension columns, etc.), sortable table headers render narrow, often user-resizable fixed-width columns with long labels. Because a prior fix (spec 046) already forbids ellipsis truncation on header labels, the current header layout (`components/ui/SortableHeader.tsx`) forces the label onto a single `whitespace-nowrap` line with no overflow clipping — so on narrow columns the label overflows its box and visually bleeds on top of the adjacent sort icon. The fix is to let the label wrap onto additional lines within its own flex box (instead of forcing single-line `nowrap` or falling back to ellipsis), while the icon keeps a reserved, non-shrinking width — so the label can never render on top of it, at any column width, without ever clipping the label's text. Because every affected table already renders through the single shared `SortableHeader` component, the fix is made once at that shared layer.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15.0.3 (App Router)

**Primary Dependencies**: Tailwind CSS 3.4 (utility classes only; no new dependency needed)

**Storage**: N/A — this is a presentational fix with no data model, database, or Salesforce interaction

**Testing**: Manual visual verification in the dev server (`npm run dev`) across representative pages; `npm run lint` for static checks. No existing automated visual/UI test harness in this repo for table headers.

**Target Platform**: Web browser (desktop widths primarily, since these are data-dense detail tables)

**Project Type**: Web application (existing Next.js app; this is a single shared UI component fix, not a new route or feature)

**Performance Goals**: N/A — CSS/layout-only change with no measurable perf target; must not introduce layout thrash beyond the existing resize-drag behavior

**Constraints**: MUST NOT reintroduce ellipsis/truncation on header labels (per spec FR-002 and prior spec 046); MUST NOT change the public prop interface of `SortableHeader` (used at ~90 call sites) MUST NOT break existing sort/resize/sticky-column behavior

**Scale/Scope**: One shared component (`components/ui/SortableHeader.tsx`) consumed by ~90 call sites across orders, quotes, proposals, invoices, purchase orders, supplier bills, shipments, and credit/debit memo line-detail and manifest-detail tabs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data fetching or SOQL involved; this is a presentational fix to a UI component. PASS.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; header rendering is not permission-gated today and this fix doesn't change that. PASS.
- **III. Next.js 15 App Router Patterns** — N/A. No new routes, no param handling changes. The component remains a client component with the same prop contract. PASS.
- **IV. Multi-Tenant Isolation** — N/A. No data queries. PASS.
- **V. Simplicity & Phase-Driven Scope** — Fix is scoped to exactly the reported defect (header/icon overlap) at the one shared layer that causes it; no speculative abstraction added. PASS.

No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/125-header-sort-icon-overlap/
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
    └── SortableHeader.tsx     # Single shared component to modify — label/icon layout fix

app/
├── orders/[id]/components/*TaxesTab.tsx, LineFulfillmentsTab.tsx, ...
├── quotes/[id]/lines/[lineid]/components/*TaxesTab.tsx, ...ShippingManifestLinesSubTab.tsx
├── quotes/[id]/components/QuoteShippingManifestsSubTab.tsx
├── proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx, LineFulfillmentsTab.tsx
├── invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx
├── purchase-orders/[id]/lines/[lineid]/components/*
├── supplier-bills/[id]/lines/[lineid]/components/*
└── shipments/[id]/components/ShipmentLinesTab.tsx
    # ^ All of the above are call sites/consumers of SortableHeader — verification targets,
    #   not files requiring code changes (they pass label/width/field props unchanged).

hooks/
└── useResizableColumns.ts     # Unchanged; defines the 50px column-width floor the fix must
                                #   remain overlap-free down to
```

**Structure Decision**: Single-project Next.js App Router structure (existing). The fix is isolated to one shared component, `components/ui/SortableHeader.tsx`, which every listed detail-page table already imports — no per-page changes are needed or in scope. The `app/**` paths above are verification targets for Phase 2 acceptance testing, not implementation targets.

## Complexity Tracking

*No violations — table not required.*
