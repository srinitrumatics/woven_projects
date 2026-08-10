# Implementation Plan: Consistent, Generic "No Search Results" Message on Landing Pages

**Branch**: `wovn_mathu` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/120-search-empty-state-consistency/spec.md`

## Summary

Nine landing pages each render a "no results" empty state via the shared `TableEmptyState` component (`components/ui/DataTable.tsx`), but each passes its own hand-written `message`/`description` text, producing nine different strings for the same underlying situation — a search or filter matched zero rows. Two of them (Purchase Orders, Supplier Bills) additionally interpolate the user's literal search term into the description. The fix introduces two exported string constants next to `TableEmptyState` (`SEARCH_EMPTY_MESSAGE`, `SEARCH_EMPTY_DESCRIPTION`) and updates all nine call sites to use them for the "search/filter matched nothing" case, leaving each page's separate "dataset is genuinely empty" onboarding message untouched where one already exists. Two pages (Purchase Orders, Supplier Bills) also get their branch condition widened from `searchQuery` alone to `searchQuery || activeTab !== "All"` — matching the other seven pages — since spec FR-004 requires the unified message to apply to filter-only empty results too, not just search-only. `app/products/ProductClientPage.tsx`'s two views (CardView, ListView) — which don't already use the onboarding/search distinction and, in CardView's case, don't even use `TableEmptyState` — are brought onto the same shared constants and component.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router, client components)

**Primary Dependencies**: None new — reuses the existing `TableEmptyState` component (`components/ui/DataTable.tsx`)

**Storage**: N/A — no data model change (see `data-model.md`)

**Testing**: Manual/visual verification per `quickstart.md` (no existing automated test suite covers landing-page empty-state text, consistent with Constitution Principle V)

**Target Platform**: Web (all supported browsers/screen sizes), light and dark mode — `TableEmptyState` is already theme-aware

**Project Type**: Web application (Next.js App Router) — className/JSX/string-literal edits across existing client-component pages, plus two new exported constants

**Performance Goals**: N/A — no rendering, query, or data-fetching change; purely which string is displayed

**Constraints**: Must not change search/filter logic, loading-state messages, or the wording of the pre-existing "dataset is genuinely empty" onboarding message on the five pages that have one (Orders, Invoices, Quotes, Shipments, Proposals) or the two that have one under a narrower condition (Purchase Orders, Supplier Bills) (spec FR-005); must not introduce a new shared component — reuse `TableEmptyState` everywhere, including the two Products views that don't use it today (spec FR-006); the widened branch condition on Purchase Orders/Supplier Bills must not change which rows are filtered — only which message is shown when the result is empty

**Scale/Scope**: 10 files — 1 shared constants addition (`components/ui/DataTable.tsx`) + 9 call-site updates (`app/orders/page.tsx`, `app/invoices/page.tsx`, `app/quotes/page.tsx`, `app/shipments/page.tsx`, `app/proposals/page.tsx`, `app/purchase-orders/page.tsx`, `app/supplier-bills/page.tsx`, `app/inventory/page.tsx`, `app/products/ProductClientPage.tsx`). No new files, no schema/migration, no API route changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data reads/writes touched; purely which UI string is rendered when a query already returns zero rows.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gating around each landing page is untouched.
- **III. Next.js 15 App Router Patterns** — No route or param handling is touched. All nine pages remain client components with the same state/effects; only JSX literal props change.
- **IV. Multi-Tenant Isolation** — N/A. No data queries or org-scoping logic involved.
- **V. Simplicity & Phase-Driven Scope** — **Satisfied by design**: no new component is introduced; two plain string constants live alongside the `TableEmptyState` component they describe. The fix also *reduces* duplication — Products/CardView's bespoke inline empty-state `<div>` is replaced by the same shared `TableEmptyState` every other landing page already uses, consistent with the constitution's "UI Component Conventions" note that datatable landing pages should use shared components.

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/120-search-empty-state-consistency/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output — per-file inventory of every current empty-state string
├── data-model.md        # Phase 1 output — N/A, documented
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

No `contracts/` directory: this feature changes no API route, no external interface, and no component prop/contract — only existing JSX literal props (`message`, `description`) on already-rendered `<TableEmptyState>` elements, plus two new exported string constants.

### Source Code (repository root)

```text
components/ui/
└── DataTable.tsx                          # ADD: export const SEARCH_EMPTY_MESSAGE, SEARCH_EMPTY_DESCRIPTION
                                            #      (placed next to TableEmptyState, which they describe)

app/
├── orders/page.tsx                        # MODIFY: TableEmptyState message/description → shared constants
│                                           #         when searchQuery || activeTab !== "All"; onboarding
│                                           #         branch ("Get started by creating your first order")
│                                           #         unchanged
├── invoices/page.tsx                      # MODIFY: same pattern; onboarding text unchanged
├── quotes/page.tsx                        # MODIFY: same pattern; onboarding text unchanged
├── shipments/page.tsx                     # MODIFY: same pattern; onboarding text unchanged
├── proposals/page.tsx                     # MODIFY: same pattern; onboarding text unchanged
├── purchase-orders/page.tsx               # MODIFY: same pattern AND widen condition from
│                                           #         `searchQuery` to `searchQuery || activeTab !== "All"`;
│                                           #         removes the `We couldn't find any results matching
│                                           #         "${searchQuery}"...` interpolation entirely
├── supplier-bills/page.tsx                # MODIFY: same as purchase-orders/page.tsx
├── inventory/page.tsx                     # MODIFY: no onboarding/search distinction exists today —
│                                           #         replace the single always-shown message/description
│                                           #         with the shared constants unconditionally
└── products/ProductClientPage.tsx         # MODIFY: ListView's `<TableEmptyState message="No products
                                            #         found." />` → shared constants; CardView's bespoke
                                            #         inline `<div>No products found matching your
                                            #         criteria.</div>` → replaced with `<TableEmptyState>`
                                            #         using the same shared constants (removes the one
                                            #         landing page that bypassed the shared component)
```

**Structure Decision**: No new files or components. Every change is either a two-constant addition inside the file that already owns `TableEmptyState`, or a targeted JSX prop edit on an already-rendered `<TableEmptyState>` call (or, for Products/CardView, a replacement of a bespoke inline block with that same shared component). This matches the precedent set by `specs/118-datatable-link-weight/plan.md` for repo-wide, mechanical, per-file JSX/text normalization — no new abstraction, independent edits across a known file list.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
