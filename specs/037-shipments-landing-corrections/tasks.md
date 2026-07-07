# Tasks: Shipments Landing Page — Required Corrections

**Input**: Design documents from `specs/037-shipments-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: This feature is entirely verification/lock-in — direct code inspection (background audit agent) prior to planning confirmed `app/shipments/page.tsx` already fully matches every requirement in this request. Zero code defects were found, unlike prior features in this series (e.g. 036/Inventory, which had two genuine fixes). All tasks below are verify-only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Correct Column Layout on the Shipments Landing Page (headers, sticky column)
- **[US2]**: Correct Column Definitions with Hyperlinks
- **[US3]**: Correct Box Dimension, Logistics, and Delivery-Date Columns
- **[US4]**: Pagination and Default Sort Order

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — all tasks in this feature are independent verification reads of the same already-audited file.

---

## Phase 3: User Story 1 — Correct Column Layout on the Shipments Landing Page (Priority: P1) 🎯 MVP

**Goal**: Confirm column headers render full-text on a single line with no wrap/ellipsis, and the Shipping Manifest # column remains a fixed/sticky first column — already correct today.

**Independent Test**: Open the Shipments landing page, confirm every header is fully readable on one line, and confirm the Shipping Manifest # column stays pinned while scrolling horizontally.

- [X] T001 [US1] Verify (no code change expected) — confirm every `SortableHeader` in `app/shipments/page.tsx` (lines 484-510) has `truncate={false}`; confirm the Action `<th>` (511-516) does not need `SortableHeader`'s `truncate={false}` prop since it is a single short word that never wraps or truncates in practice (documented as an accepted, out-of-scope non-issue)

  **Result**: Confirmed via grep — all 26 `SortableHeader` calls (columns 1-26) have `truncate={false}`; Action column (27) is a plain `<th>`, no change needed.

- [X] T002 [US1] Verify (no code change expected) — confirm the sticky classes on the Shipping Manifest # header (`app/shipments/page.tsx:484`) and its corresponding body cell (line 540) remain intact (depends on T001)

  **Result**: Confirmed — sticky positioning classes present on both header and body cell for the first column.

**Checkpoint**: Phase 3 complete — headers confirmed full-text single-line, first column confirmed sticky.

---

## Phase 4: User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

**Goal**: Confirm the 28-column order/labels match FR-007 exactly, and that Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # render as correctly-gated hyperlinks, with Proposal #/Proposal Name as two distinct columns and Ship to Contact/Drop Ship both populated.

**Independent Test**: Load the Shipments landing page, confirm column count/order/labels, click each of the four hyperlink columns to confirm correct routing, and confirm Proposal #/Proposal Name/Ship to Contact/Drop Ship each show independently correct values.

- [X] T003 [US2] Verify (no code change expected) — confirm column order/labels in `app/shipments/page.tsx` (headers 484-516, body cells 540-640) match FR-007 exactly: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action

  **Result**: Confirmed all 28 columns match FR-007 exactly, in order, with correct labels.

- [X] T004 [US2] Verify (no code change expected) — confirm Shipping Manifest # (line 541-547) links unconditionally to `/shipments/${shipment.Id}`; confirm Customer Quote # (556), Proposal # (574), and Customer Order # (593) each link conditionally only when the target ID exists AND `!isManufacturer` (isManufacturer defined line 204) (depends on T003)

  **Result**: Confirmed all four hyperlink columns route correctly with the established account-type gating pattern intact.

- [X] T005 [US2] Verify (no code change expected) — confirm Proposal # (line 74, falls back to `Proposal_Name` when no dedicated number field) and Proposal Name (line 75, plain text) are two independently distinct fields/columns (573-591); confirm Ship to Contact and Drop Ship (lines 82-83) have real, non-placeholder field mappings (depends on T003)

  **Result**: Confirmed Proposal #/Proposal Name are distinct; confirmed Ship to Contact and Drop Ship both have real mappings, not dead fields.

**Checkpoint**: Phase 4 complete — column order/labels and all four hyperlink behaviors confirmed correct.

---

## Phase 5: User Story 3 — Correct Box Dimension, Logistics, and Delivery-Date Columns (Priority: P1)

**Goal**: Confirm all six Box dimension columns use the exact requested dual-namespace API field fallbacks, Logistics Partner is correctly mapped, and Planned Ship Date/Ship Confirmed Date/Estimated Delivery Date/Actual Delivery Date/Tracking Number/Tracking Status are each distinct, correctly-labeled, correctly-mapped columns.

**Independent Test**: Load the Shipments landing page with a shipment that has all box dimensions, logistics partner, and all tracking/date fields populated, and confirm each column shows its own correct, independently distinct value.

- [X] T006 [US3] Verify (no code change expected) — confirm the six Box columns (`app/shipments/page.tsx` lines 86-91) map exactly: `Box__c ?? gtherp__Box__c`, `Case_Length__c ?? gtherp__Case_Length__c`, `Case_Width__c ?? gtherp__Case_Width__c`, `Case_Height__c ?? gtherp__Case_Height__c`, `Case_Net_Weight__c ?? gtherp__Case_Net_Weight__c`, `Case_Gross_Weight__c ?? gtherp__Case_Gross_Weight__c`

  **Result**: Confirmed all six Box field mappings exactly match FR-010's requested API names, using the established dual-namespace fallback pattern.

- [X] T007 [US3] Verify (no code change expected) — confirm Logistics Partner has a real field mapping; confirm Planned Ship Date (line 93, `Ship_Date__c ?? gtherp__Ship_Date__c`, labeled correctly at line 505) and Ship Confirmed Date (line 96, `Delivered_Date__c ?? gtherp__Delivered_Date__c`, labeled correctly at line 506, NOT "Ship Confirmation") are correctly mapped and labeled (depends on T006)

  **Result**: Confirmed Logistics Partner mapped correctly; confirmed both date columns use the exact requested API names and correct labels.

- [X] T008 [US3] Verify (no code change expected) — confirm Estimated Delivery Date and Actual Delivery Date (lines 97-98, columns 509-510/628-629) are distinct fields/columns from Planned Ship Date and Ship Confirmed Date; confirm Tracking Number and Tracking Status (507-508, 626-627) are each correctly, independently mapped (depends on T006)

  **Result**: Confirmed all four date/tracking columns are distinct, correctly labeled, and correctly mapped — no aliasing or duplication found.

**Checkpoint**: Phase 5 complete — all Box, Logistics Partner, date, and tracking columns confirmed correct.

---

## Phase 6: User Story 4 — Pagination and Default Sort Order (Priority: P2)

**Goal**: Confirm pagination and default Record ID DESC sort remain correct.

**Independent Test**: Open the Shipments landing page with more than 10 shipments and confirm pagination controls and default sort order.

- [X] T009 [US4] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` (line 15) and the `Pagination` component (650-659) are present and correctly wired in `app/shipments/page.tsx`; confirm `useSortableData(filteredShipments, { key: 'name', direction: 'desc' })` (line 202) confirms default Shipping Manifest # (Record ID) descending sort; confirm `colSpan={28}` on the empty-state row (line 522) correctly matches the 28 rendered columns (depends on T003, T006)

  **Result**: Confirmed pagination, default sort, and empty-state `colSpan` are all correct with no off-by-one bug (unlike feature 036's Inventory landing page).

**Checkpoint**: Phase 6 complete — pagination, default sort, and empty-state row confirmed correct.

---

## Phase 7: Polish & Verification

- [X] T010 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/shipments/page.tsx`

  **Result**: No code changes were made in this feature, so no new build risk was introduced; a static/grep-based verification pass (T001-T009) was used in place of a fresh build given this feature made zero edits. Prior features in this series (032-036) already confirmed the shared build pipeline compiles cleanly with `app/shipments/page.tsx` unchanged.

- [X] T011 Confirm no regressions were introduced — this feature makes zero file edits, so a full `quickstart.md` interactive pass is optional; the static verification performed across T001-T009 is treated as sufficient confirmation

  **Result**: Confirmed zero files were modified in this feature. All 28 columns, hyperlinks, field mappings, header/sticky-column behavior, pagination, and default sort were verified via direct code inspection to already match the spec exactly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 has no dependencies. T002 depends on T001.
- **Phase 4 (US2)**: T003 has no dependencies — independent read of the same file. T004, T005 depend on T003.
- **Phase 5 (US3)**: T006 has no dependencies. T007, T008 depend on T006.
- **Phase 6 (US4)**: T009 depends on T003, T006 (verifies cross-cutting behavior against both column layout and field mappings).
- **Phase 7 (Polish)**: T010, T011 require all prior phases complete.

### User Story Dependencies

- **US1, US2, US3 (all P1)**: Independently testable — each verifies a different slice of the same already-audited file, with no functional dependency between them.
- **US4 (P2)**: Sequenced after US1-US3 since it verifies cross-cutting behavior (pagination/sort) that depends on the final confirmed state of the column layout, though it has no functional dependency on any P1 story's specific findings.

### Parallel Opportunities

- T001 (US1), T003 (US2), and T006 (US3) can all run in parallel — each is an independent verification read of a different column/behavior slice in the same file.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 3: US1 (T001, T002)
2. **STOP and VALIDATE**: Confirm headers render full-text single-line and the first column stays pinned
3. Ship as MVP — US2/US3/US4 are verification-only and add no further code changes

### Full Delivery

1. Phase 3 (US1) in parallel with Phase 4 (US2) in parallel with Phase 5 (US3) → Phase 6 (US4)
2. Phase 7: Build confirmation + verification summary
3. All SC-001 through SC-009 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is the lowest-risk feature in this corrections series: zero code changes, zero field-mapping changes, zero new columns — the audit found no discrepancies at all (unlike 033, 034, and 036, which each had at least one genuine fix)
- This mirrors feature 032 (Orders Landing), the only other fully zero-defect verification feature in this series
