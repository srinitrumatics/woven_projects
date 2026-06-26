---
description: "Task list for Default Descending Table Sort & Fulfillment Tab Navigation Links"
---

# Tasks: Default Descending Table Sort & Fulfillment Tab Navigation Links

**Input**: Design documents from `/specs/010-table-sort-fulfillment-links/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Tests**: Not requested — manual validation via quickstart.md scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `app/api/` (API routes),
  `components/` (React components), `lib/` (services/utilities), `db/` (schema/migrations)

## Two Sort Fix Patterns (from research.md)

- **Pattern A**: Add second arg `{ key: 'Name', direction: 'desc' }` to `useSortableData(data)` call
- **Pattern B**: Change `useState<'asc' | 'desc'>('asc')` → `useState<'asc' | 'desc'>('desc')` for sort direction state

---

## Phase 1: Setup

**Purpose**: Branch and environment readiness.

- [X] T001 Check out branch `010-table-sort-fulfillment-links` (or create from main) and confirm `npm run build` passes cleanly before any changes

---

## Phase 2: Foundational

**Purpose**: No shared infrastructure changes required for this feature — all changes are in existing standalone Client Components with no shared dependencies.

*No foundational tasks needed. User stories can begin immediately after setup.*

**Checkpoint**: Both US1 and US2 can proceed independently after T001. US2 tasks T020–T024 must follow US1 task T005 (both modify `FulfillmentTab.tsx`).

---

## Phase 3: User Story 1 — Default Descending Sort on All Data Tables (Priority: P1) 🎯 MVP

**Goal**: Every list page and detail sub-table loads with the most recent records first, with no user interaction required.

**Independent Test**: Navigate to `/orders`, `/shipments`, and `/inventory` list pages and confirm records load sorted descending by name (no click needed, sort arrow visible). Open any Order detail page → Fulfillment tab and confirm all 5 sub-tables also sort descending.

### Group A — Main List Pages (3 files, all [P])

- [X] T002 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call at line 202 of `app/orders/page.tsx`
- [X] T003 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call at line 180 of `app/shipments/page.tsx`
- [X] T004 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call at line 133 of `app/inventory/page.tsx`

**Checkpoint**: List pages for Orders, Shipments, and Inventory now default to descending sort.

---

### Group B — Order Detail Sub-tables (3 files, all [P])

- [X] T005 [P] [US1] In `app/orders/[id]/components/FulfillmentTab.tsx` (lines 119–123), update all 5 `useSortableData` calls to add default sort configs: Proposals → `{ key: 'Proposal_Number__c', direction: 'desc' }`, Customer Quotes → `{ key: 'Name', direction: 'desc' }`, Sales Orders → `{ key: 'Name', direction: 'desc' }`, Shipping Manifests → `{ key: 'Name', direction: 'desc' }`, Invoices → `{ key: 'Name', direction: 'desc' }`
- [X] T006 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/orders/[id]/components/FilesTab.tsx` (line 47)
- [X] T007 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/orders/[id]/components/MyOrderTable.tsx` (line 44)

**Checkpoint**: All Order detail sub-tables default to descending sort.

---

### Group C — Proposal Detail Sub-tables — Pattern A (4 files, all [P])

- [X] T008 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/proposals/[id]/components/TaxesTab.tsx` (line 37)
- [X] T009 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to both `useSortableData` calls (lines 40 and 41) in `app/proposals/[id]/components/PurchasesTab.tsx`
- [X] T010 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/proposals/[id]/components/ReturnsTab.tsx` (line 47)
- [X] T011 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/proposals/[id]/components/FulfillmentsTab.tsx` (line 47)

---

### Group D — Proposal Line Detail Sub-tables — Pattern A (3 files, all [P])

- [X] T012 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` (line 50)
- [X] T013 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to both `useSortableData` calls (lines 28 and 29) in `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`
- [X] T014 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` (line 41)

---

### Group E — Proposal Detail Page — Pattern B (1 file)

- [X] T015 [P] [US1] In `app/proposals/[id]/page.tsx`, change the initial value of 5 sort direction `useState` calls from `"asc"` to `"desc"`: `elementSortDirection`, `productSortDirection`, `fileSortDirection`, `projectSortDirection`, `orderSortDirection`

**Checkpoint**: All Proposal detail sub-tables default to descending sort.

---

### Group F — Quote Detail Components — Pattern B (6 files, all [P])

- [X] T016 [P] [US1] In `app/quotes/[id]/page.tsx`, change initial value from `'asc'` to `'desc'` for `sortDirection` (line 43) and `taxSortDirection` (line 608) `useState` calls
- [X] T017 [P] [US1] In `app/quotes/[id]/components/QuoteFilesTab.tsx`, change initial sort direction `useState` value from `'asc'` to `'desc'` (line 18)
- [X] T018 [P] [US1] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`, change initial value from `'asc'` to `'desc'` for `salesSortDirection` (line 26), `manifestSortDirection` (line 30), and `invoiceSortDirection` (line 34) `useState` calls
- [X] T019 [P] [US1] In `app/quotes/[id]/components/QuoteReturnsTab.tsx`, change initial value from `'asc'` to `'desc'` for `rmaSortDirection` (line 41), `cmSortDirection` (line 45), `rtvSortDirection` (line 49), and `dmSortDirection` (line 53) `useState` calls
- [X] T020 [P] [US1] In `app/quotes/[id]/components/QuotePurchasesTab.tsx`, change initial value from `'asc'` to `'desc'` for `purchaseSortDirection` (line 27) and `billSortDirection` (line 31) `useState` calls
- [X] T021 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx`, change `direction: 'asc'` to `direction: 'desc'` in the `useState` sort config initial value (line 30)

---

### Group G — Quote Line Detail Sub-tables — Pattern A (4 files, all [P])

- [X] T022 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` (line 252)
- [X] T023 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx` (line 209)
- [X] T024 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx` (line 150)
- [X] T025 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx` (line 65)

**Checkpoint**: All Quote and Quote Line detail sub-tables default to descending sort.

---

### Group H — Shipment Detail Sub-tables — Pattern A and B (6 files, all [P])

- [X] T026 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/shipments/[id]/components/ShipmentFilesTab.tsx` (line 59)
- [X] T027 [P] [US1] In `app/shipments/[id]/components/InventoryTab.tsx`, change initial `sortDir` `useState` value from `"asc"` to `"desc"` (line 110)
- [X] T028 [P] [US1] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, change initial `sortDir` `useState` value from `"asc"` to `"desc"` (line 79)
- [X] T029 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` (line 69)
- [X] T030 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` (line 79)
- [X] T031 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx` (line 70)

**Checkpoint**: All Shipment detail sub-tables default to descending sort.

---

### Group I — Invoice Detail Sub-tables — Pattern A (5 files, all [P])

- [X] T032 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/invoices/[id]/components/InvoiceLineItems.tsx` (line 14)
- [X] T033 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/invoices/[id]/components/InvoiceTaxes.tsx` (line 44)
- [X] T034 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/invoices/[id]/components/InvoiceCredits.tsx` (line 19)
- [X] T035 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to both `useSortableData` calls (lines 25 and 26) in `app/invoices/[id]/components/InvoicePayments.tsx`
- [X] T036 [P] [US1] In `app/invoices/[id]/components/InvoiceFilesTab.tsx`, locate the `useSortableData` call and add `{ key: 'Name', direction: 'desc' }` as second arg

**Checkpoint**: All Invoice detail sub-tables default to descending sort.

---

### Group J — Purchase Order Detail Sub-tables — Pattern A (6 files, all [P])

- [X] T037 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/purchase-orders/[id]/components/POLinesTable.tsx` (line 53)
- [X] T038 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/purchase-orders/[id]/components/PORTVTable.tsx` (line 55)
- [X] T039 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx` (line 58)
- [X] T040 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/purchase-orders/[id]/components/PODebitMemoTable.tsx` (line 57)
- [X] T041 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/purchase-orders/[id]/components/POFilesTable.tsx` (line 44)
- [X] T042 [P] [US1] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, locate the `useSortableData` call and add `{ key: 'Name', direction: 'desc' }` as second arg

---

### Group K — Supplier Bill Detail Sub-tables — Pattern A (4 files, all [P])

- [X] T043 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx` (line 34)
- [X] T044 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/supplier-bills/[id]/components/SupplierBillLinesTable.tsx` (line 25)
- [X] T045 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to both `useSortableData` calls (lines 37 and 59) in `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx`
- [X] T046 [P] [US1] Add `{ key: 'Name', direction: 'desc' }` as second arg to `useSortableData` call in `app/supplier-bills/[id]/components/SupplierBillFilesTable.tsx` (line 32)

**Checkpoint**: All Supplier Bill detail sub-tables default to descending sort.

---

### US1 Build Check

- [X] T047 [US1] Run `npm run build` from repo root and confirm zero TypeScript errors after all Group A–K changes

**Checkpoint**: User Story 1 is fully implemented and TypeScript-verified. All ~43 files updated with default descending sort.

---

## Phase 4: User Story 2 — Permission-Aware Navigation Links in Fulfillment Tab (Priority: P2)

**Goal**: Entity name columns in Order Fulfillment sub-tabs render as clickable navigation links when the user's account type grants access to the destination section.

**Independent Test**: Open an Order detail → Fulfillment tab as a Customer account user. Verify Shipping Manifests and Invoices sub-tabs show clickable links; Proposals and Customer Quotes show plain text. As Super Admin, verify all 4 entity columns are links. Sales Orders remain plain text in all cases.

**Prerequisite**: T005 must be complete (FulfillmentTab.tsx sort changes must be applied before adding links).

- [X] T048 [US2] In `app/orders/[id]/components/FulfillmentTab.tsx`, add three imports at the top of the file: `import Link from "next/link"`, `import { useUserSession } from "@/components/UserSessionContext"`, and `import { usePermissions } from "@/components/PermissionContext"`
- [X] T049 [US2] In `app/orders/[id]/components/FulfillmentTab.tsx`, inside the `FulfillmentTab` component body (after the existing state declarations), add the account-type detection and link permission variables: destructure `selectedAccount` from `useUserSession()`, destructure `isSuperAdmin` from `usePermissions()`, compute `typeCategory` from `Account_Record_Type__c` using the same mapping as `Sidebar.tsx` (Customer/NSO → `'Customer'`, Hybrid → `'Hybrid'`, else → `'Partner'`), then set `const canLinkProposals = isSuperAdmin`, `const canLinkQuotes = isSuperAdmin`, `const canLinkShipments = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory)`, `const canLinkInvoices = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory)`
- [X] T050 [US2] In the Proposals sub-table of `app/orders/[id]/components/FulfillmentTab.tsx`, replace the plain `{prop.Proposal_Number__c || "—"}` cell content with a conditional: when `canLinkProposals && prop.Id` is truthy render `<Link href={/proposals/${prop.Id}} className="text-primary hover:underline">{prop.Proposal_Number__c || "—"}</Link>`, otherwise render the plain string
- [X] T051 [US2] In the Customer Quotes sub-table of `app/orders/[id]/components/FulfillmentTab.tsx`, replace the plain `{cq.Name || "—"}` cell content (first `<td className={tdBoldClass}>` in the Customer Quotes row) with a conditional: when `canLinkQuotes && cq.Id` render `<Link href={/quotes/${cq.Id}} className="text-primary hover:underline">{cq.Name || "—"}</Link>`, otherwise plain string
- [X] T052 [US2] In the Shipping Manifests sub-table of `app/orders/[id]/components/FulfillmentTab.tsx`, replace the plain `{sm.Name || "—"}` cell content (first `<td className={tdBoldClass}>` in the Manifests row) with a conditional: when `canLinkShipments && sm.Id` render `<Link href={/shipments/${sm.Id}} className="text-primary hover:underline">{sm.Name || "—"}</Link>`, otherwise plain string
- [X] T053 [US2] In the Invoices sub-table of `app/orders/[id]/components/FulfillmentTab.tsx`, replace the plain `{inv.Name || "—"}` cell content (first `<td className={tdBoldClass}>` in the Invoices row) with a conditional: when `canLinkInvoices && inv.Id` render `<Link href={/invoices/${inv.Id}} className="text-primary hover:underline">{inv.Name || "—"}</Link>`, otherwise plain string

**Checkpoint**: Both User Stories 1 and 2 are fully implemented. All FulfillmentTab entity name columns are conditionally linked based on account type.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final build verification and quickstart validation.

- [X] T054 Run `npm run build` from repo root to confirm no TypeScript errors across all US1 and US2 changes combined
- [ ] T055 [P] Validate Scenarios 1–3 from `specs/010-table-sort-fulfillment-links/quickstart.md` (default sort on list pages and Fulfillment sub-tables)
- [ ] T056 [P] Validate Scenarios 4–6 from `specs/010-table-sort-fulfillment-links/quickstart.md` (FulfillmentTab links for Customer, Super Admin, and edge cases)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 3)**: Depends on T001 (branch exists). All Groups A–K are independent of each other and can run fully in parallel
- **US2 (Phase 4)**: Depends on T047 (US1 build passes) and specifically T005 (FulfillmentTab.tsx must have sort changes before link changes are added)
- **Polish (Phase 5)**: Depends on T053 (US2 complete). T055 and T056 can run in parallel

### User Story Dependencies

- **US1 (P1)**: Can start immediately after T001 — no dependencies on US2
- **US2 (P2)**: Must start after US1 is fully complete (T047 passes). US2 tasks (T048–T053) are sequential — each builds on the previous within the same file

### Parallel Opportunities

All T002–T046 tasks are parallelizable — each modifies a different file:

```bash
# Example: run all main list page fixes simultaneously
Task: T002 — app/orders/page.tsx
Task: T003 — app/shipments/page.tsx
Task: T004 — app/inventory/page.tsx

# Example: all invoice detail fixes simultaneously
Task: T032 — InvoiceLineItems.tsx
Task: T033 — InvoiceTaxes.tsx
Task: T034 — InvoiceCredits.tsx
Task: T035 — InvoicePayments.tsx
Task: T036 — InvoiceFilesTab.tsx
```

US2 tasks T048–T053 must run **sequentially** (all modify the same file):
```
T048 (imports) → T049 (permission vars) → T050 (Proposals) → T051 (Quotes) → T052 (Manifests) → T053 (Invoices)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: Setup
2. T002–T007: Fix main list pages + Order detail sub-tables (visible on Orders section)
3. T047: Build check
4. **STOP and VALIDATE**: Open `/orders` and verify descending sort. Open any Order → Fulfillment tab and verify sub-tables sort descending.

### Incremental Delivery

1. T001 Setup → T002–T046 all-parallel sort fixes → T047 build check → **US1 complete**
2. T048–T053 FulfillmentTab links (sequential) → T054 build check → **US2 complete**
3. T055–T056 validation → **Feature complete**

### Parallel Team Strategy

With multiple developers:
- Developer A: Groups A–C (main list pages + Order/Proposal detail)
- Developer B: Groups D–G (Proposal line + Quote detail)
- Developer C: Groups H–K (Shipment + Invoice + PO + SB detail)
- All merge to branch → T047 build check → Developer A adds links (T048–T053) → done

---

## Notes

- `[P]` tasks T002–T046 all touch different files — no merge conflicts if worked in parallel
- Pattern A changes are one-liner additions; Pattern B changes require locating specific `useState` initializers
- T005 modifies FulfillmentTab.tsx for US1; T048–T053 also modify FulfillmentTab.tsx for US2 — coordinate to avoid conflicts
- `canLinkProposals` and `canLinkQuotes` are Super Admin–only because `visibleFor: [""]` in Sidebar.tsx hides Proposals/Quotes from all regular users
- Sales Order # column (US2) is intentionally excluded — no `/sales-orders/` route exists in the portal
- `npm run build` (T047 and T054) serves as the TypeScript compile check — no separate test suite runs required
