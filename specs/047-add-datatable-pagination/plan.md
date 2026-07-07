# Implementation Plan: Add Pagination to Remaining Data Tables

**Branch**: `047-add-datatable-pagination` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/047-add-datatable-pagination/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Of the 88 files rendering the shared `SortableHeader` table pattern, 14 have zero pagination today (no `<Pagination>` component and no `currentPage` state). Six of those are taxes-breakdown tables, explicitly excluded by the request — leaving **8 tables in scope**: the six self-contained "Files" tabs (Invoice, Invoice Line, Order, Quote, Shipment, Shipment Line), one presentational "Files" tab (Proposal, sort state lifted to its parent), and one presentational "Projects" tab (Proposal). Every one of these 8 already has a near-identical sibling elsewhere in the codebase that already paginates correctly (outside the table's scroll container, per the fix already applied in `specs/044-table-scroll-pagination-fix`). The plan is to copy each sibling's exact local-pagination wiring onto its unpaginated twin — no new component, hook, or pattern is introduced.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (Next.js 15 App Router)

**Primary Dependencies**: existing `components/ui/Pagination.tsx` (shared component, already used by 69 of the 88 `SortableHeader` tables) and the existing `useSortableData` hook — no new dependencies

**Storage**: N/A — presentation-only change; pagination slices already-fetched, already-sorted in-memory arrays, no new queries or API changes

**Testing**: No automated UI test suite exists for these table components; validation is manual per `quickstart.md`, matching how `044-table-scroll-pagination-fix` and `046-remove-header-ellipsis` were verified in this repo

**Target Platform**: Web browser (desktop-focused data tables), both light and dark mode

**Project Type**: Existing single Next.js web application — frontend-only change (no `backend/`/`frontend/` split, no API/DB layer touched)

**Performance Goals**: N/A — client-side array slicing of already-loaded data, no measurable perf target

**Constraints**: Pagination controls must never sit inside a table's horizontal-scroll wrapper (per spec FR-005 and the precedent in `044-table-scroll-pagination-fix`); no changes to existing sort, resize, or sticky-column behavior; taxes-breakdown tables must remain untouched

**Scale/Scope**: 8 files touched, each a single self-contained edit copying an already-working sibling's pagination wiring; no shared component changes needed (unlike `046-remove-header-ellipsis`, this feature needs no changes to `SortableHeader.tsx` or `Pagination.tsx` themselves)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **UI Component Conventions** (Technology Stack Constraints): PASS and directly enforced — "Paginated list views MUST use the Pagination component (default 10 items per page)." This feature brings the last 8 non-taxes tables into compliance with that existing rule; it does not introduce any new UI pattern.
- **Principle V (Simplicity & Phase-Driven Scope)**: PASS — every target file gets the exact wiring already proven in a sibling file (`ITEMS_PER_PAGE = 10`, local `currentPage` state, a `useMemo` slice, and a `<Pagination>` render placed outside the scroll wrapper). No new abstraction, hook, or component is introduced; three similar lines (repeated per file) are preferred over a shared "paginated table" wrapper that nothing else in the codebase uses.
- **Principle III (Next.js App Router Patterns)**: N/A — no routing, params, or auth changes.
- Principles I, II, IV (Salesforce source of truth, RBAC, multi-tenant isolation): N/A — no data access, permission, or tenancy logic is touched; pagination only slices data already fetched and authorized upstream.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/047-add-datatable-pagination/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/ui/Pagination.tsx          # Existing shared component — reused as-is, no changes

# Self-contained tables (own sort state + own local pagination state) —
# follow app/purchase-orders/[id]/components/POFilesTable.tsx's exact pattern:
app/invoices/[id]/components/InvoiceFilesTab.tsx
app/invoices/[id]/lines/[lineid]/components/InvoiceLineFilesTab.tsx
app/orders/[id]/components/FilesTab.tsx
app/quotes/[id]/components/QuoteFilesTab.tsx
app/shipments/[id]/components/ShipmentFilesTab.tsx
app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx

# Presentational tables (sort state lifted to parent page, pagination added
# locally) — follow app/proposals/[id]/components/OrdersTab.tsx's exact pattern:
app/proposals/[id]/components/FilesTab.tsx
app/proposals/[id]/components/ProjectsTab.tsx

# Explicitly OUT of scope (taxes-breakdown tables, per FR-002):
app/invoices/[id]/components/InvoiceTaxes.tsx
app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx
app/orders/[id]/components/LineTaxesTab.tsx
app/orders/[id]/components/TaxesTab.tsx
app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx
app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx
```

**Structure Decision**: Existing single Next.js application (App Router) — no new directories, services, routes, or shared components. Each of the 8 in-scope files receives a self-contained edit that copies the exact pagination wiring already proven in its nearest sibling (`POFilesTable.tsx` for the six self-contained Files tabs, `OrdersTab.tsx` for the two presentational Proposal tabs), consistent with the constitution's "UI Component Conventions" requirement that paginated list views use the shared `Pagination` component at 10 items per page.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
