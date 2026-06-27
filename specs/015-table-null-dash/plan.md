# Implementation Plan: Table Empty/Null Dash Display

**Branch**: `wovn_mathu` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-table-null-dash/spec.md`

## Summary

Replace blank/empty/null table cells across all main web app data tables with a "-" placeholder. The implementation extends the existing `lib/utils/formatting.ts` utility with a `displayCell` function and updates all ~94 table component files under `app/` (excluding admin portal). The formatting functions (`formatDate`, `formatTime`, `formatCurrency`, `formatNumber`) are also updated to return `"-"` instead of empty string or undefined output for null/invalid inputs.

## Technical Context

**Language/Version**: TypeScript, Next.js 15, React 18

**Primary Dependencies**: `lib/utils/formatting.ts` (existing), React JSX in `.tsx` components

**Storage**: N/A — presentation layer change only; no DB or Salesforce queries modified

**Testing**: Manual browser verification; no automated test suite configured for UI components

**Target Platform**: Web browser (main portal, all major browsers)

**Project Type**: Web Application (Next.js App Router)

**Performance Goals**: No performance impact; change is syntactic only

**Constraints**: Must not replace valid falsy values (`0`, `false`) with `"-"`; whitespace-only strings must be treated as empty; cells rendering React components (badges, links, buttons) are out of scope

**Scale/Scope**: ~94 `.tsx` table component files under `app/` (excludes `app/(admin-portal)/` and `app/admin/`); 1 utility file (`lib/utils/formatting.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | No Salesforce queries, service calls, or data access modified |
| II — RBAC-First Feature Design | ✅ PASS | No new UI surfaces; existing permission gates on all table pages are untouched |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes, no param unwrapping changes; modifying only cell rendering inside existing page components |
| IV — Multi-Tenant Isolation | ✅ PASS | No data access changes; formatting is purely client-side |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted presentation-layer fix; shared utility avoids repetition without adding abstractions beyond scope |
| UI Conventions | ✅ PASS | All in-scope tables already use `SortableHeader` + `useSortableData` + `useResizableColumns`; no changes to those patterns |

No violations. No complexity tracking entry required.

## Project Structure

### Documentation (this feature)

```text
specs/015-table-null-dash/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
lib/utils/
└── formatting.ts        # ADD: displayCell(); UPDATE: formatDate, formatTime, formatCurrency, formatNumber

app/
├── orders/
│   ├── page.tsx                              # UPDATE table cell rendering
│   └── [id]/
│       ├── page.tsx                          # UPDATE
│       └── components/
│           ├── MyOrderTable.tsx              # UPDATE
│           ├── FulfillmentTab.tsx            # UPDATE
│           ├── FilesTab.tsx                  # UPDATE
│           ├── LineTaxesTab.tsx              # UPDATE
│           ├── TaxesTab.tsx                  # UPDATE
│           └── ReturnsTab.tsx                # UPDATE
├── invoices/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── components/
│       │   ├── InvoiceLineItems.tsx          # UPDATE
│       │   ├── InvoicePayments.tsx           # UPDATE
│       │   ├── InvoiceTaxes.tsx              # UPDATE
│       │   ├── InvoiceCredits.tsx            # UPDATE
│       │   └── InvoiceFilesTab.tsx           # UPDATE
│       └── lines/[lineid]/components/
│           ├── InvoiceLineTaxesTab.tsx       # UPDATE
│           ├── InvoiceLineCreditMemoTab.tsx  # UPDATE
│           └── InvoiceLineFilesTab.tsx       # UPDATE
├── quotes/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── page.tsx                          # UPDATE
│       ├── components/ (~12 files)           # UPDATE all
│       └── lines/[lineid]/components/ (~12 files)  # UPDATE all
├── proposals/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── page.tsx                          # UPDATE
│       ├── components/ (~9 files)            # UPDATE all
│       └── lines/[lineid]/components/ (~4 files)  # UPDATE all
├── shipments/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── components/ (~4 files)            # UPDATE all
│       └── lines/[lineid]/components/ (~3 files)  # UPDATE all
├── supplier-bills/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── components/ (~4 files)            # UPDATE all
│       └── lines/[lineid]/components/ (~2 files)  # UPDATE all
├── purchase-orders/
│   ├── page.tsx                              # UPDATE
│   └── [id]/
│       ├── components/ (~7 files)            # UPDATE all
│       └── lines/[lineid]/components/ (~4 files)  # UPDATE all
├── inventory/
│   ├── page.tsx                              # UPDATE
│   └── [id]/page.tsx                        # UPDATE
└── products/
    └── ProductClientPage.tsx                 # UPDATE
```

**Structure Decision**: Single-project Next.js App Router. All changes are in two locations: the shared formatting utility (`lib/utils/formatting.ts`) and the table rendering components under `app/`. No new files beyond the spec artifacts.

## Complexity Tracking

> No Constitution Check violations. Table left blank intentionally.
