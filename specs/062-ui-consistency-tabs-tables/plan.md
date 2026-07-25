# Implementation Plan: Consistent Tab, Table & Typography Styling Across the Web App

**Branch**: `wovn_mathu` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-ui-consistency-tabs-tables/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Nine separate hand-rolled tab bar components (`QuoteTabs`, `ProposalTabs`, `POTabs`, `InvoiceTabs`, `ShipmentTabs`, `SupplierBillTabs`, `ProductTabs`, `PlaceholderTabs`, `BottomTabs`) and an unbounded number of per-page `<table>` implementations currently diverge in padding, spacing, active/hover states, and typography. There is no shared `Tabs` or `Table` component, and `tailwind.config.ts` has a latent bug (`fontFamily` nested inside `colors` instead of `theme.extend`) that means the app's intended font family has never actually been applied.

The technical approach is to introduce three shared, presentation-only building blocks — a `Tabs` component, a `DataTable`-style set of table primitives (header/cell/row wrappers, plus a shared empty-state/loading-state primitive), and a small set of semantic Tailwind text-style utilities/tokens (primary, muted, table-header, heading) — fix the `fontFamily` config bug, then migrate every existing tab bar and table to consume them, deleting the bespoke styling in each. This is a pure refactor of presentation code: no data, routing, permissions, or Salesforce/Drizzle logic changes.

## Technical Context

**Language/Version**: TypeScript 5, React 19

**Primary Dependencies**: Next.js 15 (App Router), Tailwind CSS 3.4

**Storage**: N/A (visual-only change; no schema/data changes)

**Testing**: No automated UI/unit test suite exists in this repo (only `tsx` scripts for RBAC and product-sync). Validation is manual/visual — see `quickstart.md`.

**Target Platform**: Web (desktop + responsive browser), light and dark mode

**Project Type**: Web application (Next.js App Router, single project — no separate frontend/backend split)

**Performance Goals**: No new runtime performance requirement; shared components must not introduce added re-renders or bundle-size regressions beyond trivial component extraction.

**Constraints**: Must not change tab labels, tab order, table columns, sorting/filtering behavior, or any business logic. Must preserve existing `SortableHeader`, `useSortableData`, `useResizableColumns`, and `Pagination` component usage (per Constitution's UI Component Conventions) — the new table primitives wrap around these, they do not replace them.

**Scale/Scope**: 9 existing tab-bar components and their host pages (Orders, Quotes, Proposals, Invoices, Shipments, Purchase Orders, Supplier Bills, Products, and Shipment line sub-tabs), plus all page-level table implementations under `app/**` (line-item tables, list/landing tables). Admin Portal (`app/(admin-portal)/`) is out of scope per spec Assumptions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Salesforce as Single Source of Truth)**: N/A — no data access changes; components remain purely presentational and receive data via existing props.
- **Principle II (RBAC-First)**: N/A — no new user-facing functionality or permission surface is introduced; `PermissionGate` usage in host pages is untouched.
- **Principle III (Next.js 15 App Router Patterns)**: PASS — no route or param-handling changes. New shared components live under `components/` and are plain client/presentational components, not new routes.
- **Principle IV (Multi-Tenant Isolation)**: N/A — no data queries involved.
- **Principle V (Simplicity & Phase-Driven Scope)**: PASS — this is a consolidation that *reduces* duplication (9 tab components → 1), directly aligned with YAGNI/simplicity. No speculative abstraction: the shared components cover only the roles (tabs, table chrome, text styles) already proven necessary by 9+ existing call sites.
- **Technology Stack Constraints**: PASS — stays within Tailwind CSS/Next.js/React; explicitly preserves `SortableHeader` + `useSortableData` + `useResizableColumns` + `Pagination` conventions rather than replacing them.

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/062-ui-consistency-tabs-tables/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Next.js 15 App Router — single project (this repo's actual structure)
tailwind.config.ts        # Fix fontFamily location; add semantic text-style tokens if needed

components/
├── ui/
│   ├── Tabs.tsx                 # NEW shared tab-bar component (replaces 9 bespoke *Tabs.tsx files)
│   ├── DataTable.tsx            # NEW shared table chrome primitives (Table/Thead/Tbody/Tr/Th/Td wrappers,
│   │                            #   plus TableEmptyState/TableLoadingState for unified empty/loading rows)
│   ├── SortableHeader.tsx       # EXISTING — reused inside DataTable's Th, not replaced
│   ├── Pagination.tsx           # EXISTING — reused below DataTable, not replaced
│   └── StatusBadge.tsx          # EXISTING — unaffected
└── typography.ts (or similar)   # NEW small module of semantic text-style class constants
                                  # (primary/muted/tableHeader/heading), OR equivalent Tailwind
                                  # utility classes if a constants module proves unnecessary

app/
├── quotes/[id]/components/QuoteTabs.tsx           # MIGRATE to <Tabs>, remove bespoke markup
├── proposals/[id]/components/ProposalTabs.tsx     # MIGRATE
├── purchase-orders/[id]/components/POTabs.tsx      # MIGRATE
├── invoices/[id]/components/InvoiceTabs.tsx        # MIGRATE
├── shipments/[id]/components/ShipmentTabs.tsx      # MIGRATE
├── shipments/[id]/components/PlaceholderTabs.tsx   # MIGRATE
├── shipments/[id]/lines/[lineid]/components/BottomTabs.tsx  # MIGRATE
├── supplier-bills/[id]/components/SupplierBillTabs.tsx  # MIGRATE
├── products/[id]/components/ProductTabs.tsx        # MIGRATE (converts underline style → shared pill style)
├── products/[id]/components/EditProductTabs.tsx    # CONSUMER ONLY — renders <ProductTabs>, does not
│                                                    #   implement its own tab bar; fixed by the ProductTabs
│                                                    #   migration above with no separate code change expected
└── **/*Table*.tsx, **/*LinesTab.tsx, **/*Tab.tsx   # MIGRATE table markup to shared DataTable primitives
    (e.g. POLinesTable.tsx, SupplierBillLinesTable.tsx, MyOrderTable.tsx,
     QuoteLinesTab.tsx, ProductsTab.tsx, ShipmentLinesTab.tsx, and other
     page-level tables discovered during Phase 0/implementation)
```

**Structure Decision**: Single Next.js App Router project (matches existing repo layout — no frontend/backend split applies). New shared UI lives under `components/ui/` alongside the existing `Pagination`, `SortableHeader`, and `StatusBadge` components, following the project's established convention of small, focused shared components in that directory. Existing per-page tab and table files are edited in place to consume the new shared components rather than being deleted outright as separate files, since each still owns page-specific tab labels/content and table columns/data — only their styling markup is replaced.

## Complexity Tracking

*No violations — table not needed.*
