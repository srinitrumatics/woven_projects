# Implementation Plan: Consistent Bold Hyperlinks in All Datatables

**Branch**: `118-datatable-link-weight` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/118-datatable-link-weight/spec.md`

## Summary

Every hyperlink inside a datatable cell (list-page record links and detail-page cross-reference links) must render at font-weight 600 (`font-semibold`). An exhaustive inventory (`research.md`) found 212 in-table hyperlink instances across ~60 files; ~176 need a className change. The dominant pattern is a single literal string, `text-primary hover:underline font-medium`, appearing in well over 100 instances across the Quotes/Purchase Orders/Supplier Bills/Shipments/Invoices detail-tab components — this is fixed via a scoped literal find-and-replace across the identified files. The remaining ~25 outliers (`font-bold` cases, links with no explicit weight anywhere, weight applied to a parent `Td`/sibling `<div>` instead of the link) are fixed individually. No shared component is introduced (see `research.md` for why that doesn't reduce the file-touch count here).

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React (client components)

**Primary Dependencies**: Tailwind CSS (utility classes only — no new dependency)

**Storage**: N/A — no data model change (see `data-model.md`)

**Testing**: Manual/visual verification per `quickstart.md`, plus `npx tsc --noEmit` as a static sanity check (no existing automated test suite covers `app/**` table styling — consistent with Constitution Principle V)

**Target Platform**: Web (all supported desktop and mobile browsers/screen sizes), light and dark mode

**Project Type**: Web application (Next.js App Router) — className-only edits across existing page/tab components

**Performance Goals**: N/A — purely visual/styling fix, no runtime performance implications

**Constraints**: Must not change link color, underline behavior, truncation, spacing, or click target/behavior (spec FR-004); must not affect non-table hyperlinks or non-link table content (spec FR-005, FR-006)

**Scale/Scope**: ~176 className edits across ~60 files spanning Orders, Proposals, Quotes, Invoices, Purchase Orders, Supplier Bills, Shipments, Inventory, and Products (list pages, detail pages, and line-item detail pages) — see `research.md` for the full per-object-type breakdown. No admin-portal changes needed (no in-table hyperlinks exist there).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data reads/writes involved; this is a presentational CSS fix.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gating around the affected pages is untouched.
- **III. Next.js 15 App Router Patterns** — No route or param handling is touched. All affected components remain unchanged in structure/exports; only Tailwind className strings change.
- **IV. Multi-Tenant Isolation** — N/A. No data queries involved.
- **V. Simplicity & Phase-Driven Scope** — **Satisfied by design**: no new shared component or abstraction is introduced (see `research.md` for why that wouldn't reduce the file-touch count for this fix); the dominant repeated pattern is fixed via a single scoped literal find-and-replace rather than 150 individual manual edits, while genuine outliers get individual review — proportionate effort for a mechanical className normalization.

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/118-datatable-link-weight/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command) — full per-file inventory
├── data-model.md         # Phase 1 output (/speckit-plan command) — N/A, documented
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is generated for this feature: it changes no API route, no external interface, and no component prop/contract — only existing Tailwind className strings on already-rendered `<Link>` elements.

### Source Code (repository root)

```text
app/
├── orders/
│   ├── page.tsx                                              # 2 links, already correct — no change
│   └── [id]/components/
│       ├── FulfillmentTab.tsx                                # 11 links — mix of font-medium (parent Td) and no-weight, all → font-semibold
│       ├── MyOrderTable.tsx                                  # already correct
│       ├── ProductCatalog.tsx                                # 1 link — font-medium (wrapper div) → font-semibold
│       └── ReturnsTab.tsx                                    # 6 links — no explicit weight → add font-semibold
├── proposals/
│   ├── page.tsx                                               # already correct (via parent Td)
│   └── [id]/{components,lines/[lineid]/components}/           # 57 links already correct; ProductsTab.tsx has 1 font-bold + 1 no-weight outlier
├── quotes/
│   ├── page.tsx                                               # 2 links font-medium → font-semibold
│   └── [id]/{components,lines/[lineid]/components}/           # ~49 links font-medium → font-semibold (bulk literal replace); 4 font-bold outliers
├── invoices/
│   ├── page.tsx                                               # 3 links font-medium → font-semibold
│   └── [id]/{components,lines/[lineid]/components}/           # 9 links font-medium → font-semibold; 1 font-bold-via-parent outlier
├── purchase-orders/
│   ├── page.tsx                                               # 3 links font-medium → font-semibold
│   └── [id]/{components,lines/[lineid]/components}/           # 30 links font-medium → font-semibold (bulk literal replace)
├── supplier-bills/
│   ├── page.tsx                                               # already correct (via parent Td)
│   └── [id]/{components,lines/[lineid]/components}/           # 10 links font-medium → font-semibold
├── shipments/
│   ├── page.tsx                                               # 3 links font-medium → font-semibold
│   └── [id]/{components,lines/[lineid]/components}/           # 10 links font-medium → font-semibold
├── inventory/page.tsx                                         # 1 link, cosmetic — add font-semibold directly to link for robustness
└── products/ProductClientPage.tsx                             # 1 link — font-bold on sibling div → font-semibold on link, remove font-bold from div
```

**Structure Decision**: No new files or shared components. Every change is a targeted Tailwind className edit on an existing `<Link>` element (or, for the handful of outliers, the removal of a conflicting weight class from a parent/sibling element) across the ~60 files enumerated in `research.md`. This matches the precedent set by `specs/115-align-tab-content-padding/plan.md` for repo-wide Tailwind class normalization: independent, mechanical, per-file edits rather than a new abstraction.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
