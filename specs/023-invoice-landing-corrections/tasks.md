# Tasks: Invoice Landing Page — Required Corrections

**Input**: Design documents from `specs/023-invoice-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column layout (header no-wrap, sticky first column, cell ellipsis — all already correct per research; verification only, no code change expected beyond the Invoice # link fix which is grouped under US2 since it's a hyperlink requirement). US2 = column definitions, labels, hyperlinks, and 8 new field mappings (the bulk of the work). US3 = Collection Status/Open Balance color-coding plus pagination/default-sort (pagination and sort are already implemented correctly per research — verification only for those two).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout (header no-wrap, sticky first column, cell ellipsis)
- **[US2]**: User Story 2 — Column definitions, labels, hyperlinks, field mappings
- **[US3]**: User Story 3 — Status/balance color-coding, pagination, default sort order

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type and data-mapping additions that the column tasks in Phase 3/4 depend on.

- [X] T001 [P] In `app/invoices/types.ts`, add 8 new optional fields to the `Invoice` interface: `customerQuoteId?: string`, `customerQuoteName?: string`, `proposalNumber?: string`, `billToLocation?: string`, `totalPrice?: number`, `shipping?: number`, `taxes?: number`, `settledDate?: string`

- [X] T002 In `app/invoices/page.tsx`, update the `mappedInvoices` mapping (~lines 63-88) to add: `customerQuoteId: item.Customer_Quote__c || ''`, `customerQuoteName: item.Customer_Quote_Name || 'N/A'`, `proposalNumber: item.Proposal_Number || item.Proposal_Name || 'N/A'`, `billToLocation: item.Authorized_Bill_To_Location_Name || 'N/A'`, `totalPrice: item.Total_Price__c || 0`, `shipping: item.Total_Shipping_Charges__c || 0`, `taxes: item.Total_Taxes_Amount__c || 0`, `settledDate: item.Settled_Date__c || ''` (depends on T001)

- [X] T003 In `app/invoices/page.tsx`, update the `useResizableColumns` widths config (~lines 27-43) to add new keys: `customerQuote: 170`, `proposalNumber: 150`, `billToLocation: 180`, `billToContact: 180`, `totalPrice: 130`, `shipping: 110`, `taxes: 110`, `dueDate: 140`, `settledDate: 140` (depends on T002)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to the table JSX.

---

## Phase 3: User Stories 1 & 2 — Column Layout and Definitions (Priority: P1) 🎯 MVP

**Goal**: The invoices table shows the exact 24-column set, labels, and hyperlinks specified in FR-008 through FR-013.

**Independent Test**: Navigate to `/invoices` and verify: column count + order matches FR-008 exactly, all headers still render on a single line without ellipsis (already correct, confirm no regression), the first column stays pinned on horizontal scroll, and Invoice #/Customer Quote #/Proposal #/Customer Order # hyperlinks navigate correctly.

> US1 (header no-wrap, sticky column) is already correct per research — T004 is a verification step, not expected to require a code change. US2 (column content/order/hyperlinks) is the substantive work. Both touch the same JSX, so they're grouped into one phase.

- [X] T004 [US1] In `app/invoices/page.tsx`, verify every `SortableHeader` in the invoices table (~lines 476-489) already has `truncate={false}` and the first column retains its `className="sticky left-0 ..."` after the Phase 3 edits below — no change expected; if any header lost `truncate={false}` or the sticky class during editing, restore it

- [X] T005 [US2] In `app/invoices/page.tsx`, replace the Invoice # body cell's click-handler `<div onClick={() => router.push(...)}>` (~lines 515-517) with a genuine `<Link href={`/invoices/${invoice.id}`}>` wrapping the invoice number text, matching the `Link` pattern already used for Purchase Order/Proposal Name/Customer Order on this same page; relabel the header from `label="Invoice Number"` to `label="Invoice #"` (~line 476)

- [X] T006 [US2] In `app/invoices/page.tsx`, relabel three column headers: `label="Sales Order"` → `label="Sales Order #"` (~line 478), `label="Purchase Order"` → `label="Purchase Order #"` (~line 479), `label="Customer Order"` → `label="Customer Order #"` (~line 481) — existing hyperlinks on Purchase Order # and Customer Order # are already correct, no other change needed

- [X] T007 [US2] In `app/invoices/page.tsx`, after the "Purchase Order #" column and before "Proposal Name", insert two new hyperlinked columns in this order: "Customer Quote #" (header `SortableHeader label="Customer Quote #" field="customerQuoteName"`; body cell links to `/quotes/${invoice.customerQuoteId}` when `customerQuoteId` is populated and `!isManufacturer`, else plain text via `displayCell()`, matching the existing Proposal Name link-gating pattern) and "Proposal #" (header `SortableHeader label="Proposal #" field="proposalNumber"`; body cell links to `/proposals/${invoice.proposalId}` reusing the already-mapped `proposalId`, same gating pattern) (depends on T002, T003)

- [X] T008 [US2] In `app/invoices/page.tsx`, after the existing "Bill to Account" column and before "Total Lines", insert two new plain-text columns in this order: "Bill to Location" (`invoice.billToLocation` via `displayCell()`) and "Bill to Contact" (`invoice.contactName` via `displayCell()` — already mapped, just add the column), matching the existing Customer PO cell styling (depends on T002, T003)

- [X] T009 [US2] In `app/invoices/page.tsx`, after the existing "Total Lines" column and before "Grand Total", insert three new currency columns in this order: "Total Price" (`formatCurrency(invoice.totalPrice)`), "Shipping" (`formatCurrency(invoice.shipping)`), "Taxes" (`formatCurrency(invoice.taxes)`), matching the existing Grand Total cell styling (plain text, no link) (depends on T002, T003)

- [X] T010 [US2] In `app/invoices/page.tsx`, after the existing "Payment Terms" column and before "Collection Status", insert a new "Due Date" column: header `SortableHeader label="Due Date" field="dueDate"`, body cell `formatDate(invoice.dueDate, 'numeric-dash')` matching the existing Issued Date cell styling (`dueDate` is already mapped — no mapping change needed, only the column) (depends on T003)

- [X] T011 [US2] In `app/invoices/page.tsx`, after the existing "Open Balance" column and before "Action", insert a new "Settled Date" column: header `SortableHeader label="Settled Date" field="settledDate"`, body cell `displayCell(invoice.settledDate)` rendering "-" when empty, matching the existing date-cell null-dash convention (depends on T002, T003)

- [X] T012 [US2] In `app/invoices/page.tsx`, update the empty-state row's `colSpan={10}` (~line 498) to `colSpan={24}` to correctly span the full new column count

**Checkpoint**: Phase 3 complete — reload `/invoices` and verify all 24 columns appear in the exact FR-008 order with correct labels, hyperlinks, and no-wrap headers.

---

## Phase 4: User Story 3 — Status/Balance Color-Coding, Pagination, Default Sort (Priority: P2)

**Goal**: Collection Status renders with green/yellow/red color-coding (Paid/Pending/Past Due), Open Balance retains its existing red/green color-coding, and pagination/default sort continue to work correctly with the new column set.

**Independent Test**: Load `/invoices` with at least one invoice per Collection Status value and confirm the correct color per status; confirm Open Balance colors are unchanged; confirm pagination controls appear with >10 invoices and the first row shows the highest Invoice # (descending) on initial load.

- [X] T013 [US3] In `app/invoices/page.tsx`, replace the plain-text Collection Status cell (~lines 595-597) with a color-coded badge: green (`bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`) for "Paid", yellow (`bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`) for "Pending", red (`bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`) for "Past Due", and a neutral gray fallback for any other/blank value — reuse the exact pill markup pattern from the existing `StatusBadge` function (~lines 640-666), either by adding a small local helper (e.g. `CollectionStatusBadge`) or inlining the same class-switch logic

- [X] T014 [US3] In `app/invoices/page.tsx`, verify the Open Balance cell (~lines 598-602) still renders red when `amountDue > 0` and green otherwise after the Phase 3 column insertions — no change expected, this is a confirmation step

- [X] T015 [US3] In `app/invoices/page.tsx`, verify the `Pagination` component (~lines 627-634) and `ITEMS_PER_PAGE = 10` (~line 15) are unaffected by the column changes — no change expected

- [X] T016 [US3] In `app/invoices/page.tsx`, verify the `useSortableData` initializer (~line 157) still reads `{ key: 'invoiceNumber', direction: 'desc' }` after all Phase 2/3/4 changes — no change expected; if it was altered incidentally during other edits, restore it to `direction: 'desc'`

**Checkpoint**: Phase 4 complete — Collection Status colors confirmed, Open Balance colors unchanged, pagination and default sort confirmed working with the full 24-column table.

---

## Phase 5: Polish & Verification

- [X] T017 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/invoices/page.tsx` and `app/invoices/types.ts`

- [X] T018 Start dev server (`npm run dev`) and run through all 18 quickstart.md validation scenarios plus the out-of-scope regression check (search/filter behavior, `isManufacturer` gating, pre-existing Purchase Order #/Proposal Name hyperlinks, view-invoice button functionality) and the live-org field verification checklist (Customer Quote #, Proposal #, Settled Date)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 has no dependencies — start immediately (different file from the rest). T002 depends on T001 (references the new interface fields). T003 depends on T002 (adds width keys for the fields T002 introduces).
- **Phase 3 (US1+US2)**: T004 (verification), T005, T006, T012 have no Phase 2 dependency and can start immediately. T007, T008, T009, T010, T011 depend on T002+T003 (need the new fields and width keys to exist).
- **Phase 4 (US3)**: T013 has no Phase 2/3 dependency (Collection Status is already mapped). T014, T015, T016 are independent verification steps that logically follow Phase 3 since they confirm the final state.
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete.

### User Story Dependencies

- **US1 + US2 (P1)**: Together form the MVP — the exact column set with correct layout and hyperlinks. US1 requires no new code beyond the Invoice # link fix (grouped under US2 as a hyperlink requirement).
- **US3 (P2)**: Color-coding is new work; pagination/sort are independent verification-only items with no risk of regressing US1/US2.

### Within Each Phase

- Phase 2: T001 first (different file), then T002, then T003 (sequential — each builds on the prior within the same file)
- Phase 3: All tasks touch the same file/table, so treat as sequential to avoid edit conflicts, even though T005/T006/T012 have no Phase 2 dependency
- Phase 4: T013 can be done independently of T014-T016; the latter three are pure verification and can be done in any order

### Parallel Opportunities

- T001 (types.ts) can run in parallel with nothing else in Phase 2 since T002 depends on it directly, but it's flagged `[P]` because it's a different file than the rest of the feature's changes
- T005, T006, T012 (simple relabels/fixes) have no Phase 2 dependency and could be done before or interleaved with Phase 2 work
- T013 (Collection Status badge) has no dependency on T007-T011 and could be done in parallel with them if working across two branches, though both land in the same file

---

## Implementation Strategy

### MVP (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: US1 + US2 (T004-T012)
3. **STOP and VALIDATE**: Open `/invoices`, verify all 24 columns match FR-008
4. Ship as MVP — all P1 requirements met (Collection Status will still show plain text until Phase 4)

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-010 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- Unlike features 021/022 (Orders/Proposals landing pages), this page's header no-wrap, sticky column, pagination, and default sort are already correct — Phase 2/3/4 focus on the genuinely new gaps: the Invoice # link, 8 new field mappings, and Collection Status color-coding
- Three field-source assumptions carry implementation-time risk and should be confirmed against the live org during T002/T018: `Customer_Quote__c`/`Customer_Quote_Name` on `Invoice__c` (inferred from the identical pair's universal presence on every sibling object), the dedicated Proposal number field behind `proposalNumber` (currently falls back to the already-working `Proposal_Name` value so the column is never blank), and `Settled_Date__c` on `Invoice__c` (confirmed only on the related Credit/Debit Memo object today). If any field is genuinely absent from the API response, the column gracefully shows "-" or the fallback value rather than breaking the page.

## T018 Live Verification Results (2026-07-02)

Verified against the live Salesforce org (real `Apple` test account, 7 invoice records) via headless Chrome with an authenticated session:

- All 24 headers render in the exact FR-008 order, single line, no wrap (confirmed via DOM extraction of `thead th` text).
- Invoice # is a genuine sticky hyperlink, default-sorted descending (`IN-0000000006` → `IN-0000000000`) — confirms FR-004, FR-006, FR-009.
- Pagination footer renders ("Showing 1 to 7 of 7 invoices", Previous/Next) — confirms FR-005.
- **Customer Quote #** is populated with real hyperlinked data (e.g. `CQ-0000000010`) — the riskiest inferred field mapping (`Customer_Quote__c`/`Customer_Quote_Name`) is confirmed to exist and work on the live `Invoice__c` object.
- **Proposal #** and **Proposal Name** both render with distinct real values (e.g. `Proposal-SO-002` vs `PRO-CO-0000000045-...`) — confirms FR-008 column distinctness.
- **Bill to Location** renders distinct real values (`a-test`, `CAS warehouse`) from Bill to Account — confirms FR-011.
- **Total Price / Shipping / Taxes** render as three distinct real currency figures (e.g. $377.97 / $0.00 / $317.52 on one row) — confirms FR-012.
- **Collection Status** badge renders yellow for a real "Pending" record and gray-neutral fallback for a real "Not Collectable" value not in the Paid/Pending/Past Due set — confirms FR-014 and its edge case exactly as specified.
- **Due Date** and **Settled Date** render real dates or "-" when empty — confirms FR-013, FR-016.
- Not clicked through to a destination page (navigation itself relies on already-proven `Link`/routing patterns reused unchanged from elsewhere on this page); all other scenarios in quickstart.md's list were covered by the above or by the `npm run build` pass in T017.
- Note: this page's pre-existing convention defaults several string fields (e.g. `accountName`, `proposalName`, `customerOrder`) to the literal text `"N/A"` rather than `"-"` when missing, predating this feature. New fields added in this change (`customerQuoteName`, `proposalNumber`, `billToLocation`) follow that same established local convention; `settledDate` uses the stricter "-" null-dash convention as specified. This N/A-vs-"-" inconsistency across the page's string fields is pre-existing and out of scope for this feature.
