---

description: "Task list for feature 066: Proposal # columns show the Proposal Number, not the Name"
---

# Tasks: Proposal # Columns Show the Proposal Number, Not the Name

**Input**: Design documents from `/specs/066-proposal-number-mapping/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested for this feature (no automated test suite exists for these pages today). Verification is via `tsc --noEmit` and manual walkthrough of `quickstart.md`.

**Organization**: This feature has a single user story (US1 — P1). Tasks are grouped by domain area (quotes, invoices, purchase orders, supplier bills, shipments, orders, proposal detail sub-tabs) since each domain is an independently touchable, non-overlapping set of files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependency on another incomplete task)
- **[US1]**: Belongs to User Story 1 (the feature's only user story)
- Every task lists the exact file(s) to change and the exact current code (from `research.md` §"Two distinct root causes") that must be corrected

## Shared fix pattern (applies to every task below)

Replace whatever currently feeds the "Proposal #" column's header `field` prop and cell render with a value computed as:

```ts
proposalNumber: <raw>.Proposal_Number__c || <raw's existing Name-fallback chain>
```

- If the file currently has **no** number field at all → add this mapping.
- If the file currently references `Proposal_Number` (missing the Salesforce `__c` suffix) → correct it to `Proposal_Number__c`, keeping the existing `|| Name` fallback after it.
- Never remove or rename the existing "Proposal Name" column's own field/binding (`proposalName`, `Proposal_Name`, etc.) — it must keep showing the Name, unchanged.
- Never remove or rename any existing `proposalId`/`Proposal__c` usage that other logic (links, `<Link href=.../proposals/${id}>`) depends on.

No task changes any `lib/*-service.ts` or `app/api/**` file — per `research.md`, these proxy a generic Salesforce Apex REST endpoint with no field list present in this repo (see Notes below).

---

## Phase 3: User Story 1 - Proposal # shows the Proposal Number everywhere (Priority: P1) 🎯 MVP

**Goal**: Every "Proposal #" table column across the web app displays the Salesforce `Proposal_Number__c` value (e.g. `PRP-26-04-000494`), falling back to the proposal Name only when the number is blank — no longer duplicating the adjacent "Proposal Name" column.

**Independent Test**: Follow `quickstart.md` — for each of the 8 listed pages, confirm "Proposal #" and "Proposal Name" show distinct values for any row with both populated.

### Quotes domain

- [X] T001 [P] [US1] Fix `app/quotes/page.tsx`: line 75 currently only sets `proposalName: item.Proposal_Name || 'N/A'` (no number field, despite `widths.proposalNumber` already existing at line 32). Add `proposalNumber: item.Proposal_Number__c || item.Proposal_Name || 'N/A',` to the same mapped object. Rebind the "Proposal #" header (line 467, currently `field="proposalName"`) and its cell (lines 519-538, currently rendering `quote.proposalName`) to the new `proposalNumber` field. Leave the adjacent "Proposal Name" column (line 468, cells 539-541) rendering `quote.proposalName` unchanged.
- [X] T002 [P] [US1] Fix `app/quotes/[id]/page.tsx`: add a `proposalNumber` field (using the fallback pattern above) alongside each existing `proposalName` assignment: line 190 (main details, `item.Proposal_Name`), line 306 (fulfillment invoices, `inv.Proposal_Name`), line 338 (shippingManifests, `sm.Proposal_Name`), line 369 (salesOrders, `so.Proposal_Name`), line 462 (rma, `r.Proposal_Name`), line 523 (creditMemos, `c.Proposal_Name`). Update the corresponding TypeScript interfaces/types for these mapped objects to include the new `proposalNumber` field so downstream sub-tab components (T003-T007) can consume it.
- [X] T003 [US1] Fix `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx` (depends on T002): rebind header at line 67 (currently `field="proposalName"`) and cell at lines 113-121 (currently rendering `invoice.proposalName`) to the new `invoice.proposalNumber` field. Leave the "Proposal Name" column (line 68, cell 122-124) unchanged.
- [X] T004 [US1] Fix `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx` (depends on T002): rebind header at line 67 and cell at lines 112-120 (currently `memo.proposalName`) to `memo.proposalNumber`. Leave "Proposal Name" column (line 68, cell 121-123) unchanged.
- [X] T005 [US1] Fix `app/quotes/[id]/components/QuoteRMASubTab.tsx` (depends on T002): rebind header at line 68 and cell at lines 113-121 (currently `rma.proposalName`) to `rma.proposalNumber`. Leave "Proposal Name" column (line 69, cell 122-124) unchanged.
- [X] T006 [US1] Fix `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx` (depends on T002): rebind header at line 65 and cell at lines 104-112 (currently `order.proposalName`) to `order.proposalNumber`. Leave "Proposal Name" column (line 66, cell 113-115) unchanged.
- [X] T007 [US1] Fix `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx` (depends on T002): rebind header at line 66 and cell at lines 114-122 (currently `manifest.proposalName`) to `manifest.proposalNumber`. Leave "Proposal Name" column (line 67, cell 123-124) unchanged.

### Invoices domain

- [X] T008 [P] [US1] Fix `app/invoices/page.tsx` line 100: currently `proposalNumber: item.Proposal_Number || item.Proposal_Name || 'N/A',` — correct the wrong field name to `item.Proposal_Number__c`. The header (line 499) and cell (lines 557-572) are already correctly wired to `proposalNumber`; no other change needed here.
- [X] T009 [P] [US1] Fix `app/invoices/[id]/page.tsx`: add a `proposalNumber` field (fallback pattern) alongside each existing `proposalName` assignment: line 96 (payments), line 116 (creditMemos applied), line 132 (credits full), line 191 (main invoice details). Update the `CreditMemo`/related types (in `app/invoices/types.ts` or co-located interfaces) to include `proposalNumber` so `InvoiceCredits.tsx` (T010) can consume it.
- [X] T010 [US1] Fix `app/invoices/[id]/components/InvoiceCredits.tsx` (depends on T009): rebind header at line 66 (currently `field="proposalName"`) and cell at lines 107-115 (currently `cm.proposalName`) to `cm.proposalNumber`. Leave "Proposal Name" column (line 67, cell 116-118) unchanged.

### Purchase Orders domain

- [X] T011 [P] [US1] Fix `app/purchase-orders/page.tsx` line 74: currently `proposalNumber: p.Proposal_Number || p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || '',` — correct `p.Proposal_Number` to `p.Proposal_Number__c`. Header (line 301) and cell (lines 348-360) are already correctly wired to `proposalNumber`; no other change needed.
- [X] T012 [P] [US1] Fix `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`: correct the `Proposal_Number?: string;` interface field (line 23) to `Proposal_Number__c?: string;`, update the mapping at line 53 (`proposalNumber: d.Proposal_Number || d.Proposal_Name || ''`) and the cell at lines 146-155 (references to `d.Proposal_Number`) to use `d.Proposal_Number__c`.
- [X] T013 [P] [US1] Fix `app/purchase-orders/[id]/components/PORTVTable.tsx`: same fix as T012 — interface field at line 24, mapping at line 54, cell references at lines 149-158, `Proposal_Number` → `Proposal_Number__c`.
- [X] T014 [P] [US1] Fix `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`: same fix as T012 — interface field at line 25, mapping at line 64, cell references at lines 181-190, `Proposal_Number` → `Proposal_Number__c`.

### Supplier Bills domain

- [X] T015 [P] [US1] Fix `app/supplier-bills/page.tsx` line 77: currently `proposalNumber: b.Proposal_Number || b.Proposal_Name || '',` — correct to `b.Proposal_Number__c`. Header (line 286) and cell (lines 337-349) are already correctly wired; no other change needed.
- [X] T016 [P] [US1] Fix `app/supplier-bills/[id]/page.tsx` lines 235-236: currently `proposalName: d.Proposal_Name || ''` and `proposalNumber: d.Proposal_Number || ''` (no fallback at all on the number, so it's always empty). Correct to `proposalNumber: d.Proposal_Number__c || d.Proposal_Name || '',`.
- [X] T017 [US1] Verify `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx` (depends on T016): header (line 74) and cell (lines 115-125) already reference `debit.proposalNumber` — no binding change needed here, this task is to confirm the display is correct once T016's upstream data fix lands (no code change expected unless the upstream field name in the passed prop type also needs updating).

### Shipments domain

- [X] T018 [P] [US1] Fix `app/shipments/page.tsx` line 75: currently `proposalNumber: s.Proposal_Number || s.Proposal_Name || "",` — correct to `s.Proposal_Number__c`. Header (line 488) and cell (lines 555-572) are already correctly wired; no other change needed.

### Orders domain

- [X] T019 [P] [US1] Fix `app/orders/page.tsx`: line 134 currently only sets `proposal_name: o.Proposal_Name ?? "",` (no number field at all). Add `proposal_number: o.Proposal_Number__c ?? o.Proposal_Name ?? "",` to the same mapped object. Rebind the "Proposal #" header (line 873, currently `field="proposal_id"` — sorting by record Id) and cell (lines 907-919, currently rendering `order.proposal_name`) to the new `order.proposal_number` field. Leave the "Proposal Name" column (line 874) rendering `order.proposal_name` unchanged.

### Proposal detail sub-tabs domain

- [X] T020 [US1] Fix `app/proposals/[id]/page.tsx`: add a `proposalNumber` field (fallback pattern) alongside each existing `proposalName` assignment in the six child-record mappings: line 679 (RMA), line 740 (Credit Memo), line 849 (Fulfillment Invoices), line 886 (Fulfillment Shipping Manifests), line 917 (Fulfillment Sales Orders), line 945 (Fulfillment Customer Quotes). Update the corresponding object shapes/types so `ReturnsTab.tsx` (T021) and `FulfillmentsTab.tsx` (T022) can consume the new field. Leave the already-correct top-level proposal mapping at line 330 (`item.Proposal_Number__c || item.Name || 'N/A'`) untouched.
- [X] T021 [US1] Fix `app/proposals/[id]/components/ReturnsTab.tsx` (depends on T020): RMA tab — rebind header at line 117 (currently `field="proposalId"`) and cells at lines 238-244 (currently `rma.proposalName`) to `rma.proposalNumber`. Credit Memo tab — rebind header at line 164 and cells at lines 341-348 (currently `credit.proposalName`) to `credit.proposalNumber`. Leave both tabs' "Proposal Name" columns unchanged. (RTV and Debit Memo tabs have no Proposal column and are out of scope.)
- [X] T022 [US1] Fix `app/proposals/[id]/components/FulfillmentsTab.tsx` (depends on T020): rebind all four "Proposal #" header/cell pairs — Customer Quotes (header line 130, cells 174-189), Sales Orders (header line 278, cells 336-350), Invoices (header line 439, cells 501-515), Shipping Manifests (header line 598, cells 664-678) — from `X.proposalName`/`field="proposalId"` to `X.proposalNumber`. Leave all four "Proposal Name" columns unchanged.

**Checkpoint**: All 22 touched files compile clean and every "Proposal #" column across the app is bound to a `proposalNumber`/`Proposal_Number__c`-derived value.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T023 [P] Run `npx tsc --noEmit -p tsconfig.json` from repo root; fix any type errors surfaced by the new `proposalNumber` fields/interface changes across all files touched in T001-T022.
- [X] T024 Walk through every scenario in `quickstart.md` (Quotes list/detail sub-tabs, Invoices list/Credits tab, Purchase Orders list/detail sub-tables, Supplier Bills list/Debits tab, Shipments list, Orders list, Proposal detail Fulfillments/Returns tabs) confirming "Proposal #" now shows a distinct `PRP-...`-style value from "Proposal Name" wherever both exist, and that the fallback-to-Name behavior still works when the number is blank.
- [X] T025 Spot-check that the already-correct reference pages (`app/proposals/page.tsx`, `app/proposals/[id]/page.tsx` own header, `app/orders/[id]/components/FulfillmentTab.tsx`, `app/orders/[id]/components/ReturnsTab.tsx`) are unaffected by this change (Acceptance Scenario 4 in spec.md).

**Checkpoint**: Feature complete and independently verifiable per `quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 3)**: No Setup/Foundational phase is needed for this feature — every task is a self-contained data-mapping/display correction with no shared new infrastructure to stand up first.
- **Polish (Phase 4)**: Depends on all of Phase 3 being complete.

### Within User Story 1

Each domain group is independent of every other domain group (different files, no shared state) and can be worked in parallel. Within a domain group, "consumer" component tasks depend on their "producer" page task completing first (the producer adds the `proposalNumber` field the consumer then binds to):

- T003, T004, T005, T006, T007 each depend on **T002**
- T010 depends on **T009**
- T017 depends on **T016**
- T021, T022 each depend on **T020**
- T001, T008, T009, T011-T016, T018, T019, T020 have no dependencies on other Phase 3 tasks and can start immediately
- T012, T013, T014 are fully self-contained (each file receives raw, un-remapped Salesforce fields directly as props — no producer task needed)

### Parallel Opportunities

- All tasks marked `[P]` can run in parallel with each other (different files, no unresolved dependency)
- Within the Quotes domain, T003-T007 can run in parallel once T002 completes
- Across domains, an entire domain group (e.g. all of Purchase Orders: T011-T014) can run in parallel with another entire domain group (e.g. all of Shipments: T018)

---

## Parallel Example: Quotes domain

```bash
# After T002 completes, launch all five sub-tab fixes together:
Task: "Fix app/quotes/[id]/components/QuoteInvoicesSubTab.tsx"
Task: "Fix app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx"
Task: "Fix app/quotes/[id]/components/QuoteRMASubTab.tsx"
Task: "Fix app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx"
Task: "Fix app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (there is no Setup/Foundational phase for this feature)
2. **STOP and VALIDATE**: Run T023 (`tsc --noEmit`) and T024 (`quickstart.md` walkthrough)
3. Deploy/demo if ready

### Incremental Delivery

Since every domain group is independent, they can land as separate small commits/PRs in any order (e.g. Quotes first, then Invoices, then Purchase Orders, etc.) without needing to wait on the others — none of the 22 files overlap across domain groups.

---

## Notes

- **Backend dependency outside this repo**: Per `research.md`, none of the affected pages build a SOQL `SELECT` in this codebase — all data comes from a generic Salesforce Apex REST endpoint (`/services/apexrest/gtherp/generic/tab`) whose field list lives in Apex, not in this repo. `app/orders/[id]/components/FulfillmentTab.tsx` already renders raw `Proposal_Number__c` successfully for RMA/Credit Memo/Customer Quote/Sales Order/Shipping Manifest/Invoice object types, which is strong evidence the backend already returns this field for those types. If any specific object type turns out not to return `Proposal_Number__c` yet, the `|| Name` fallback ensures no regression — the column will keep showing the Name (today's behavior) until the backend is updated, rather than showing blank.
- [P] tasks = different files, no dependencies
- [US1] label maps every task to the feature's single user story
- Commit after each domain group (or each task) completes
- Avoid: touching the "Proposal Name" column's binding, removing `proposalId`-based links, or renaming fields consumed elsewhere for sorting
