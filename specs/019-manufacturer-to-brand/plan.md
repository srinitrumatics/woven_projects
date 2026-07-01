# Implementation Plan: Replace Manufacturer with Brand Across All Tables

**Branch**: `019-manufacturer-to-brand` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-manufacturer-to-brand/spec.md`

## Summary

Relabel every "Manufacturer"/"Manufacturer DBA" table column to "Brand" across every list page, record-detail tab, and sub-tab in the portal, and repoint each column's data source to each Salesforce object's dedicated brand field where one exists. **Live schema research (Phase 0) found that only the base `Product2` object has a dedicated Brand field (`gtherp__Product_Brand_Name__c`) — no line-item object (Quote Line, Invoice Line, PO Line, Shipping Manifest Line, Supplier Bill Line, Order Line, RMA/RTV/Credit/Debit Memo Line, Sales Order Line) has an equivalent field today.** Per the user's explicit decision after reviewing this finding, the plan proceeds with the spec as written: the Order Product Catalog (the one view that reads `Product2` directly) shows a real Brand value; every other affected table renders "-" until a Salesforce admin adds Brand formula fields to the remaining line-item objects (tracked as a follow-up outside this repo). This is a pure frontend relabeling + data-mapping change across ~35 component/page files; no new routes, no schema changes, no permission changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `SortableHeader`, `useSortableData`, `useResizableColumns`, `displayCell()` — all existing in the codebase; no new dependencies

**Storage**: N/A — read-only Salesforce data via the generic `gtherp/generic/tab` Apex REST endpoint (`lib/proposal-service.ts`) and per-module `lib/*-service.ts` files; the endpoint returns whatever fields the Salesforce org exposes per object, so field availability must be confirmed per object (see research.md)

**Testing**: Visual/functional — run `npm run dev`, navigate to each affected module's list page and each detail-page tab/sub-tab, verify column label and displayed value

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — a label and field-name change adds no runtime overhead

**Constraints**: No new API routes; no new Apex/SF schema changes initiated from this repo (if a given object lacks a dedicated brand field, the column renders "-" rather than blocking on a backend schema change); all changes scoped to existing table-rendering files

**Scale/Scope**: ~35 files across 8 modules (Inventory, Products/Configure, Orders, Quotes, Invoices, Purchase Orders, Shipments, Supplier Bills) plus their nested line-detail pages and sub-tabs; excludes standalone edit/create forms and excludes unrelated `isManufacturer`/`Account_Record_Type__c === 'Manufacturer'` checks (a completely different concept — partner account type, not product brand) found in every list page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through existing `lib/*-service.ts` / generic tab endpoint; no new DB writes; field-name change only |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing gates untouched |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying existing client components only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Mechanical relabel + field-mapping swap across existing components; no new abstractions introduced |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The Phase 0 finding (most line-item objects lack a Brand field, so most tables will render "-") does not change any constitution gate — it's a data-availability fact about the existing Salesforce org, not a new write path, permission change, or architectural addition. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output — per-object Brand field availability findings
├── data-model.md        # Phase 1 output — full file inventory + field-mapping table per module
└── quickstart.md        # Phase 1 output — manual validation checklist per module

(no contracts/ — this feature exposes no new API routes or external interfaces;
 all changes are internal to existing page/component files)
```

### Source Code (repository root)

```text
app/
├── inventory/
│   └── page.tsx                              # list table: Manufacturer DBA → Brand
│       # (app/inventory/[id]/page.tsx confirmed out of scope — only an
│       #  Account_Record_Type__c === 'Manufacturer' check, no table column)
├── configure/page.tsx                        # Product configuration table: Manufacturer → Brand
├── orders/[id]/
│   ├── page.tsx                              # order data mapping + tooltip label (renders "-": no Brand field on Customer_Order_Line__c)
│   ├── components/MyOrderTable.tsx           # order line table (renders "-": no Brand field on Customer_Order_Line__c)
│   └── components/ProductCatalog.tsx         # product catalog card grid — reads Product2 directly, shows REAL gtherp__Product_Brand_Name__c value
├── quotes/[id]/
│   ├── page.tsx, components/QuoteLinesTab.tsx
│   └── lines/[lineid]/{page.tsx, components/QuoteLine*SubTab.tsx}   # ~11 sub-tab files
├── invoices/[id]/
│   ├── components/InvoiceLineItems.tsx
│   └── lines/[lineid]/{page.tsx, components/InvoiceLineCreditMemoTab.tsx}
├── purchase-orders/[id]/
│   ├── components/{POLinesTable.tsx, PODebitMemoTable.tsx, PORTVTable.tsx}
│   └── lines/[lineid]/{page.tsx, components/PODebitMemoLinesTab.tsx, PORtvLinesTab.tsx, POSupplierBillLinesTable.tsx}
├── shipments/[id]/
│   ├── components/{InventoryTab.tsx, ShipmentLinesTab.tsx}
│   └── lines/[lineid]/{components/InventoryTab.tsx, ProductInformationCard.tsx}
├── supplier-bills/[id]/
│   ├── components/SupplierBillLinesTable.tsx
│   └── lines/[lineid]/{page.tsx, components/SBLDebitMemoLinesTab.tsx}
└── proposals/[id]/lines/[lineid]/
    ├── page.tsx
    └── components/{LineFulfillmentsTab.tsx, LinePurchasesTab.tsx, LineReturnsTab.tsx}

# Explicitly OUT OF SCOPE (confirmed during research, do not touch):
#   - Every top-level list page's `isManufacturer` / `Account_Record_Type__c === 'Manufacturer'`
#     check (app/orders/page.tsx, app/invoices/page.tsx, app/quotes/page.tsx,
#     app/purchase-orders/page.tsx, app/shipments/page.tsx, app/supplier-bills/page.tsx,
#     app/proposals/page.tsx, app/home/page.tsx, app/program360/page.tsx) — this is a
#     partner-account-type flag, unrelated to product brand data.
#   - app/products/ProductClientPage.tsx `manufacturer` Algolia filter field — stores an
#     Account ID for supplier filtering, not a display column.
#   - Standalone edit/create forms and detail-panel labels (app/products/components/AddProductModal.tsx,
#     app/products/[id]/components/{EditProductTabs.tsx,ProductInfoCard.tsx,DatasheetsTab.tsx},
#     app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx) — per FR-006, out of scope.
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new directories). The full per-file field-mapping table (which SF field the "Brand" column reads for each object) lives in `data-model.md`, populated from the Phase 0 research findings.

## Complexity Tracking

No constitution violations — table not required.
