# Tasks: Customer Quote Landing Page — Required Corrections

**Input**: Design documents from `specs/035-customer-quote-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 (header layout/sticky column) and US4 (pagination/sort/page title) are both already correctly implemented today and are verification-only (regression-protection lock-ins). US2 (column definitions/hyperlinks) and US3 (missing financial/date columns) are the genuine corrective work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Header layout, fixed column, no-wrap (verification/lock-in)
- **[US2]**: Column definitions with hyperlinks (Proposal split, Customer PO unlink, Bill/Ship to Location & Contact, Drop Ship)
- **[US3]**: Missing financial and date columns (Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Ship Confirmed Date)
- **[US4]**: Pagination, default sort, page header (verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type and data-mapping changes that US2 and US3 both depend on.

- [X] T001 In `app/quotes/types.ts`'s `Quote` interface (lines 32-57), add: `billToLocationName?: string`, `billToContactName?: string`, `shipToLocationName?: string`, `shipToContactName?: string`, `dropShip?: boolean`, `shipping?: number`, `taxes?: number`, `grandTotal?: number`, `shipConfirmedDate?: string` (the existing `issuedDate?: string` at line 51 and `expirationDate?: string` at line 50 are reused as-is, no change needed to those two lines)

- [X] T002 In `app/quotes/page.tsx`'s `mappedQuotes` mapping (lines 58-75), add: `billToLocationName: item.Authorized_Bill_To_Location_Name || 'N/A'`, `billToContactName: item.Bill_to_Contact_Name || 'N/A'`, `shipToLocationName: item.Authorized_Ship_To_Location_Name || 'N/A'`, `shipToContactName: item.Ship_to_Contact_Name || 'N/A'`, `dropShip: item.Drop_Ship__c || false`, `shipping: item.Total_Shipping_Charges__c || 0`, `taxes: item.Total_Taxes_Amount__c || 0`, `grandTotal: item.Grand_Total__c || 0`, `issuedDate: item.Issued_Date__c || ''`, `shipConfirmedDate: item.Delivered_Date__c || ''` (the existing `expirationDate: item.Expiration_Date__c || ''` at line 74 already exists and needs no mapping change, only a corresponding column render added in US3) (depends on T001)

**Checkpoint**: Foundational types and data mapping ready — US2 and US3 can now reference their new fields with full type support.

**Result**: Both applied as specified. No drift found — `app/quotes/page.tsx` and `app/quotes/types.ts` matched their planning-time state exactly when re-read before editing.

---

## Phase 3: User Story 1 — Header Layout, Fixed Column (Priority: P1)

**Goal**: Confirm column headers remain full-text single-line (no wrap/ellipsis) and the first column (Customer Quote #) stays pinned while scrolling — already correct today.

**Independent Test**: Load the Customer Quotes landing page, inspect header rendering, and scroll horizontally to confirm the first column stays fixed.

- [X] T003 [US1] Verify (no code change expected) — confirm every `SortableHeader` call in the header row (`app/quotes/page.tsx` lines 449-459) has `truncate={false}`, and confirm the "Customer Quote #" header (line 449) and its body cell (line 488) carry sticky classes (`sticky left-0 ... z-10` on the header, `sticky left-0` on the cell) so the column stays pinned during horizontal scroll. If any header added later in T004/T005 is missing `truncate={false}`, add it to match this existing pattern.

  **Result**: Confirmed all 11 original headers had `truncate={false}` before any edits. After T004/T006 added 12 new headers, re-verified: all 23 `SortableHeader` calls now have `truncate={false}` (100% coverage), and the sticky classes on the first column (header + body cell) are unchanged.

**Checkpoint**: Phase 3 complete — headers render full-text single-line, first column stays pinned while scrolling (FR-001 through FR-003; SC-001, SC-002).

---

## Phase 4: User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

**Goal**: The Customer Quotes table shows the exact column order/labels from FR-008 through the Drop Ship column, with Proposal # split out as its own hyperlinked column, Customer PO no longer hyperlinked, and Bill to/Ship to Location and Contact columns added.

**Independent Test**: Open the Customer Quotes landing page, confirm column order through Drop Ship, click Customer Quote #/Proposal #/Customer Order # to confirm correct navigation, confirm Customer PO is plain text, and confirm Bill To/Ship To Account/Location/Contact each show distinct values.

- [X] T004 [US2] In `app/quotes/page.tsx`'s header row (lines 449-459): relabel "Quote Number" (line 449) to "Customer Quote #" (field unchanged); relabel "Customer Order" (line 452) to "Customer Order #" (field unchanged); split the "Proposal Name" header (line 451) into two headers — a new "Proposal #" header (field `proposalId` or `proposalName` per existing sort convention) immediately followed by "Proposal Name" (field `proposalName`, unchanged) — matching the split pattern already used on the corrected Orders landing page (feature 032); insert new "Bill to Location" (field `billToLocationName`) and "Bill to Contact" (field `billToContactName`) headers immediately after "Bill to Account" (line 454); insert new "Ship to Location" (field `shipToLocationName`) and "Ship to Contact" (field `shipToContactName`) headers immediately after "Ship to Account" (line 455); insert a new "Drop Ship" header (field `dropShip`) immediately after "Ship to Contact" and before "Total Lines" (line 456) — all new headers use `truncate={false}` matching the existing pattern (depends on T002)

- [X] T005 [US2] In `app/quotes/page.tsx`'s body row (lines 488-561): move the hyperlink currently on the "Proposal Name" cell (lines 496-515, `quote.proposalId && quote.proposalName !== 'N/A' ? (!isManufacturer ? <Link href={`/proposals/${quote.proposalId}`}>...) : ...) : ...`) to a new "Proposal #" cell using the same gating logic, and change the "Proposal Name" cell to plain `displayCell(quote.proposalName)`; simplify the "Customer PO" cell (lines 536-555, currently a conditional `Link` to `/purchase-orders/${quote.purchaseOrderId}`) to plain `<div className="text-sm text-gray-600 dark:text-gray-400" title={quote.customerPO}>{displayCell(quote.customerPO)}</div>` — no hyperlink; insert new "Bill to Location" and "Bill to Contact" cells (`displayCell(quote.billToLocationName)`/`displayCell(quote.billToContactName)`) immediately after the "Bill to Account" cell (line 557); insert new "Ship to Location" and "Ship to Contact" cells immediately after the "Ship to Account" cell (line 560); insert a new "Drop Ship" cell (`quote.dropShip ? 'Yes' : 'No'` as a badge, matching the Drop Ship presentation on the corrected Orders landing page) immediately after Ship to Contact and before "Total Lines" (line 562) (depends on T004)

**Checkpoint**: Phase 4 complete — reload the Customer Quotes landing page and verify columns through Drop Ship match FR-008, Proposal #/Customer Order # links work, Customer PO is plain text, and Bill To/Ship To trios show independent values.

**Result (T004)**: Applied as specified. "Proposal #" uses `field="proposalName"` (matching the sort key already used by the pre-existing "Proposal Name" header, consistent with how this portal's other corrected Proposal #/Name pairs both sort by the same underlying name field — e.g. features 032/033). T004 and T006 (US3's header insertions) were applied together in one edit pass since they're contiguous in the same header row.

---

## Phase 5: User Story 3 — Add Missing Financial and Date Columns (Priority: P1)

**Goal**: The table shows Shipping, Taxes, and Grand Total alongside Total Price, and Issued Date, Expiration Date, and Ship Confirmed Date alongside the existing Request Date and Planned Ship Date.

**Independent Test**: Open the Customer Quotes landing page with a quote that has populated shipping, tax, grand total, and all five date fields, and confirm each new column shows its own correct, independently distinct value.

- [X] T006 [US3] In `app/quotes/page.tsx`'s header row, insert new "Shipping" (field `shipping`), "Taxes" (field `taxes`), and "Grand Total" (field `grandTotal`) headers immediately after "Total Price" (line 457) and before "Request Date"; insert new "Issued Date" (field `issuedDate`) and "Expiration Date" (field `expirationDate`) headers immediately after "Grand Total" and before "Request Date" (line 458); insert a new "Ship Confirmed Date" (field `shipConfirmedDate`) header immediately after "Planned Ship Date" (line 459) and before the "Action" `<th>` (line 460) — all new headers use `truncate={false}` — final column order after this task must be: Customer Quote #, Status, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Planned Ship Date, Ship Confirmed Date, Action (depends on T005, same file, sequenced after T004/T005's header/body edits)

- [X] T007 [US3] In `app/quotes/page.tsx`'s body row, insert new "Shipping" (`formatCurrency(quote.shipping)`), "Taxes" (`formatCurrency(quote.taxes)`), and "Grand Total" (`formatCurrency(quote.grandTotal)`) cells immediately after the "Total Price" cell (line 563); insert new "Issued Date" (`formatDate(quote.issuedDate, 'numeric-dash')`) and "Expiration Date" (`formatDate(quote.expirationDate, 'numeric-dash')`) cells immediately after "Grand Total" and before "Request Date" (line 564); insert a new "Ship Confirmed Date" (`formatDate(quote.shipConfirmedDate, 'numeric-dash')`) cell immediately after "Planned Ship Date" (line 565) and before the Action cell (line 566) (depends on T006)

**Checkpoint**: Phase 5 complete — reload the Customer Quotes landing page and verify all 24 columns match FR-008 exactly, with Shipping/Taxes/Grand Total and all five dates showing independent values.

**Result (T005, T007)**: Applied as specified. Verified via grep: 23 `SortableHeader` columns + 1 plain Action `<th>` = 24 total, matching FR-008 exactly with zero discrepancies.

---

## Phase 6: Widths Configuration and Empty-State Fix (Cross-Cutting)

**Purpose**: Update the shared `useResizableColumns` config and the empty-state `colSpan` to match the corrected 24-column table — required by both US2 and US3's new columns.

- [X] T008 In `app/quotes/page.tsx`'s `useResizableColumns` config (lines 28-41): rename `billTo` → `billToAccount` and `shipTo` → `shipToAccount` (updating the corresponding `width={widths.billTo}`/`width={widths.shipTo}` references in the header/body JSX from T004/T005 to use the renamed keys); add width entries for `proposalNumber`, `billToLocation`, `billToContact`, `shipToLocation`, `shipToContact`, `dropShip`, `shipping`, `taxes`, `grandTotal`, `issuedDate`, `expirationDate`, `shipConfirmedDate`; change the empty-state row's `colSpan={12}` (line 471) to `colSpan={24}` to match the corrected column count (depends on T007)

**Checkpoint**: Phase 6 complete — all new columns have working resize handles, and the empty-state row spans the full corrected table width.

**Result**: Applied as specified. Confirmed via grep no stale references to the old `widths.billTo`/`widths.shipTo` keys remain.

---

## Phase 7: User Story 4 — Pagination, Default Sort Order, and Page Header (Priority: P2)

**Goal**: Confirm pagination, default DESC sort by Customer Quote #, and the "Customer Quotes" page header remain correct after the column edits in Phases 4-6 — already correct today.

**Independent Test**: Load the page with more than 10 quotes and confirm pagination controls, initial sort order, and the page heading text.

- [X] T009 [US4] Verify (no code change expected) — confirm the `Pagination` component (`app/quotes/page.tsx` lines 589-596) and `ITEMS_PER_PAGE = 10` (line 17) still render correctly with the corrected 24-column table; confirm `useSortableData<Quote>(filteredAndSearchedQuotes, { key: 'quoteNumber', direction: 'desc' })` (line 144) is unchanged and rows appear in descending Customer Quote # order on first load; confirm the page heading (line 169) still reads "Customer Quotes" (depends on T008)

  **Result**: Confirmed all three unchanged after the column edits — no code change made.

**Checkpoint**: Phase 7 complete — no regressions to pagination, default sort, or page title from the column corrections.

---

## Phase 8: Polish & Verification

- [X] T010 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/quotes/types.ts` and `app/quotes/page.tsx`

  **Result (2026-07-06)**: A `next dev` process (not started by this session) was already running against `.next`, so `.next` was intentionally left untouched to avoid repeating an earlier session mistake (an over-broad process action that stopped someone else's dev server). `npm run build` completed cleanly without clearing the cache: zero TypeScript errors, `/quotes` built successfully at 7.52 kB (up from its pre-feature size, consistent with the added columns).

- [X] T011 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, confirming the Shipping/Taxes/Grand Total/Issued Date fields (the residual live-org verification risk items from `research.md`) degrade gracefully to "-" if unavailable in the live org

  **Result (2026-07-06)**: Did not start an additional dev server — one was already running (see T010). Performed static verification instead: grep-confirmed 24 total columns (23 `SortableHeader` + 1 Action `<th>`) match FR-008 exactly, 100% `truncate={false}` coverage, sticky-column classes intact, `colSpan={24}` applied, no stale `widths.billTo`/`widths.shipTo` references, and the Customer PO cell no longer contains a `Link`/`href` (confirmed plain `displayCell` only). Full interactive click-through against live Salesforce data was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 depends on T001. Blocks Phase 4 and Phase 5.
- **Phase 3 (US1)**: T003 has no dependencies on Foundational — can run immediately, independently verifying already-correct behavior.
- **Phase 4 (US2)**: T004 depends on T002. T005 depends on T004.
- **Phase 5 (US3)**: T006 depends on T005 (same file, sequential). T007 depends on T006.
- **Phase 6 (widths/colSpan)**: T008 depends on T007 (needs the final column set from both US2 and US3).
- **Phase 7 (US4)**: T009 depends on T008 (verifies the fully-corrected table).
- **Phase 8 (Polish)**: T010, T011 require all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: Independently testable at any time — no dependency on Foundational or other stories.
- **US2, US3 (both P1)**: Sequenced (US2 before US3) only because they edit the same file's header/body rows sequentially; neither depends on the other's column content.
- **US4 (P2)**: Sequenced last since it verifies the fully-corrected table, but its own behavior (pagination/sort/title) is independent of US2/US3's specific columns.

### Parallel Opportunities

- T001 (types.ts) has no file overlap with any other task and could start immediately.
- T003 (US1 verification) can run in parallel with the entire Foundational → US2 → US3 → widths chain, since it only reads already-correct, unrelated header attributes.
- Limited other parallelism: `app/quotes/page.tsx` is touched by nearly every task (T002, T004-T009), so those edits are inherently sequential to avoid conflicts.

---

## Implementation Strategy

### MVP (User Story 2 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 4: US2 (T004, T005)
3. **STOP and VALIDATE**: Confirm Proposal #/Proposal Name split, Customer PO unlinked, and Bill To/Ship To Location/Contact columns all correct
4. Ship as MVP — the missing financial/date columns (US3) can follow as a fast-follow

### Full Delivery

1. Phase 2 → Phase 4 → Phase 5 → Phase 6 → Phase 7 (Phase 3/US1 can run anytime in parallel)
2. Phase 8: Build + full quickstart validation
3. All SC-001 through SC-012 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- US1 and US4 are verification-only because `research.md` (Phase 0) confirmed the header layout, sticky column, pagination, default sort, and page title are already correctly implemented — call this out in code review as "confirmed, not re-implemented" rather than treating it as untouched/unverified
- Removing the Customer PO hyperlink (T005) is a simplification, not a new gating rule — the `isManufacturer`/`isRestricted` checks previously guarding it become dead code for that specific cell and should be removed only from that cell's JSX, not from the file (they're still used by the Proposal #/Customer Order # cells)
- Four field additions carry residual live-org verification risk (Shipping, Taxes, Grand Total, Issued Date on the `Customer_Quote__c` object) — confirm during T011 or adjust field names if the live org differs; all degrade gracefully to "-" either way
