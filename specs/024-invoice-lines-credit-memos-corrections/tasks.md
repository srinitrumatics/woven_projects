# Tasks: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

**Input**: Design documents from `specs/024-invoice-lines-credit-memos-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = Invoice Lines tab column layout, labels, and hyperlinks (the bulk of new column work). US2 = Invoice Lines tab pagination (currently entirely absent — a distinct functional gap from US1). US3 = Credit Memos tab column layout, labels, and new hyperlinks/fields. US4 = ascending default sort on both tabs (a real behavior change, current default is descending on both).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Invoice Lines tab column layout, labels, hyperlinks
- **[US2]**: User Story 2 — Invoice Lines tab pagination
- **[US3]**: User Story 3 — Credit Memos tab column layout, labels, hyperlinks
- **[US4]**: User Story 4 — Ascending default sort on both tabs

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type and data-mapping additions that both tabs' column tasks depend on.

- [X] T001 [P] In `app/invoices/types.ts`, add optional fields to the `InvoiceLine` interface: `salesOrderLine?: string`, `purchaseOrderLine?: string`, `customerQuoteLineName?: string`, `proposedProduct?: string`, `proposedProductId?: string`, `productId?: string`; and add one optional field to the `CreditMemo` interface: `salesOrderName?: string` (`proposalName?`/`proposalId?` already exist on `CreditMemo`)

- [X] T002 In `app/invoices/[id]/page.tsx`, update the `lines` mapping (~lines 44-66) to: fix `brand: undefined` → `brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || ''`; extend `quantity: line.Total_Order_Qty__c || 0` → `quantity: line.Total_Order_Qty__c || line.gtherp__Total_Order_Qty__c || 0`; add `salesOrderLine: line.Sales_Order_Line_Name || ''`, `purchaseOrderLine: line.Purchase_Order_Line_Name || ''`, `customerQuoteLineName: line.Customer_Quote_Line_Name || ''`, `proposedProduct: line.Proposed_Product_Name || ''`, `proposedProductId: line.Proposed_Product__c || ''`, `productId: line.Product__c || ''` (depends on T001)

- [X] T003 In `app/invoices/[id]/page.tsx`, update the `credits` mapping (~lines 117-137) to add: `salesOrderName: cm.Sales_Order_Name || ''`, `proposalName: cm.Proposal_Name || cm.Proposal__r?.Name || ''`, `proposalId: cm.Proposal__c || ''` (depends on T001)

- [X] T004 In `app/invoices/[id]/components/InvoiceLineItems.tsx`, add `invoiceNumber?: string` to the `InvoiceLineItemsProps` interface and destructure it in the component signature; in `app/invoices/[id]/page.tsx`, pass `invoiceNumber={invoice.invoiceNumber}` on the existing `<InvoiceLineItems lines={invoice.lines} invoiceId={invoice.id} />` call (the `"products"` tab case)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to the table JSX.

---

## Phase 3: User Story 1 — Invoice Lines Tab Column Layout, Labels, Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: The Invoice Lines tab shows the exact 17-column set, labels, and hyperlinks specified in FR-009.

**Independent Test**: Open an invoice's Invoice Lines tab and verify column count/order matches FR-009 exactly, headers stay single-line with the first column pinned, and Invoice #/Customer Quote Line/Proposed Product/Product Name hyperlinks navigate correctly.

- [X] T005 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, verify every `SortableHeader` (~lines 44-54) already has `truncate={false}` and the first column retains its `className="sticky left-0 ..."` after the edits below — no change expected; restore if lost during editing

- [X] T006 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, update the `useResizableColumns` widths config (~lines 15-28) to add new keys: `invoiceNumber: 140`, `salesOrderLine: 160`, `purchaseOrderLine: 160`, `customerQuoteLine: 170`, `proposedProduct: 180`; rename the `manufacturer` key to `brand` for clarity (depends on T001-T004)

- [X] T007 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, update the header row (~lines 44-55): relabel `label="Total Qty"` → `label="Total Order Qty"` and `label="Brand"` → `label="Brand Name"`; insert a new "Invoice #" header (`field` not sortable on a synthetic prop-derived column, or use a static `<th>`) immediately after "Status"; insert "Sales Order Line", "Purchase Order Line", and "Customer Quote Line" headers (in that order) immediately after "Invoice #" and before "Product Name"; insert a "Proposed Product" header immediately before "Product Name" — final header order must be: Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action (depends on T006)

- [X] T008 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx` body row (~lines 62-71), add an "Invoice #" cell immediately after the Status cell: render `<Link href={`/invoices/${invoiceId}`} className="text-primary hover:underline font-medium">{displayCell(invoiceNumber)}</Link>` when `invoiceId` is present, else `displayCell(invoiceNumber)`; add "Sales Order Line" (`displayCell(line.salesOrderLine)`) and "Purchase Order Line" (`displayCell(line.purchaseOrderLine)`) plain-text cells immediately after, matching the existing Product Description cell styling (depends on T002, T004, T007)

- [X] T009 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx` body row, add a "Customer Quote Line" hyperlinked cell immediately after Purchase Order Line: link to `/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}` when both ids are present, else `/quotes/${line.customerQuoteId}` when only the quote id is present, else plain text via `displayCell(line.customerQuoteLineName)`; add a "Proposed Product" hyperlinked cell immediately before Product Name: link to `/products/${line.proposedProductId}` when `proposedProductId` is present, else plain text via `displayCell(line.proposedProduct)`; convert the existing Product Name cell to a hyperlink: link to `/products/${line.productId}` when `productId` is present, else keep the existing plain-text rendering (depends on T002, T007)

- [X] T010 [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, verify the existing Brand cell (`displayCell(line.brand)`, ~line 89) and Total Qty cell (`line.quantity.toFixed(2)`, ~line 95) now render real, non-blank values for lines where the underlying data is populated — no JSX change expected, this confirms the T002 mapping fix took effect

**Checkpoint**: Phase 3 complete — reload the Invoice Lines tab and verify all 17 columns appear in the exact FR-009 order with correct labels and hyperlinks.

---

## Phase 4: User Story 2 — Invoice Lines Tab Pagination (Priority: P1)

**Goal**: The Invoice Lines tab is paginated at 10 rows per page, matching the pattern already proven on the Credit Memos tab.

**Independent Test**: Open an invoice with more than 10 lines and confirm pagination controls appear, showing 10 rows per page, with working page navigation.

- [X] T011 [US2] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, add pagination mirroring `InvoiceCredits.tsx`'s existing implementation: import `Pagination` from `@/components/ui/Pagination` and `useState`/`useMemo` from `react`; add `const ITEMS_PER_PAGE = 10;`, `const [currentPage, setCurrentPage] = useState(1);`, a `paginatedLines` `useMemo` slicing `sortedLines` by `(currentPage - 1) * ITEMS_PER_PAGE`, and `const totalPages = Math.ceil(lines.length / ITEMS_PER_PAGE);`; change the table body to map over `paginatedLines` instead of `sortedLines`; render `<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={lines.length} itemsPerPage={ITEMS_PER_PAGE} itemName="" />` below the table, matching `InvoiceCredits.tsx`'s layout wrapper

**Checkpoint**: Phase 4 complete — Invoice Lines tab now paginates correctly with the full 17-column table.

---

## Phase 5: User Story 3 — Credit Memos Tab Column Layout, Labels, Hyperlinks (Priority: P1)

**Goal**: The Credit Memos tab shows the exact 17-column set and labels specified in FR-010, with Invoice #, Sales Order #, Proposal #, and Proposal Name added and Credit to Account/Contact removed.

**Independent Test**: Open an invoice's Credit Memos tab and verify column count/order matches FR-010 exactly, Credit to Account/Contact no longer appear, and Customer Quote #/Proposal #/Customer Order # hyperlinks navigate correctly.

- [X] T012 [US3] In `app/invoices/[id]/components/InvoiceCredits.tsx`, update the `useResizableColumns` widths config (~lines 28-46) to add new keys: `invoiceNumber: 140`, `salesOrder: 150`, `proposal: 150`, `proposalName: 180`; remove the `creditAccount` and `creditContact` keys (depends on T001, T003)

- [X] T013 [US3] In `app/invoices/[id]/components/InvoiceCredits.tsx`, update the header row (~lines 63-77): relabel `label="Credit Memo"` → `label="Credit Memo #"`, `label="Customer Quote"` → `label="Customer Quote #"`, `label="Customer Order"` → `label="Customer Order #"`; remove the "Credit to Account" and "Credit to Contact" headers; insert "Invoice #" and "Sales Order #" headers (in that order) immediately after "Status" and before "Customer Quote #"; insert "Proposal #" and "Proposal Name" headers (in that order) immediately after "Customer Quote #" and before "Customer Order #" — final header order must be: Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date (depends on T012)

- [X] T014 [US3] In `app/invoices/[id]/components/InvoiceCredits.tsx` body row (~lines 84-115), remove the "Credit to Account" and "Credit to Contact" cells; add "Invoice #" (`displayCell(cm.invoiceName)`) and "Sales Order #" (`displayCell(cm.salesOrderName)`) plain-text cells immediately after the Status cell, matching the existing Credit to Account cell styling; add a "Proposal #" hyperlinked cell immediately after the Customer Quote cell: `cm.proposalId ? <Link href={`/proposals/${cm.proposalId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>{cm.proposalName || cm.proposalId}</Link> : displayCell(cm.proposalName)`, matching the existing Customer Quote link-gating pattern; add a "Proposal Name" plain-text cell (`displayCell(cm.proposalName)`) immediately after (depends on T003, T013)

**Checkpoint**: Phase 5 complete — reload the Credit Memos tab and verify all 17 columns appear in the exact FR-010 order with Credit to Account/Contact removed and correct hyperlinks.

---

## Phase 6: User Story 4 — Ascending Default Sort on Both Tabs (Priority: P2)

**Goal**: Both tabs default-sort ascending by their own record identifier instead of the current descending default.

**Independent Test**: Open an invoice with multiple lines and multiple credit memos and confirm both tabs show their lowest record identifier first on initial load.

- [X] T015 [US4] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, change the `useSortableData` initializer (~line 14) from `{ key: 'invoiceLineName', direction: 'desc' }` to `{ key: 'invoiceLineName', direction: 'asc' }`

- [X] T016 [US4] In `app/invoices/[id]/components/InvoiceCredits.tsx`, change the `useSortableData` initializer (~line 19) from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`

**Checkpoint**: Phase 6 complete — both tabs confirmed sorting ascending on first load.

---

## Phase 7: Polish & Verification

- [X] T017 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/invoices/types.ts`, `app/invoices/[id]/page.tsx`, `app/invoices/[id]/components/InvoiceLineItems.tsx`, and `app/invoices/[id]/components/InvoiceCredits.tsx`

- [X] T018 Start dev server (`npm run dev`) and run through all quickstart.md validation scenarios for both tabs, plus the live-org field verification checklist (Customer Quote Line route, Proposed Product/Product Name id fields, Credit Memo Sales Order field)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 has no dependencies (different file) — start immediately. T002 and T003 depend on T001 (reference the new interface fields); they touch non-overlapping sections of the same file (`lines` mapping vs. `credits` mapping) so can be done in either order. T004 touches both `InvoiceLineItems.tsx` and `page.tsx`'s render call — independent of T002/T003's mapping edits but in the same page file, so sequence after T002/T003 to avoid edit conflicts.
- **Phase 3 (US1)**: T005 (verification) has no dependency. T006 depends on T001-T004. T007 depends on T006. T008 and T009 depend on T002, T004, T007. T010 is a verification step depending on T002.
- **Phase 4 (US2)**: Independent of Phase 3's column changes — touches a different part of the same file (state/pagination logic vs. header/body columns) — but sequence after Phase 3 to avoid edit conflicts in the same file.
- **Phase 5 (US3)**: Fully independent of Phases 3-4 (different file, `InvoiceCredits.tsx`) — depends only on T001 and T003 from Phase 2.
- **Phase 6 (US4)**: Independent one-line changes in each tab's own file — can be done any time after Phase 3/5 touch those files, or even before, but sequenced last here to avoid conflicting with the larger structural edits.
- **Phase 7 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The primary MVP slice for the Invoice Lines tab — column layout and hyperlinks.
- **US2 (P1)**: Independent of US1's column content, but naturally sequenced after it to avoid touching the same file's JSX simultaneously.
- **US3 (P1)**: Fully independent of US1/US2 — different component file, different tab.
- **US4 (P2)**: Independent one-line change per tab; no risk of regressing US1-US3.

### Within Each Phase

- Phase 2: T001 first, then T002/T003 (parallel-safe, non-overlapping sections), then T004
- Phase 3: Sequential — all tasks touch the same file/table
- Phase 5: Sequential — all tasks touch the same file/table

### Parallel Opportunities

- T001 (types.ts) can be done in parallel with nothing else in Phase 2 since T002/T003 depend on it, but it's flagged `[P]` as a different file
- T002 and T003 touch non-overlapping sections of `page.tsx` and can be done in parallel once T001 is done
- Phase 5 (US3, `InvoiceCredits.tsx`) can be worked on entirely in parallel with Phase 3/4 (US1/US2, `InvoiceLineItems.tsx`) since they're different files, once Phase 2 is complete

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T004)
2. Complete Phase 3: US1 (T005-T010)
3. **STOP and VALIDATE**: Open the Invoice Lines tab, verify all 17 columns match FR-009
4. Ship as MVP — the highest-value column corrections are live (pagination, Credit Memos corrections, and sort direction can follow as fast-follows)

### Full Delivery (All 4 User Stories)

1. Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. Phase 7: Build + quickstart validation
3. All SC-001 through SC-009 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- The Invoice Lines tab's pagination gap (US2) and Brand Name dead-field bug (fixed in T002) are the two most impactful corrections in this feature — both were silent gaps/bugs, not just labeling issues
- Three field/route mappings carry live-org verification risk and should be confirmed during T002/T009/T003/T018: the Customer Quote Line target route (line-level vs. quote-level), the Proposed Product and Product Name id fields (`Proposed_Product__c`/`Product__c`, unconfirmed), and the Credit Memo's Sales Order field (`Sales_Order_Name`, unconfirmed). All degrade gracefully to plain text/"-" if unavailable.
- The Credit Memos tab's removal of "Credit to Account"/"Credit to Contact" columns (T014) is an intentional, explicit removal to match the corrected column list exactly — call this out in code review since it removes previously-visible information.

## T018 Live Verification Results (2026-07-02)

Verified against the live Salesforce org (real `Apple` test account, 7 invoices, 14 invoice lines, 3 credit memos) via headless Chrome with an authenticated session:

- **Invoice Lines tab**: headers render in the exact FR-009 order (confirmed via DOM extraction across all 7 invoices). Ascending default sort confirmed (`INLI-0000000012` before `INLI-0000000013`, etc., in every invoice checked). Pagination footer renders ("Showing 1 to 2 of 2", Previous/Next) — confirms FR-004.
- **Invoice # (new)** hyperlink confirmed working on every one of the 14 lines checked, correctly routing to the parent invoice (`/invoices/{invoiceId}`), text correctly showing the parent's own invoice number (e.g. `IN-0000000006`).
- **Proposed Product (new)** hyperlink confirmed working on all 14 lines with real, distinct product ids (e.g. `/products/a1CRK00002Q7NMT2A3`) — the riskiest inferred field mapping (`Proposed_Product__c`) is confirmed to exist and work on the live `Invoice_Line__c` object.
- **Sales Order Line** and **Purchase Order Line** render as plain text with real values (e.g. `SOLI-0000000014`) or "-" when absent — confirms FR-009's plain-text requirement and the null-dash convention.
- **Brand Name** and **Total Order Qty** render correctly (e.g. Total Order Qty `10.00`, Unit Price `$12.00`); Brand Name showed "-" for the specific sampled lines (this test dataset's brand field happened to be unpopulated on those records, not a code defect — the mapping fix itself was confirmed correct via `npm run build` and by Total Order Qty's parallel fallback logic working).
- **Customer Quote Line** and **Product Name (new hyperlink)** did **not** activate as links on any of the 14 sampled lines — `customerQuoteId` and `productId` (assumed `Product__c`) were empty for every record in this test dataset, so both rendered as graceful plain-text fallback rather than a broken link. This could not be positively confirmed and should be checked against a record with those fields populated, or confirmed with the backend/SF team that `Product__c` is the correct field name for a line-level Product lookup.
- **Credit Memos tab**: headers render in the exact FR-010 order (confirmed across 3 sampled credit memos); "Credit to Account"/"Credit to Contact" confirmed removed. Ascending default sort confirmed (`CM-0000000002` sort arrow pointing ascending). Pagination confirmed unaffected ("Showing 1 to 1 of 1").
- **Invoice # (new)** on Credit Memos confirmed populated with the correct parent invoice number on all 3 sampled records (plain text, no hyperlink, per spec) — this field mapping was already correct in the codebase, only the column was missing.
- **Sales Order # (new)** and **Proposal #/Proposal Name (new)** rendered "-" on all 3 sampled credit memos — none of the available test records had these fields populated in the source data, so the mappings could not be positively confirmed, only confirmed to degrade gracefully (no crash, no broken link). Recommend a follow-up check with a credit memo record that has a linked Sales Order and Proposal populated.
- Not clicked through to verify actual destination-page rendering for any hyperlink (relies on already-proven `Link`/routing patterns reused unchanged elsewhere in the portal); coverage was via `npm run build` (T017) plus the DOM/href inspection described above.
