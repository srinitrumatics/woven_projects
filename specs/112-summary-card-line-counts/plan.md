# Implementation Plan: Fix Products/Services Line Counts in Detail Page Summary Cards

**Branch**: `112-summary-card-line-counts` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/112-summary-card-line-counts/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Four of six detail-page Summary cards (Customer Order, Customer Quote, Invoice, Supplier Bill) miscount their Products/Services line split; Purchase Order and Proposal already do it correctly and serve as the reference implementation. Live verification against the Salesforce-backed dev server (documented in `research.md`) found that every line type in scope — Order, Quote, Invoice, Supplier Bill, and both reference types — exposes the same `Product_Record_Type__c` field, and that the document-level "service" rollup fields the current Quote and Supplier Bill code reads (`Total_Services_Lines__c`, `Total_Service_Lines__c`, `Total_Product_Lines__c`) are `undefined` in the live API — meaning those two pages' Services numbers are already effectively as broken as Invoice's hardcoded `0`, just via a silent fallback rather than a literal constant. The fix is uniform: read `Product_Record_Type__c` on each line, treat `=== 'Services'` as a service line, derive Products by subtracting the service lines from the total (matching the confirmed-correct Purchase Order pattern exactly), and add the missing Services row to Customer Order's summary card. No schema change, no new Salesforce configuration, no shared abstraction — each page's fix is applied at its existing data-mapping location, matching the two reference pages' existing self-contained style.

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router)

**Primary Dependencies**: None new. Touches existing page components (`app/orders/[id]/OrderClientPage.tsx`, `app/quotes/[id]/page.tsx`, `app/invoices/[id]/page.tsx`, `app/supplier-bills/[id]/page.tsx`) and their existing Summary sub-components (`OrderTotal.tsx`, `QuoteSummary.tsx`, `InvoiceSummary.tsx`/`InvoiceDetails.tsx`, `SupplierBillSummary.tsx`) plus the corresponding `types.ts` files for each domain.

**Storage**: N/A — no PostgreSQL schema change, no Salesforce-side change. The Salesforce field this fix depends on (`Product_Record_Type__c`) already exists on every line object in scope and is already read successfully by the two reference pages.

**Testing**: No automated UI/data-mapping test suite exists in this repo (consistent with `110`/`111`'s plans). Verification is `npx tsc --noEmit` plus manual/live browser verification against the Salesforce-backed dev server, per `quickstart.md`.

**Target Platform**: Web (Next.js client components, evergreen browsers, light/dark mode) — unchanged.

**Project Type**: Web application (single Next.js app, no separate frontend/backend split).

**Performance Goals**: N/A — this is a data-mapping correction (filter + sum over an already-fetched, already-small line array); no new network calls, no measurable performance change.

**Constraints**: Purchase Order's and Proposal's summary cards MUST NOT change behavior (spec FR-006, SC-005) — neither `POSummary.tsx` nor `ProposalSummary.tsx` is touched. Every fixed page MUST satisfy Products-count + Services-count = total line count, and Products-subtotal + Services-subtotal = overall lines subtotal (spec FR-005), for every document including ones with zero service lines.

**Scale/Scope**: 4 pages fixed (Order, Quote, Invoice, Supplier Bill), each touching 1 page file + 1 types file + (for Order and Quote) 1 summary-component file. Invoice and Supplier Bill's summary components (`InvoiceSummary.tsx`/`InvoiceDetails.tsx`, `SupplierBillSummary.tsx`) need no changes — only the values computed for their existing props are wrong today. No new files, no new routes, no schema changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — Satisfied. No new SOQL/query construction is introduced; every line-fetch call already exists and is already encapsulated in the same `app/*/[id]/page.tsx` files that build the mapped objects today (consistent with how the two reference pages already work). This fix only adds one additional field (`Product_Record_Type__c`, already present in each endpoint's response) to existing per-line mapping code, and derives Products/Services from it — no new Salesforce write, no new endpoint.
- **II. RBAC-First Feature Design** — N/A. No permission surface changes; the Summary cards are already gated by whatever page-level auth each detail page already enforces, unchanged by this fix.
- **III. Next.js 15 App Router Patterns** — Satisfied. No route params, no new routes/API routes; all changes are within existing page/component files.
- **IV. Multi-Tenant Isolation** — N/A. No change to org/account-scoping logic; `Product_Record_Type__c` is a product-level field orthogonal to tenant isolation.
- **V. Simplicity & Phase-Driven Scope** — Satisfied. Per `research.md` Decision 3, the fix is applied inline at each page's existing data-mapping location, matching the two reference implementations' existing self-contained style — no new shared "line splitter" utility is introduced (both reference pages already independently inline this exact logic, so a new abstraction now would be inconsistent with the established pattern and disproportionate to a 4-line calculation repeated four times).

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/112-summary-card-line-counts/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command) — live-verified field shapes, 4 decisions
├── data-model.md         # Phase 1 output (/speckit-plan command) — per-page change inventory
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this fix has no external API, CLI, or service contract; it only
changes how existing, already-fetched Salesforce data is filtered and summed on four pages.

### Source Code (repository root)

```text
app/orders/
├── types.ts                                  # Product interface — add productRecordType?: string
├── [id]/OrderClientPage.tsx                   # line-mapping + productsSubtotal split + OrderTotal props
└── [id]/components/OrderTotal.tsx             # new Services row + serviceCount/servicesSubtotal props

app/quotes/
├── types.ts                                   # QuoteLine interface — add productRecordType?: string
└── [id]/
    ├── page.tsx                                # line-mapping (add productRecordType)
    └── components/QuoteSummary.tsx             # filter/derive Products vs Services from lines prop

app/invoices/
├── types.ts                                    # InvoiceLine interface — add productRecordType?: string
└── [id]/page.tsx                               # line-mapping + productsSubtotal/servicesSubtotal + render call site
    # InvoiceSummary.tsx / InvoiceDetails.tsx: no changes — only the prop values passed in are fixed

app/supplier-bills/
├── types.ts                                     # SupplierBillLine interface — add productRecordType?: string
└── [id]/page.tsx                                # line-mapping + post-fetch bill-state correction
    # SupplierBillSummary.tsx: no changes — only the bill.* values are fixed

app/purchase-orders/[id]/components/POSummary.tsx        # reference implementation — untouched
app/proposals/[id]/components/ProposalSummary.tsx         # reference implementation — untouched
```

**Structure Decision**: Single Next.js application (App Router), per `CLAUDE.md` and the
constitution's fixed technology stack. This is a cross-cutting but purely presentational/data-mapping
correction across four existing `app/*/[id]/` detail pages and their `types.ts` files — no new
directories, routes, services, or schema are introduced. The full per-page change inventory,
including exact line numbers and current vs. fixed values, is in `data-model.md`.

## Complexity Tracking

*No constitution violations — this section is not applicable.*
