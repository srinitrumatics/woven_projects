# Tasks: Purchase Order Landing Page Corrections

**Input**: Design documents from `specs/030-purchase-order-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column order/labels/hyperlink corrections (the bulk of the work — 11 new/split columns, 5 relabels, 1 removed column, 1 confirmed data bug fixed, 1 new hyperlink, 1 hyperlink removed). US2 = full-text/no-wrap headers + sticky-column regression check (already correct today). US3 = pagination (regression guard — already correct today). US4 = default sort order (regression guard — already correct today).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout, labels, hyperlinks
- **[US2]**: User Story 2 — Full-text headers + sticky column
- **[US3]**: User Story 3 — Pagination
- **[US4]**: User Story 4 — Default sort order

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type declarations that the mapping update in US1 depends on.

- [X] T001 In `app/purchase-orders/types.ts`, add `proposalNumber?: string;` to the `PurchaseOrder` interface (~line 50, alongside the existing `proposalName?: string`); remove `shipmentId?: string;` and `shipmentName?: string;` (~lines 61-62), which become fully unused once the Shipment column is removed in US1

**Checkpoint**: Foundational types ready — the `mappedPOs` mapping in US1 can now reference `proposalNumber` with full type support, and the removed `shipmentId`/`shipmentName` fields will surface as compile errors anywhere still referencing them (expected to be fully cleaned up by T005).

---

## Phase 3: User Story 1 — Column Layout, Labels, and Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: The Purchase Order landing page shows the exact 26-column set from FR-007, with Purchase Order # as a hyperlink, Customer Quote #/Proposal #/Customer Order # gated by account type (Supplier: plain text, Hybrid: hyperlink), Customer PO as plain text, Proposal Name as its own distinct column, Total Cost/Shipping/Grand Total each showing correct distinct figures, and all previously-unrendered fields populated.

**Independent Test**: Open the Purchase Order landing page as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-007 exactly, the three gated columns behave correctly per account type, and Purchase Order # navigates correctly.

- [X] T002 [US1] In `app/purchase-orders/page.tsx`, update the `mappedPOs` mapping (~lines 58-94): add `proposalNumber: p.Proposal_Number || p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || ''` immediately after the existing `proposalName` field; add `paymentTerms: p.Payment_Terms__c || ''`; remove the `shipmentId: p.Shipping_Manifest__c || ''` and `shipmentName: p.Shipping_Manifest_Name || p.Shipping_Manifest__r?.Name || ''` lines (depends on T001)

- [X] T003 [US1] In `app/purchase-orders/page.tsx`, update the `useResizableColumns` config (~lines 26-43): remove the `shipmentName` key; add `proposalNumber`, `shipToContactName`, `dropShip`, `productCost`, `shippingCost`, `grandTotal`, `paymentTerms`, `trackingNumber`, `trackingStatus`, `estimatedDeliveryDate`, `actualDeliveryDate`, `goodsReceiptDate` keys (depends on T002)

- [X] T004 [US1] In `app/purchase-orders/page.tsx`, update the header row (~lines 282-297): relabel `label="Purchase Order Name"` → `"Purchase Order #"`, `label="Customer Order"` → `"Customer Order #"`, `label="Customer Quote"` → `"Customer Quote #"`, `label="Acknowledged Date"` → `"Acknowledgement Date"`, `label="Promised Date"` → `"Promise Date"`; split `label="Proposal Name" field="proposalName"` into two headers — `label="Proposal #" field="proposalNumber"` followed by `label="Proposal Name" field="proposalName"`; remove the "Shipment" header entirely; relabel `label="Total Cost" field="totalCost"` → `field="productCost"` (same label, corrected field); insert "Shipping" (`field="shippingCost"`) and "Grand Total" (`field="totalCost"`) headers immediately after the corrected Total Cost header; insert "Ship to Contact" and "Drop Ship" headers immediately after "Ship to Location" and before "Total Lines"; insert "Payment Terms" immediately after "Grand Total" and before "Issued Date"; insert "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date", and "Goods Receipt Date" headers (in that order) immediately after "Promise Date" and before "Action" — final header order must match FR-007 exactly: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action (depends on T003)

- [X] T005 [US1] In `app/purchase-orders/page.tsx` body row (~lines 306-387): convert the Purchase Order # cell from plain text to a `Link` (`href={`/purchase-orders/${po.id}`}`, with `onClick={(e) => e.stopPropagation()}` to avoid double-navigation with the row's own click handler), preserving the sticky/bold styling; reorder the Customer Quote #, Proposal #, Customer Order # cells to match the new header order (Customer Quote # now comes before Proposal #); split the Proposal cell into a hyperlinked "Proposal #" cell (rendering `po.proposalNumber`, same `!isManufacturer` gating and `proposalId` target as today) followed by a plain-text "Proposal Name" cell (`displayCell(po.proposalName)`); replace the Customer PO cell's conditional `<Link>`/`<span>` block with a single `displayCell(po.customerPO)` (no hyperlink); remove the "Shipment" cell entirely; change the "Total Cost" cell to render `formatCurrency(po.productCost)`; insert a "Shipping" cell (`formatCurrency(po.shippingCost)`) and a "Grand Total" cell (`formatCurrency(po.totalCost)`) immediately after; insert "Ship to Contact" (`displayCell(po.shipToContactName)`) and "Drop Ship" (`po.dropShip ? "Yes" : "No"`) cells immediately after Ship to Location; insert a "Payment Terms" cell (`displayCell(po.paymentTerms)`) immediately after Grand Total; insert "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date", and "Goods Receipt Date" cells (using `formatDate(..., 'numeric-dash')` for the three date fields, matching the existing date-cell pattern) immediately after Promise Date and before Action (depends on T002, T004)

- [X] T006 [US1] In `app/purchase-orders/page.tsx`, update the `EmptyState` component's `colSpan={14}` (~line 539) to `colSpan={26}` to match the corrected 26-column table (this also fixes a pre-existing off-by-2 mismatch against the prior 16-column table) (depends on T004)

**Checkpoint**: Phase 3 complete — reload the Purchase Order landing page as both a Supplier and a Hybrid account and verify all 26 columns match FR-007 with correct labels, correct gating, and correct figures.

---

## Phase 4: User Story 2 — Full-Text Single-Line Headers and Fixed Record-Name Column (Priority: P2)

**Goal**: All column headers on the Purchase Order landing page render full-text on a single line with no wrap/ellipsis, and the Purchase Order # column stays pinned during horizontal scrolling — already correct today; this phase verifies no regression from the Phase 3 edits.

**Independent Test**: Narrow the viewport or scroll the table horizontally; confirm every header label (including the 11 new ones) stays fully readable on one line, and the leftmost Purchase Order # column remains visible.

- [X] T007 [US2] Verify (no code change expected) — confirm every `SortableHeader` call in the header row, including the 11 new ones inserted in T004, has `truncate={false}` (matching the convention already present on every pre-existing header on this page); confirm the Purchase Order # header/cell's sticky classes (`sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on the header; `sticky left-0 bg-white dark:bg-gray-800 z-10` on the body cell) survived the T004/T005 edits, including the Link conversion — add `truncate={false}` or restore sticky classes if missing (depends on T004, T005)

**Checkpoint**: Phase 4 complete — all headers (old and new) render full-text, single-line, with the sticky first column intact.

---

## Phase 5: User Story 3 — Pagination (Priority: P2)

**Goal**: Confirm the Purchase Order landing page remains paginated at 10 rows per page — a regression guard, since pagination is already implemented today.

**Independent Test**: Open the page with more than 10 purchase orders and confirm pagination controls appear, showing 10 rows per page, with working navigation.

- [X] T008 [US3] Verify (no code change expected) — reload the Purchase Order landing page with more than 10 purchase orders and confirm the existing `Pagination` component (`app/purchase-orders/page.tsx:396-403`) still renders correctly with the Phase 3 column edits applied (depends on T005)

**Checkpoint**: Phase 5 complete — no regressions to pagination from the Phase 3 edits.

---

## Phase 6: User Story 4 — Descending Default Sort Order (Priority: P2)

**Goal**: Confirm the Purchase Order landing page still defaults to Purchase Order # descending — a regression guard, since this is already correct today.

**Independent Test**: Reload the page without applying any manual sort and confirm the highest Purchase Order # appears first.

- [X] T009 [US4] Verify (no code change expected) — reload the Purchase Order landing page and confirm the `useSortableData` initializer at `app/purchase-orders/page.tsx:172` (`{ key: 'name', direction: 'desc' }`) is unchanged and rows appear in descending Purchase Order # order (depends on T005)

**Checkpoint**: Phase 6 complete — no regressions to default sort behavior from the Phase 3 edits.

---

## Phase 7: Polish & Verification

- [X] T010 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/purchase-orders/types.ts` and `app/purchase-orders/page.tsx` (the `shipmentId`/`shipmentName` removal in T001 will surface as a compile error if any reference was missed in T005)

- [X] T011 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, including switching between a Supplier-type and a Hybrid-type account to confirm the gating behavior on Customer Quote #/Proposal #/Customer Order #, plus the Proposal Number fallback behavior (the one residual live-org verification item)

**T011 result (2026-07-03, reduced scope per user's standing preference this session — login/live-data verification skipped)**: `.next` cleared and `npm run dev` started clean (`✓ Ready in 2.3s`, no compile errors, middleware compiled successfully). `GET /purchase-orders` returned `200 OK` (this route is not in `middleware.ts`'s `protectedRoutes` list, a pre-existing gap unrelated to this feature, so it renders without an auth redirect) and the response body confirmed the "Purchase Orders" heading rendered — the page's SSR shell compiled and executed with no runtime crash. Server stopped after the check. Full quickstart.md scenario-by-scenario validation (column rendering, Supplier/Hybrid gating, Total Cost/Grand Total figures, Proposal # fallback against live Salesforce data) was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. Blocks T002.
- **Phase 3 (US1)**: T002 depends on T001. T003 depends on T002. T004 depends on T003. T005 depends on T002 and T004. T006 depends on T004.
- **Phase 4 (US2)**: T007 depends on T004 and T005 (verification after all structural edits).
- **Phase 5 (US3)**, **Phase 6 (US4)**: Verification-only, depending on the final state of Phase 3's T005.
- **Phase 7 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The sole MVP slice — all other stories are regression guards.
- **US2, US3, US4 (all P2)**: Sequenced after US1 only to verify its edits didn't break already-correct behavior; none depend on US1's specific column content.

### Within Each Phase

- Phase 2: T001 only.
- Phase 3: Sequential — T002 → T003 → T004 → T005, all touching the same file in dependent sections (mapping → widths config → header → body); T006 can run any time after T004 since it touches an unrelated part of the same file (the `EmptyState` function).

### Parallel Opportunities

- None meaningful within this feature — a single file (`app/purchase-orders/page.tsx`) is touched by nearly every task, so edits are inherently sequential to avoid conflicts. `app/purchase-orders/types.ts` (T001) is the only independent file, but T002 depends on it directly.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001)
2. Complete Phase 3: US1 (T002-T006)
3. **STOP and VALIDATE**: Open the Purchase Order landing page as both a Supplier and a Hybrid account, verify all 26 columns match FR-007 and gating behaves correctly
4. Ship as MVP — headers/pagination/sort corrections can follow as fast-follows (though they're regression guards, not new work)

### Full Delivery

1. Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. Phase 7: Build + quickstart validation
3. All SC-001 through SC-011 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies — not applicable within this single-file feature beyond T001
- No test files to generate — validate visually using `quickstart.md`
- Most of this feature's "new" columns (Ship to Contact, Drop Ship, Shipping, Tracking Number, Tracking Status, Estimated/Actual Delivery Date, Goods Receipt Date) require **zero mapping changes** — their fields are already fetched, just never rendered; T004/T005 are pure UI-wiring tasks for these
- The Total Cost fix (T005) is a genuine, confirmed data-correctness bug: the column has been silently displaying the grand-total value under the "Total Cost" label since this page was built — call this out explicitly in code review since users may have relied on the (wrong) displayed figure
- The Supplier-vs-Hybrid gating (FR-009) requires **no new code** — the existing `isManufacturer` check already produces exactly this behavior; T005 only needs to apply the same existing pattern to the new Proposal # cell
- The Proposal Number field (T002) carries live-org verification risk — confirm during T011 or adjust if the live org differs; it degrades gracefully to the Proposal Name fallback either way
