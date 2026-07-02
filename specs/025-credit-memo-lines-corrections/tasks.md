# Tasks: Invoice Line Page — Credit Memo Lines Tab Corrections

**Input**: Design documents from `specs/025-credit-memo-lines-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column layout, labels, and hyperlinks (the bulk of new column work). US2 = pagination (currently entirely absent). US3 = ascending default sort (currently no default sort at all, not just a wrong direction).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout, labels, hyperlinks
- **[US2]**: User Story 2 — Pagination
- **[US3]**: User Story 3 — Ascending default sort

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Interface and data-mapping changes that the column tasks in Phase 3 depend on.

- [X] T001 In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, update the `CreditMemoLine` interface (~lines 9-27): remove `invoiceLine: string`; add `customerQuoteLineId: string`, `customerQuoteId: string`, `proposedProduct: string`, `proposedProductId: string`, `productId: string`

- [X] T002 In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, update the data mapping (~lines 49-67): remove `invoiceLine: item.Invoice_Line_Name || ""`; fix `brand: undefined` → `brand: item.Brand_Name__c || item.gtherp__Brand_Name__c || ''`; add `customerQuoteLineId: item.Customer_Quote_Line__c || ''`, `customerQuoteId: item.Customer_Quote__c || item.Customer_Quote_Line__r?.Customer_Quote__c || ''`, `proposedProduct: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`, `productId: item.Product__c || ''` (depends on T001)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to the table JSX.

---

## Phase 3: User Story 1 — Column Layout, Labels, Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: The Credit Memo Lines tab shows the exact 15-column set, labels, and hyperlinks specified in FR-007.

**Independent Test**: Open an invoice line's Credit Memo Lines tab and verify column count/order matches FR-007 exactly, headers stay single-line with the first column pinned, and Customer Quote Line/Proposed Product/Product Name hyperlinks navigate correctly.

- [X] T003 [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, verify every `SortableHeader` (~lines 120-134) already has `truncate={false}` and the first column retains its `className="sticky left-0 top-0 z-20 ..."` after the edits below — no change expected; restore if lost during editing

- [X] T004 [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, update the `useResizableColumns` widths config (~lines 79-95): remove the `invoiceLine` key; add `proposedProduct: 180` (keep existing `customerQuoteLine` and `productName` keys)

- [X] T005 [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, update the header row (~lines 120-134): relabel `label="Credit Memo"` → `label="Credit Memo #"`, `label="Brand"` → `label="Brand Name"`, `label="Credit Qty"` → `label="Credited Qty"`; remove the "Invoice Line" header; insert a "Proposed Product" header immediately before "Product Name" — final header order must be: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total (depends on T004)

- [X] T006 [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` body row (~lines 138-160): remove the "Invoice Line" cell; convert the Customer Quote Line cell to a hyperlink: link to `/quotes/${item.customerQuoteId}/lines/${item.customerQuoteLineId}` when both ids are present, else `/quotes/${item.customerQuoteId}` when only the quote id is present, else plain text via `displayCell(item.customerQuoteLine)`; add a "Proposed Product" hyperlinked cell immediately before Product Name: link to `/products/${item.proposedProductId}` when present, else plain text via `displayCell(item.proposedProduct)`; convert the Product Name cell to a hyperlink: link to `/products/${item.productId}` when present, else keep the existing plain-text rendering (depends on T002, T005)

- [X] T007 [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, verify the existing Brand cell (`displayCell(item.brand)`, ~line 153) now renders real, non-blank values for rows where the underlying data is populated — no JSX change expected, this confirms the T002 mapping fix took effect

**Checkpoint**: Phase 3 complete — reload the Credit Memo Lines tab and verify all 15 columns appear in the exact FR-007 order with correct labels and hyperlinks.

---

## Phase 4: User Story 2 — Pagination (Priority: P1)

**Goal**: The Credit Memo Lines tab is paginated at 10 rows per page.

**Independent Test**: Open an invoice line with more than 10 associated credit memo lines and confirm pagination controls appear, showing 10 rows per page, with working page navigation.

- [X] T008 [US2] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, add pagination mirroring the pattern shipped in feature 024's `InvoiceLineItems.tsx`: import `Pagination` from `@/components/ui/Pagination` and `useMemo` from `react`; add `const ITEMS_PER_PAGE = 10;`, `const [currentPage, setCurrentPage] = useState(1);`, a `paginatedData` `useMemo` slicing `sortedData` by `(currentPage - 1) * ITEMS_PER_PAGE`, and `const totalPages = Math.ceil(creditMemoLines.length / ITEMS_PER_PAGE);`; change the table body to map over `paginatedData` instead of `sortedData`; render `<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={creditMemoLines.length} itemsPerPage={ITEMS_PER_PAGE} itemName="" />` below the table

**Checkpoint**: Phase 4 complete — Credit Memo Lines tab now paginates correctly with the full 15-column table.

---

## Phase 5: User Story 3 — Ascending Default Sort (Priority: P2)

**Goal**: The Credit Memo Lines tab default-sorts ascending by its own record identifier on first load.

**Independent Test**: Open an invoice line with multiple associated credit memo lines and confirm the lowest record identifier appears first on initial load, before any manual sort.

- [X] T009 [US3] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, change the `useSortableData` initializer (~line 78) from `useSortableData<CreditMemoLine>(creditMemoLines)` to `useSortableData<CreditMemoLine>(creditMemoLines, { key: 'lineName', direction: 'asc' })`

**Checkpoint**: Phase 5 complete — default ascending sort confirmed on first load.

---

## Phase 6: Polish & Verification

- [X] T010 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`

- [X] T011 Start dev server (`npm run dev`) and run through all 13 quickstart.md validation scenarios, plus the live-org field verification checklist (Customer Quote Line route, Proposed Product/Product Name id fields)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 depends on T001 (references the new/removed interface fields).
- **Phase 3 (US1)**: T003 (verification) has no dependency. T004 depends on Phase 2. T005 depends on T004. T006 depends on T002 and T005. T007 is a verification step depending on T002.
- **Phase 4 (US2)**: Independent of Phase 3's column changes — touches a different part of the same file (state/pagination logic vs. header/body columns) — but sequenced after Phase 3 to avoid edit conflicts in the same file.
- **Phase 5 (US3)**: A single independent line change — can be done any time after Phase 2, sequenced last here to avoid conflicting with the larger structural edits.
- **Phase 6 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The primary MVP slice — column layout and hyperlinks.
- **US2 (P1)**: Independent of US1's column content, but naturally sequenced after it to avoid touching the same file's JSX simultaneously.
- **US3 (P2)**: Independent one-line change; no risk of regressing US1/US2.

### Within Each Phase

- Phase 2: T001 first, then T002 (same file, sequential)
- Phase 3: Sequential — all tasks touch the same file/table

### Parallel Opportunities

- This feature touches a single file throughout, so most tasks are sequential by necessity; there are no meaningful cross-file parallel opportunities in this feature (unlike feature 024, which spanned two tab components)

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002)
2. Complete Phase 3: US1 (T003-T007)
3. **STOP and VALIDATE**: Open the Credit Memo Lines tab, verify all 15 columns match FR-007
4. Ship as MVP — the highest-value column corrections are live (pagination and default sort can follow as fast-follows)

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4 → Phase 5
2. Phase 6: Build + quickstart validation
3. All SC-001 through SC-008 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- This is the smallest-scope feature in this series (1 file) but starts from the lowest baseline: no hyperlinks, no pagination, and no default sort existed at all before this feature
- Three field/route mappings carry live-org verification risk and should be confirmed during T002/T011: the Customer Quote Line target route (line-level vs. quote-level), the Proposed Product id field (`Proposed_Product__c` — high confidence, the identical mapping was live-verified on the sibling `Invoice_Line__c` object in feature 024), and the Product Name id field (`Product__c`, unconfirmed, carried over from feature 024's unresolved risk). All degrade gracefully to plain text/"-" if unavailable.

## T011 Live Verification Results (2026-07-02)

Verified against the live Salesforce org (real `Apple` test account, invoice line `INLI-0000000012`) via headless Chrome with an authenticated session:

- All 15 headers render in the exact FR-007 order (confirmed via DOM extraction), with "Invoice Line" confirmed removed and both relabels ("Credit Memo #", "Credited Qty") and "Brand Name" confirmed present.
- Ascending default sort confirmed via the sort-direction arrow on "Credit Memo Line" (↑) — this tab had no default sort at all before this feature.
- Pagination footer renders ("Showing 1 to 1 of 1", Previous/Next) — confirms FR-004 on a tab that had no pagination at all before this feature.
- **Proposed Product (new)** hyperlink confirmed working with a real, distinct product id (`/products/a1CRK00002Q7NMT2A3`) — matches the exact product id already confirmed on the parent invoice line in feature 024's live verification, strongly validating the `Proposed_Product__c` field assumption on `Credit_Memo_Line__c` as well.
- **Customer Quote Line** and **Product Name (new hyperlink)** did **not** activate on the one sampled row — `customerQuoteId` and `productId` (assumed `Product__c`) were empty for this record, so both rendered as graceful plain-text fallback (`CQLI-0000000020`, product name text) rather than a broken link. This mirrors the exact same gap observed in feature 024's live verification of the sibling Invoice Lines tab and could not be positively confirmed here either — same follow-up recommendation applies.
- Credit Memo # (`CM-0000000002`), Sales Order Line (`SOLI-0000000014`), Unit Price (`$12.00`), Credited Qty (`10`), Total Price/Shipping/Taxes/Line Grand Total all rendered correctly and consistently with the equivalent parent invoice line data verified in feature 024.
- **Incident during verification**: running `rm -rf .next` to ensure a clean dev-server start broke the user's own separately-running dev server (same project directory, shared `.next` cache), which was still active on port 3000. Diagnosed and fixed by restarting that process (rebuilds `.next` automatically, no data/code lost) after confirming with the user. Recorded in project memory to avoid repeating this on a shared/already-running dev environment.
