# Implementation Plan: Default Descending Table Sort & Fulfillment Tab Navigation Links

**Branch**: `010-table-sort-fulfillment-links` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-table-sort-fulfillment-links/spec.md`

## Summary

Two related UI improvements to the WOVN Client & Partner Portal:

1. **Default descending sort on all data tables**: ~43 files across the portal currently load with no sort order (or ascending). Adding `{ key: 'Name', direction: 'desc' }` as the default sort config ensures "latest first" behavior on initial load, without any user interaction. Two implementation patterns exist: (A) the `useSortableData` hook (majority of files — add a second argument), and (B) custom inline `useState` sort (quote/proposal detail pages — change initial `'asc'` → `'desc'`).

2. **Permission-aware navigation links in the Order Fulfillment tab**: The `FulfillmentTab.tsx` component displays 5 sub-tabs (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices). Entity name columns currently show plain text. This change adds clickable navigation links to Proposals, Quotes, Shipments, and Invoices sub-tabs, gated by the user's account type (same logic as the Sidebar). Sales Orders remain plain text (no portal route exists).

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 18

**Primary Dependencies**: `useSortableData` hook (`hooks/useSortableData.ts`), `useUserSession` context (`components/UserSessionContext.tsx`), `usePermissions` context (`components/PermissionContext.tsx`), Next.js `<Link>` component

**Storage**: N/A — pure client-side rendering change; no database or API changes

**Testing**: Manual browser validation per `quickstart.md`; `npm run build` for TypeScript compile check

**Target Platform**: Web browser (responsive)

**Project Type**: Next.js 15 web application (App Router, Client Components)

**Performance Goals**: No regression — sort is client-side and O(n log n); negligible impact for typical entity counts (< 1000 records per list)

**Constraints**: Sort must be session-only (not persisted); links must be gated by account type to avoid exposing hidden nav sections

**Scale/Scope**: ~43 files, ~51 targeted code changes. One file (`FulfillmentTab.tsx`) has both sort and link changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Salesforce as Single Source of Truth** | ✅ PASS | No new API calls, no business data writes. Data fetched unchanged; only display order changes. |
| **II. RBAC-First Feature Design** | ✅ PASS | FulfillmentTab links use account-type gating (`visibleFor` logic from Sidebar) + `isSuperAdmin` bypass. Consistent with existing RBAC patterns. |
| **III. Next.js 15 App Router Patterns** | ✅ PASS | All changes in existing Client Components. No route param changes. Uses Next.js `<Link>` for navigation. |
| **IV. Multi-Tenant Isolation** | ✅ PASS | No new data queries. Account type read from existing session context, org-scoped. |
| **V. Simplicity & Phase-Driven Scope** | ✅ PASS | Minimal targeted changes. No new abstractions. No speculative scope. |

*Post-design re-check: all gates still pass. No Complexity Tracking violations.*

## Project Structure

### Documentation (this feature)

```text
specs/010-table-sort-fulfillment-links/
├── plan.md              # This file
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 — N/A (pure UI, no new data models)
├── quickstart.md        # Phase 1 — validation scenarios
├── checklists/
│   └── requirements.md  # Spec quality checklist (all pass)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (Next.js App Router — this project)

```text
hooks/
└── useSortableData.ts   # No changes — existing hook API supports the feature

app/
├── orders/
│   ├── page.tsx                              # Add default sort (Pattern A)
│   └── [id]/components/
│       ├── FulfillmentTab.tsx                # Add default sort + navigation links
│       ├── FilesTab.tsx                      # Add default sort (Pattern A)
│       └── MyOrderTable.tsx                  # Add default sort (Pattern A)
├── proposals/
│   ├── [id]/
│   │   ├── page.tsx                          # Change sort directions Pattern B (5 states)
│   │   └── components/
│   │       ├── TaxesTab.tsx                  # Add default sort (Pattern A)
│   │       ├── PurchasesTab.tsx              # Add default sort (Pattern A, 2 calls)
│   │       ├── ReturnsTab.tsx                # Add default sort (Pattern A)
│   │       └── FulfillmentsTab.tsx           # Add default sort (Pattern A)
│   │   └── lines/[lineid]/components/
│   │       ├── LineReturnsTab.tsx            # Add default sort (Pattern A)
│   │       ├── LinePurchasesTab.tsx          # Add default sort (Pattern A, 2 calls)
│   │       └── LineFulfillmentsTab.tsx       # Add default sort (Pattern A)
├── quotes/
│   └── [id]/
│       ├── page.tsx                          # Change sort directions Pattern B (2 states)
│       ├── components/
│       │   ├── QuoteFilesTab.tsx             # Change sort direction Pattern B (1 state)
│       │   ├── QuoteFulfillmentTab.tsx       # Change sort directions Pattern B (3 states)
│       │   ├── QuoteReturnsTab.tsx           # Change sort directions Pattern B (4 states)
│       │   └── QuotePurchasesTab.tsx         # Change sort directions Pattern B (2 states)
│       └── lines/[lineid]/components/
│           ├── QuoteLineFilesTab.tsx         # Change sort direction Pattern B (1 state)
│           ├── QuoteLineReturnsTab.tsx       # Add default sort (Pattern A)
│           ├── QuoteLineFulfillmentsTab.tsx  # Add default sort (Pattern A)
│           ├── QuoteLinePurchasesTab.tsx     # Add default sort (Pattern A)
│           └── QuoteLineTaxesTab.tsx         # Add default sort (Pattern A)
├── shipments/
│   ├── page.tsx                              # Add default sort (Pattern A)
│   └── [id]/
│       ├── components/
│       │   ├── ShipmentFilesTab.tsx          # Add default sort (Pattern A)
│       │   ├── InventoryTab.tsx              # Change sort direction Pattern B (1 state)
│       │   └── SerialNumbersTab.tsx          # Change sort direction Pattern B (1 state)
│       └── lines/[lineid]/components/
│           ├── SerialNumbersTab.tsx          # Add default sort (Pattern A)
│           ├── InventoryTab.tsx              # Add default sort (Pattern A)
│           └── FilesTab.tsx                  # Add default sort (Pattern A)
├── invoices/
│   └── [id]/components/
│       ├── InvoiceLineItems.tsx              # Add default sort (Pattern A)
│       ├── InvoiceTaxes.tsx                  # Add default sort (Pattern A)
│       ├── InvoiceCredits.tsx                # Add default sort (Pattern A)
│       ├── InvoicePayments.tsx               # Add default sort (Pattern A, 2 calls)
│       └── InvoiceFilesTab.tsx               # Add default sort (Pattern A)
├── purchase-orders/
│   └── [id]/components/
│       ├── POLinesTable.tsx                  # Add default sort (Pattern A)
│       ├── PORTVTable.tsx                    # Add default sort (Pattern A)
│       ├── POSupplierBillsTable.tsx          # Add default sort (Pattern A)
│       ├── PODebitMemoTable.tsx              # Add default sort (Pattern A)
│       ├── POFilesTable.tsx                  # Add default sort (Pattern A)
│       └── POSerialNumbersTable.tsx          # Add default sort (Pattern A, verify)
├── supplier-bills/
│   └── [id]/components/
│       ├── SupplierBillDebitsTab.tsx         # Add default sort (Pattern A)
│       ├── SupplierBillLinesTable.tsx        # Add default sort (Pattern A)
│       ├── SupplierBillPaymentsTab.tsx       # Add default sort (Pattern A, 2 calls)
│       └── SupplierBillFilesTable.tsx        # Add default sort (Pattern A)
└── inventory/
    └── page.tsx                              # Add default sort (Pattern A)
```

**Structure Decision**: Next.js App Router layout (this project). All changes are within existing `app/` routes and `components/` — no new files created, no new routes added.

## Implementation Approach

### US1: Default Descending Sort

**Pattern A fix** (one-liner change per call):
```tsx
// Before
const { items: sortedX, requestSort, sortConfig } = useSortableData(data);
// After
const { items: sortedX, requestSort, sortConfig } = useSortableData(data, { key: 'Name', direction: 'desc' });
```
Exception: FulfillmentTab Proposals sub-tab uses `{ key: 'Proposal_Number__c', direction: 'desc' }`.

**Pattern B fix** (one-liner change per sort direction state):
```tsx
// Before
const [xSortDirection, setXSortDirection] = useState<'asc' | 'desc'>('asc');
// After
const [xSortDirection, setXSortDirection] = useState<'asc' | 'desc'>('desc');
```

### US2: FulfillmentTab Navigation Links

Add to top of `FulfillmentTab.tsx`:
```tsx
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";
import { usePermissions } from "@/components/PermissionContext";
```

Compute access inside the component:
```tsx
const { selectedAccount } = useUserSession();
const { isSuperAdmin } = usePermissions();
const accountType = selectedAccount?.Account_Record_Type__c || '';
const typeCategory = (['Customer', 'NSO'].includes(accountType)) ? 'Customer' :
    (accountType === 'Hybrid') ? 'Hybrid' : 'Partner';

const canLinkShipments = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory);
const canLinkInvoices  = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory);
const canLinkProposals = isSuperAdmin;   // visibleFor: [""] in Sidebar
const canLinkQuotes    = isSuperAdmin;   // visibleFor: [""] in Sidebar
```

Cell rendering pattern:
```tsx
// Proposal Number column cell
<td className={tdBoldClass}>
  {(canLinkProposals && prop.Id)
    ? <Link href={`/proposals/${prop.Id}`} className="text-primary hover:underline">{prop.Proposal_Number__c || "—"}</Link>
    : (prop.Proposal_Number__c || "—")}
</td>
```

## Complexity Tracking

> No constitution violations. This section is intentionally empty.
