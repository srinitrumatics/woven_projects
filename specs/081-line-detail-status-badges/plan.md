# Implementation Plan: Line Detail Status Badge Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify` git hook configured for this repo, consistent with `080-status-badge-audit`) | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/081-line-detail-status-badges/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The spec's grep sweep (grounded, not assumed) found **12 files** under `lines/[lineid]` folders that render a related record's primary status as raw, unstyled plain text (`{item.status}` / `{quote.status}` / etc.) — a different defect than `080-status-badge-audit` fixed, which targeted files with a *duplicate local color-mapping function*. These 12 have **no color logic at all**, local or shared. Two of the twelve (`LineFulfillmentsTab.tsx`, `LinePurchasesTab.tsx`) each render the plain-text status across multiple sub-tables in one file (4 and 2 respectively), for **17 total render sites**. The fix is purely additive: import `StatusBadge` from `components/ui/StatusBadge.tsx` and wrap each plain-text status expression, matching the `variant` convention already established on the closest in-page sibling for that module. No status vocabulary gaps are expected — every record type here (RMA, RTV, Credit Memo, Debit Memo, Purchase Order, Sales Order, Invoice, Shipping Manifest, Supplier Bill) already flows through the same shared switch statement successfully via files `080` already migrated — but this is confirmed via visual QA per file, not assumed.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing utility classes reused as-is via `StatusBadge`); no new packages

**Storage**: N/A — purely a presentational fix; no data, fetch, or status-computation logic changes anywhere

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`080` (no automated UI test suite exists)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls; wraps already-rendered text in an existing presentational component

**Constraints**:
- Every status value MUST render with the same color it already shows anywhere else in the app for that value (per the shared component's existing switch cases) — since these 12 files currently show *no* color at all, this is a pure visual addition, not a recolor, so there is no "previous color" to preserve for these specific sites. FR-003's zero-regression guarantee applies to the *already-compliant sibling files in the same folders* (e.g. `LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`), which this feature does not touch.
- If visual QA surfaces a status value that falls through to the shared component's gray default and that value has an obvious home in an existing color group (matching the same value's color elsewhere in the app), it MUST be added to that group in `components/ui/StatusBadge.tsx` per FR-004 — same precedent-wins rule `079`/`080` used. If no such match exists, document it and leave it gray rather than guessing.
- Secondary/derived status-like columns (`trackingStatus`, `invoiceStatus` in `LinePurchasesTab.tsx` and `QuoteLinePurchaseOrderLinesSubTab.tsx`) stay as plain text via `displayCell()`, matching the explicit out-of-scope precedent `080` already established for the sibling `Quote*SubTab.tsx` files — per spec FR-007.
- `variant` is chosen per closest in-page sibling, not a single blanket value:
  - `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`, `LinePurchasesTab.tsx` → `variant="compact"`, matching their direct sibling in the same folder, `LineReturnsTab.tsx` (already migrated by `080`, uses `"compact"` at all 5 of its sites).
  - `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` → `variant="pill"`, matching the already-compliant `app/invoices/[id]/lines/[lineid]/page.tsx` (product status badge on the same page).
  - The 9 `app/quotes/[id]/lines/[lineid]/components/QuoteLine*SubTab.tsx` files → no `variant` prop (defaults to `"bordered"`), matching the already-compliant `app/quotes/[id]/lines/[lineid]/page.tsx` (product status badge on the same page) — the top-level `app/quotes/[id]/components/Quote*SubTab.tsx` files use `"pill"`, but those belong to the *quote* detail page, not the *quote line* detail page these 9 files are tabs of, so the closer sibling wins per FR-006.
- No new shared component is introduced; only consumers change. `components/ui/StatusBadge.tsx` itself changes only if FR-004's status-gap case is triggered during QA.
- Once fixed, changes MUST be checked against the four tracked sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) following the diff-before-copy/typecheck/ask-before-commit process already established in project memory for `077`–`080`.

**Scale/Scope**: 12 files fixed, 17 total plain-text render sites wrapped in `<StatusBadge>`, 0 files expected to need a `components/ui/StatusBadge.tsx` vocabulary change (confirmed or refuted during Phase 3/tasks QA) + propagation check across 4 sibling folders.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No data-fetching, query, or status-value-computation changes anywhere — every touched file continues to render whatever status string it already receives as a prop; only the *rendering* of that string changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or data-mutation path; all touched files remain behind their existing auth/route protection, unchanged.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — presentational-only fix.
- **V. Simplicity & Phase-Driven Scope**: PASS. Direct continuation of the consolidation `077`–`080` already established; reuses the existing shared component with no new abstraction. Does not touch the explicitly out-of-scope secondary tracking/invoice-status columns (FR-007), and does not introduce a lint/CI rule to prevent future drift (would exceed this feature's scope, same rationale `080` used).

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/081-line-detail-status-badges/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature edits presentational components only; there is no request/response contract to document.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`.

```text
components/
└── ui/
    └── StatusBadge.tsx                                           # UNCHANGED unless Phase 3/tasks QA finds a
                                                                     # status value with no existing color-group
                                                                     # home (per FR-004) — not expected, but checked.

app/
├── proposals/[id]/lines/[lineid]/components/
│   ├── LineFulfillmentsTab.tsx                                    # wrap 4 plain-text sites (quote/sales-order/
│   │                                                                # invoice/shipping-manifest sub-tables) in
│   │                                                                # shared StatusBadge, variant="compact"
│   └── LinePurchasesTab.tsx                                        # wrap 2 plain-text sites (purchases, bills
│                                                                     # sub-tables) in shared StatusBadge,
│                                                                     # variant="compact"; leave trackingStatus/
│                                                                     # invoiceStatus columns as plain text (FR-007)
├── invoices/[id]/lines/[lineid]/components/
│   └── InvoiceLineCreditMemoTab.tsx                                # wrap 1 plain-text site in shared StatusBadge,
│                                                                     # variant="pill"
└── quotes/[id]/lines/[lineid]/components/
    ├── QuoteLineCreditMemoLinesSubTab.tsx                          # wrap 1 plain-text site, no variant (defaults
    │                                                                 # to "bordered", matching page.tsx sibling)
    ├── QuoteLineDebitMemoLinesSubTab.tsx                            # same
    ├── QuoteLineInvoiceLinesSubTab.tsx                              # same
    ├── QuoteLinePurchaseOrderLinesSubTab.tsx                        # same; leave trackingStatus/invoiceStatus
    │                                                                 # columns as plain text (FR-007)
    ├── QuoteLineRMALinesSubTab.tsx                                  # same
    ├── QuoteLineRTVLinesSubTab.tsx                                  # same
    ├── QuoteLineSalesOrderLinesSubTab.tsx                           # same
    ├── QuoteLineShippingManifestLinesSubTab.tsx                     # same
    └── QuoteLineSupplierBillLinesSubTab.tsx                         # same
```

**Structure Decision**: Single Next.js project. No new files or components. 12 existing consumer files each gain an import of the existing `StatusBadge` from `components/ui/StatusBadge.tsx` and wrap their plain-text status expression(s) with it — 17 render sites total. `components/ui/StatusBadge.tsx` itself is touched only if QA (Phase 3 of `tasks.md`) finds an unrecognized status value per FR-004; not expected, since every record type here already passes successfully through the same switch statement via files `080` migrated.

## Complexity Tracking

Not applicable — no violations.
