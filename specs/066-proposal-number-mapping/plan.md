# Implementation Plan: Proposal # Columns Show the Proposal Number, Not the Name

**Branch**: `wovn_mathu` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/066-proposal-number-mapping/spec.md`

## Summary

Multiple list/table pages across the web app label a column "Proposal #" but bind it to the same value as the adjacent "Proposal Name" column (or to a field name that doesn't resolve and silently falls back to Name). The fix is a data-mapping correction: fetch Salesforce's `Proposal_Number__c` field wherever a "Proposal #" column exists, map it into the row objects used by each affected page/component, and bind the "Proposal #" cell to that value (falling back to Name only when the number is unset) — matching the pattern already implemented correctly in `app/proposals/page.tsx` and `app/proposals/[id]/page.tsx`.

## Technical Context

**Language/Version**: TypeScript 5, React 19

**Primary Dependencies**: Next.js 15 (App Router), `lib/salesforce-service.ts` (SOQL access), existing `components/ui/DataTable.tsx` primitives

**Storage**: N/A (no schema or DB change — Salesforce is the source, PostgreSQL is untouched)

**Testing**: Manual verification via `npx tsc --noEmit` plus visual/table inspection (no automated test suite exists for these pages today)

**Target Platform**: Web (Next.js SSR/CSR), existing browsers supported by the portal

**Project Type**: Web application (existing Next.js monorepo-style app; no new project/module)

**Performance Goals**: N/A — same query shape, one additional selected field per existing SOQL query; no measurable performance change expected

**Constraints**: Must not change Salesforce schema; must not alter existing sort/link behavior keyed on proposal Id or Name; must not regress the already-correct pages

**Scale/Scope**: ~15 files across 7 feature areas (quotes, invoices, purchase orders, supplier bills, shipments, orders, proposal-detail sub-tabs)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — PASS. This feature only adds `Proposal_Number__c` to existing SOQL queries already encapsulated in `lib/*-service.ts` files; no raw queries are added to pages/API routes, and no business data is ever written back to PostgreSQL.
- **II. RBAC-First Feature Design** — PASS (N/A). No new functionality is exposed; this is a display/mapping correction on already-permission-gated pages. No new permission gates are needed.
- **III. Next.js 15 App Router Patterns** — PASS (N/A). No new routes, no param handling changes.
- **IV. Multi-Tenant Isolation** — PASS. The additional field is fetched through the same org-scoped service calls already in place; no cross-org query paths are introduced.
- **V. Simplicity & Phase-Driven Scope** — PASS. The fix is a targeted field-mapping/display correction, applied consistently using the existing `Proposal_Number__c || Name` fallback pattern already proven in the codebase — no new abstractions introduced.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/066-proposal-number-mapping/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

(No `contracts/` directory: this feature exposes no new API/interface contract — it corrects an existing internal data-mapping/display binding.)

### Source Code (repository root)

**Structure Decision**: Existing single Next.js App Router project (`app/`, `lib/`, `components/`). No new directories. Changes are confined to:

```text
lib/
├── quote-service.ts              # (or wherever quote list/detail SOQL lives) — add Proposal_Number__c to SELECT + mapping
├── invoice-service.ts            # add Proposal_Number__c to SELECT + mapping
├── purchase-order-service.ts     # fix Proposal_Number → Proposal_Number__c
├── supplier-bill-service.ts      # fix Proposal_Number → Proposal_Number__c
├── shipment-service.ts           # fix Proposal_Number → Proposal_Number__c
├── order-service.ts              # add Proposal_Number__c to SELECT + mapping
└── proposal-service.ts           # (reference only — already correct; no change)

app/
├── quotes/page.tsx                                              # bind "Proposal #" cell to mapped number
├── quotes/[id]/page.tsx                                         # map Proposal_Number__c into row objects
├── quotes/[id]/components/QuoteInvoicesSubTab.tsx               # bind cell to mapped field
├── quotes/[id]/components/QuoteCreditMemoSubTab.tsx             # bind cell to mapped field
├── quotes/[id]/components/QuoteRMASubTab.tsx                    # bind cell to mapped field
├── quotes/[id]/components/QuoteSalesOrdersSubTab.tsx            # bind cell to mapped field
├── quotes/[id]/components/QuoteShippingManifestsSubTab.tsx      # bind cell to mapped field
├── invoices/page.tsx                                            # fix field name reference
├── invoices/[id]/page.tsx                                       # map Proposal_Number__c into row objects
├── invoices/[id]/components/InvoiceCredits.tsx                  # bind cell to mapped field
├── purchase-orders/page.tsx                                     # fix field name reference
├── purchase-orders/[id]/components/PODebitMemoTable.tsx         # fix field name reference
├── purchase-orders/[id]/components/PORTVTable.tsx               # fix field name reference
├── purchase-orders/[id]/components/POSupplierBillsTable.tsx     # fix field name reference
├── supplier-bills/page.tsx                                      # fix field name reference
├── supplier-bills/[id]/components/SupplierBillDebitsTab.tsx     # fix field name reference
├── shipments/page.tsx                                           # fix field name reference
├── orders/page.tsx                                              # map Proposal_Number__c into row objects, bind cell
├── proposals/[id]/page.tsx                                      # map Proposal_Number__c for sub-tab child records
├── proposals/[id]/components/ReturnsTab.tsx                     # bind cell to mapped field
└── proposals/[id]/components/FulfillmentsTab.tsx                # bind cell to mapped field (4 sub-tables)
```

Exact service file names/locations will be confirmed at implementation time (task list) against the actual `lib/*-service.ts` files — the list above reflects the domain grouping identified during spec research, not a guaranteed 1:1 file map.

## Complexity Tracking

*No violations — table not needed.*
