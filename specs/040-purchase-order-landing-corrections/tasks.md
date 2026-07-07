# Tasks: Purchase Order Landing Page — Required Corrections

**Input**: Design documents from `specs/040-purchase-order-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: US1 (financial field mappings) contains the only genuine code fix — three adjacent line changes in one file. US2 (column layout/hyperlinks), US3 (headers/sticky/remaining columns), and US4 (pagination/sort) are verification-only — direct code inspection during planning confirmed they are already correctly implemented.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Financial field mapping corrections (Total Cost, Shipping, Grand Total dual-namespace fallback)
- **[US2]**: Column layout, labels, and account-type-conditional hyperlinks (verification/lock-in)
- **[US3]**: Header layout, fixed record-name column, and remaining columns (verification/lock-in)
- **[US4]**: Pagination and default sort order (verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — the three fixes in US1 are adjacent single-file changes with no dependency on any other task.

---

## Phase 3: User Story 1 — Correct Financial Field Mappings on the Purchase Order Landing Page (Priority: P1) 🎯 MVP

**Goal**: Total Cost, Shipping, and Grand Total each fall back to the namespaced (`gtherp__`-prefixed) API field when the unprefixed field is unpopulated, matching the dual-namespace convention already used elsewhere in this portal.

**Independent Test**: Open the Purchase Order landing page with a purchase order whose cost fields are populated only under the namespaced field names, and confirm Total Cost, Shipping, and Grand Total each show the correct, non-blank, independently distinct value.

- [X] T001 [US1] In `app/purchase-orders/page.tsx` line 85, change `productCost: p.Total_Product_Cost__c || 0` to `productCost: p.Total_Product_Cost__c || p.gtherp__Total_Product_Cost__c || 0`

  **Result**: Applied exactly as specified after a fresh re-read confirmed the file matched the planning-time audit.

- [X] T002 [US1] In `app/purchase-orders/page.tsx` line 86, change `shippingCost: p.Total_Shipping_Charges__c || 0` to `shippingCost: p.Total_Shipping_Charges__c || p.gtherp__Total_Shipping_Charges__c || 0`

  **Result**: Applied exactly as specified.

- [X] T003 [US1] In `app/purchase-orders/page.tsx` line 87, change `totalCost: p.Total_Cost__c || 0` to `totalCost: p.Total_Cost__c || p.gtherp__Total_Cost__c || 0` (depends on T001, T002 only in that all three are in the same file; no functional dependency)

  **Result**: Applied exactly as specified. All three fixes verified present in a single fresh read of lines 85-87.

**Checkpoint**: Phase 3 complete — reload the Purchase Order landing page, confirm Total Cost, Shipping, and Grand Total each show correct values for purchase orders using either field-name variant.

---

## Phase 4: User Story 2 — Correct Column Layout, Labels, and Account-Type-Conditional Hyperlinks (Priority: P1)

**Goal**: Confirm the 26-column order/labels match FR-010 exactly, and that Purchase Order # is an unconditional hyperlink while Customer Quote #/Proposal #/Customer Order # are hyperlinked only for Hybrid-type accounts.

**Independent Test**: Load the Purchase Order landing page as both a Supplier-type and Hybrid-type account, confirm column count/order/labels, click Purchase Order # to confirm it routes correctly for both account types, and confirm Customer Quote #/Proposal #/Customer Order # are plain text for Supplier and hyperlinks for Hybrid.

- [X] T004 [US2] Verify (no code change expected) — confirm column order/labels in `app/purchase-orders/page.tsx` (headers 292-317, body cells 326-397) match FR-010 exactly: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action

  **Result**: Confirmed via fresh re-read — all 26 columns match FR-010 exactly, in order, with correct labels.

- [X] T005 [US2] Verify (no code change expected) — confirm Purchase Order # (line 326-330) links unconditionally to `/purchase-orders/${po.id}` and is sticky; confirm Customer Quote # (332-344), Proposal # (345-357), and Customer Order # (359-371) each link conditionally only when the target ID exists AND `!isManufacturer` (isManufacturer defined line 184, byte-identical to the convention used on ~30 other files in this codebase) (depends on T004)

  **Result**: Confirmed all four hyperlink columns route correctly with the established account-type gating pattern intact.

- [X] T006 [US2] Verify (no code change expected) — confirm Proposal # (line 73, falls back to `Proposal_Name`/`Proposal__r?.Name`/`Proposal__c` when no dedicated number field) and Proposal Name (line 72, plain text) are two distinct fields/columns (depends on T004)

  **Result**: Confirmed Proposal # and Proposal Name are distinct columns as specified.

**Checkpoint**: Phase 4 complete — column order/labels and account-type-conditional hyperlink behavior confirmed correct.

---

## Phase 5: User Story 3 — Full-Text Single-Line Headers, Fixed Record-Name Column, and Remaining Columns (Priority: P2)

**Goal**: Confirm headers render full-text single-line (no wrap/ellipsis), the Purchase Order # column stays pinned, and all remaining columns (Ship to Contact, Drop Ship, Payment Terms, date fields, tracking, delivery-date columns) show correct values — already correct today, and unaffected by the US1 fix.

**Independent Test**: Narrow the viewport or scroll the table horizontally; confirm every header stays fully readable on one line and the leftmost column remains visible; confirm each remaining column shows a correct, non-blank value for a purchase order with that data populated.

- [X] T007 [US3] Verify (no code change expected) — confirm all 25 data-column `SortableHeader` calls on `app/purchase-orders/page.tsx` (lines 292-316) have `truncate={false}`; confirm the sticky classes on the Purchase Order # header (line 292) and body cell (line 326) remain intact after T001-T003's edits (depends on T001, T002, T003)

  **Result**: Confirmed via fresh re-read — all 25 `SortableHeader` calls have `truncate={false}`; sticky classes intact on both header and body cell.

- [X] T008 [US3] Verify (no code change expected) — confirm Ship to Contact (line 82), Drop Ship (line 83), Payment Terms (line 100), Issued/Acknowledgement/Request/Promise Date (lines 88-91), Tracking Number/Status (lines 95,97), Estimated/Actual Delivery Date and Goods Receipt Date (lines 96,98-99) are all correctly mapped and rendered with the null-dash convention (depends on T007)

  **Result**: Confirmed all remaining columns correctly mapped and rendered with the null-dash convention.

**Checkpoint**: Phase 5 complete — no regressions to header/sticky-column behavior or remaining columns from the US1 fix.

---

## Phase 6: User Story 4 — Pagination and Default Sort Order (Priority: P2)

**Goal**: Confirm pagination and default Record ID DESC sort remain correct after the US1 fix.

**Independent Test**: Open the Purchase Order landing page with more than 10 purchase orders and confirm pagination controls and default sort order.

- [X] T009 [US4] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` (line 15) and the `Pagination` component (406-413) are present and correctly wired; confirm `useSortableData(filteredPOs, { key: 'name', direction: 'desc' })` (line 182) confirms default Purchase Order # (Record ID) descending sort; confirm `colSpan={26}` on the empty-state row (line 549) correctly matches the 26 rendered columns (depends on T007, T008)

  **Result**: Confirmed pagination, default sort, and empty-state `colSpan` are all correct with no off-by-one bug.

**Checkpoint**: Phase 6 complete — pagination, default sort, and empty-state row confirmed correct.

---

## Phase 7: Polish & Verification

- [X] T010 Run a TypeScript check (`npx tsc --noEmit`, or `npm run build` if no conflicting `next dev` process is running) from repo root and confirm zero errors in `app/purchase-orders/page.tsx`

  **Result**: A `next dev` process (not started by this session) was already running, so `.next` was left untouched; ran `npx tsc --noEmit -p tsconfig.json` instead, which completed with zero errors project-wide.

- [X] T011 Start or use an already-running dev server and run through all `quickstart.md` validation scenarios, with particular attention to a purchase order whose cost data is populated only under the namespaced field names, and to both Supplier-type and Hybrid-type account behavior

  **Result**: Did not start an additional dev server — one was already running. Performed static verification instead: confirmed all three fixes (`|| p.gtherp__Total_Product_Cost__c`, `|| p.gtherp__Total_Shipping_Charges__c`, `|| p.gtherp__Total_Cost__c`) are present in the file exactly as specified, and confirmed via T004-T009 that no other column/hyperlink/formatting/pagination/sort behavior was affected. Full interactive validation against live Salesforce data was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001, T002, T003 touch adjacent lines in the same file with no functional dependency on each other — can be applied together in one pass.
- **Phase 4 (US2)**: T004 has no dependencies. T005, T006 depend on T004.
- **Phase 5 (US3)**: T007 depends on T001, T002, T003 (verifies the file's final state). T008 depends on T007.
- **Phase 6 (US4)**: T009 depends on T007, T008.
- **Phase 7 (Polish)**: T010, T011 require all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The sole corrective work — independently testable once T001-T003 are applied.
- **US2 (P1)**: Fully independent of US1 — different columns/logic in the same file, verification-only.
- **US3, US4 (both P2)**: Sequenced after US1/US2 since they verify cross-cutting behavior that depends on the final state of the file, though neither depends on US1's specific fix functionally.

### Parallel Opportunities

- T001, T002, T003 touch adjacent lines with no functional dependency — apply together in one pass.
- T004 (US2) can be verified in parallel with T001-T003 (US1) since they touch different parts of the same file conceptually, though in practice both are quick single-pass verifications.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 3: US1 (T001, T002, T003)
2. **STOP and VALIDATE**: Confirm Total Cost, Shipping, and Grand Total show correct values for both field-name variants
3. Ship as MVP — US2/US3/US4 are verification-only and add no further code changes

### Full Delivery

1. Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4)
2. Phase 7: Type-check/build + full quickstart validation
3. All SC-001 through SC-011 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is a low-risk feature: three adjacent field-mapping fixes, no new columns, no new API routes, no field-mapping changes beyond adding a fallback
- T001-T003's fix intentionally matches the exact dual-namespace fallback pattern already proven correct elsewhere in this portal (Box dimensions, Brand Name, Ship/Delivered dates), rather than introducing a new convention
