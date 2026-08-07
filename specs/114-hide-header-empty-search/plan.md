# Implementation Plan: Hide Table Header on Empty Search Results

**Branch**: `wovn_mathu` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/114-hide-header-empty-search/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two of the nine menu landing pages — Proposals (`app/proposals/page.tsx`) and Quotes (`app/quotes/page.tsx`) — render their `<Table>`/`<THead>` unconditionally and only branch on zero results *inside* `<TBody>` (a single `<Tr>` with a `colSpan` `<Td>` wrapping `TableEmptyState`). Every other menu landing page (Orders, Invoices, Shipments, Purchase Orders, Supplier Bills, Inventory, Products) already places the `length === 0` check *before* the `<Table>` is rendered at all, so `TableEmptyState` fully replaces the table (header included) when there are no matching rows. The fix is to restructure Proposals' and Quotes' render logic to match the already-proven pattern used everywhere else: move the empty-state ternary out from inside `<TBody>` to wrap the whole `<Table>`, so `<THead>` is not rendered when the result set is empty. No shared component changes are needed — `TableEmptyState`, `TableLoadingState`, and `Pagination` (which already self-hides via `if (totalItems === 0) return null`) are reused as-is.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)

**Primary Dependencies**: Existing shared UI primitives — `components/ui/DataTable.tsx` (`Table`, `THead`, `TBody`, `Tr`, `Td`, `TableEmptyState`, `TableLoadingState`), `components/ui/Pagination.tsx`, `components/ui/SortableHeader.tsx`. No new dependencies.

**Storage**: N/A — this is a client-side rendering change only; no data source, query, or Salesforce field is touched.

**Testing**: Manual verification per `quickstart.md` (this repo has no automated UI test suite for landing pages); `npm run lint` for static checks.

**Target Platform**: Web (existing Next.js 15 client-rendered pages), all supported browsers/breakpoints already used by these pages.

**Project Type**: Web application (single Next.js project — no frontend/backend split applicable here beyond the existing structure).

**Performance Goals**: N/A — purely conditional-rendering change; no measurable perf target beyond "no added render cost" (removing DOM nodes on empty state is strictly cheaper than the current behavior).

**Constraints**: Must not change the visual output for any page that already hides its header on empty results (Orders, Invoices, Shipments, Purchase Orders, Supplier Bills, Inventory, Products) — zero regression. Must not alter the wording/styling of `TableEmptyState` itself, sorting behavior, column widths, or pagination logic.

**Scale/Scope**: 2 files require code changes (`app/proposals/page.tsx`, `app/quotes/page.tsx`); 7 additional landing-page files require regression verification only (no code change expected).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data fetching, SOQL, or service-layer code is touched; this only changes what markup renders around data that is already fetched.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gates on the Proposals/Quotes pages are untouched.
- **III. Next.js 15 App Router Patterns** — Pass. No new routes, no param handling involved; existing `page.tsx` files are edited in place.
- **IV. Multi-Tenant Isolation** — N/A. No query scoping changes; the same already-org-scoped `paginatedProposals`/`paginatedQuotes` arrays are used, only their zero-length rendering path changes.
- **V. Simplicity & Phase-Driven Scope** — Pass. The fix reuses the exact pattern already implemented on 7 other pages instead of introducing a new abstraction; no speculative generalization (e.g., no new shared `<LandingTable>` wrapper) is introduced since the spec's scope is limited to matching existing majority behavior.

**Result**: No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/114-hide-header-empty-search/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `data-model.md` or `contracts/` are generated for this feature — it introduces no new entities, persisted fields, or API/interface contracts (see research.md for rationale).

### Source Code (repository root)

```text
app/
├── proposals/
│   └── page.tsx          # MODIFY: move empty-state check to wrap <Table>, hiding <THead> when empty
├── quotes/
│   └── page.tsx           # MODIFY: same restructuring as proposals
├── orders/page.tsx                       # VERIFY ONLY (already correct pattern)
├── invoices/page.tsx                     # VERIFY ONLY (already correct pattern)
├── shipments/page.tsx                    # VERIFY ONLY (already correct pattern)
├── purchase-orders/page.tsx              # VERIFY ONLY (already correct pattern)
├── supplier-bills/page.tsx               # VERIFY ONLY (already correct pattern)
├── inventory/page.tsx                    # VERIFY ONLY (already correct pattern)
└── products/ProductClientPage.tsx        # VERIFY ONLY (already correct pattern)

components/ui/
├── DataTable.tsx          # UNCHANGED — TableEmptyState/TableLoadingState reused as-is
└── Pagination.tsx         # UNCHANGED — already returns null when totalItems === 0
```

**Structure Decision**: This is a single Next.js project (no frontend/backend split). All changes are confined to two existing page components under `app/`; no new files, routes, or shared components are introduced, per the Simplicity principle and because the target pattern already exists and is proven on 7 sibling pages.

## Complexity Tracking

*No violations — table not needed.*
