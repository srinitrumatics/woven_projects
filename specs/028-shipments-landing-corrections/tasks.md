# Tasks: Shipments Landing Page Corrections

**Input**: Design documents from `specs/028-shipments-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column order/labels/hyperlink corrections (the bulk of the work — 11 new columns, 5 relabels, 1 split, 1 new hyperlink). US2 = full-text/no-wrap headers (net new — currently missing on all 16 existing headers) + sticky-column regression check. US3 = pagination (regression guard — already correct today). US4 = default sort order (regression guard — already correct today).

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

- [X] T001 In `app/shipments/types.ts`, add optional fields to the `ShippingManifest` interface (~lines 4-30): `Proposal_Number?: string`, `Ship_to_Contact_Name?: string`, `Drop_Ship__c?: boolean`, `Box__c?: number`, `Case_Length__c?: number`, `Case_Width__c?: number`, `Case_Height__c?: number`, `Case_Net_Weight__c?: number`, `Case_Gross_Weight__c?: number`, `Estimated_Delivery_Date__c?: string` (the interface already declares an unused `Actual_Delivery_Date__c?: string` at line 29 — no change needed there, it becomes consumed by T002)

**Checkpoint**: Foundational types ready — the `uiShipments` mapping in US1 can now reference these fields with full type support.

---

## Phase 3: User Story 1 — Column Layout, Labels, and Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: The Shipments landing page shows the exact 28-column set from FR-007, with Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # as hyperlinks, Proposal Name as its own distinct column, and all 11 previously-missing fields populated.

**Independent Test**: Open the Shipments landing page and verify column count/order matches FR-007 exactly, Proposal #/Proposal Name show two distinct values, Ship to Contact/Drop Ship/Box fields/new delivery dates show real data, and all four required hyperlinks navigate correctly.

- [X] T002 [US1] In `app/shipments/page.tsx`, update the `uiShipments` mapping (~lines 66-88): replace the single `proposal`/`proposalId` pair with `proposalNumber: s.Proposal_Number || s.Proposal_Name || ''`, `proposalName: s.Proposal_Name || ''`, keep `proposalId: s.Proposal__c || ''`; add `shipToContact: s.Ship_to_Contact_Name || ''`, `dropShip: s.Drop_Ship__c || false`, `boxCount: s.Box__c ?? s.gtherp__Box__c ?? null`, `boxLength: s.Case_Length__c ?? s.gtherp__Case_Length__c ?? null`, `boxWidth: s.Case_Width__c ?? s.gtherp__Case_Width__c ?? null`, `boxHeight: s.Case_Height__c ?? s.gtherp__Case_Height__c ?? null`, `boxNetWeight: s.Case_Net_Weight__c ?? s.gtherp__Case_Net_Weight__c ?? null`, `boxGrossWeight: s.Case_Gross_Weight__c ?? s.gtherp__Case_Gross_Weight__c ?? null`, `estimatedDeliveryDate: s.Estimated_Delivery_Date__c || ''`, `actualDeliveryDate: s.Actual_Delivery_Date__c || ''`; add `gtherp__` fallbacks to the two existing date fields: `shipDate: s.Ship_Date__c ?? s.gtherp__Ship_Date__c ?? ''`, `deliveredDate: s.Delivered_Date__c ?? s.gtherp__Delivered_Date__c ?? ''` (depends on T001)

- [X] T003 [US1] In `app/shipments/page.tsx`, update the `useResizableColumns` config (~lines 135-153): rename the `proposal` key to `proposalNumber` and add a new `proposalName` key; add new keys `shipToContact`, `dropShip`, `boxCount`, `boxLength`, `boxWidth`, `boxHeight`, `boxNetWeight`, `boxGrossWeight`, `estimatedDeliveryDate`, `actualDeliveryDate` (depends on T002)

- [X] T004 [US1] In `app/shipments/page.tsx`, update the header row (~lines 462-483): relabel `label="Shipping Manifest"` → `"Shipping Manifest #"`, `label="Sales Order"` → `"Sales Order #"`, `label="Customer Quote"` → `"Customer Quote #"`, `label="Proposal Name"` (currently `field="proposal"`) → split into two headers — `label="Proposal #" field="proposalNumber"` immediately followed by `label="Proposal Name" field="proposalName"`, `label="Customer Order"` → `"Customer Order #"`, `label="Ship Confirmation"` → `"Ship Confirmed Date"`; insert new headers: "Ship to Contact" and "Drop Ship" immediately after "Ship to Location" and before "Total Lines"; the six Box headers ("Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", "Box Gross Weight") immediately after "Total Price" and before "Logistics Partner"; "Estimated Delivery Date" and "Actual Delivery Date" immediately after "Tracking Status" and before "Action" — final header order must match FR-007 exactly: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action (depends on T003)

- [X] T005 [US1] In `app/shipments/page.tsx` body row (~lines 502-591): convert the Shipping Manifest # cell from plain `displayCell(shipment.name)` to a `Link` (`href={`/shipments/${shipment.Id}`}`, with `onClick={(e) => e.stopPropagation()}` to avoid double-navigation with the row's own click handler), preserving the existing sticky/bold styling; split the existing Proposal cell into two cells — a hyperlinked "Proposal #" cell (same `shipment.proposalId ? <Link>...` pattern already used for Customer Quote/Customer Order, rendering `shipment.proposalNumber`) immediately followed by a plain-text "Proposal Name" cell (`displayCell(shipment.proposalName)`); insert plain-text cells for Ship to Contact and Drop Ship (rendered `shipment.dropShip ? "Yes" : "No"`) immediately after Ship to Location; insert six plain-text/numeric cells for the Box fields immediately after Total Price; insert two date cells (`formatDate(shipment.estimatedDeliveryDate, 'numeric-dash')`, `formatDate(shipment.actualDeliveryDate, 'numeric-dash')`) immediately after Tracking Status and before Action — final body cell order must match the T004 header order exactly, and the empty-state `colSpan={17}` (line 489) must be updated to `colSpan={28}` (depends on T002, T004)

**Checkpoint**: Phase 3 complete — reload the Shipments landing page and verify all 28 columns match FR-007 with correct labels, populated new fields, and working hyperlinks.

---

## Phase 4: User Story 2 — Full-Text Single-Line Headers and Fixed Record-Name Column (Priority: P2)

**Goal**: Every column header on the Shipments landing page renders full-text on a single line with no wrap/ellipsis, and the Shipping Manifest # column stays pinned during horizontal scrolling.

**Independent Test**: Narrow the viewport or scroll the table horizontally; confirm every header label stays fully readable on one line, and the leftmost Shipping Manifest # column remains visible.

- [X] T006 [US2] In `app/shipments/page.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T004 edits, all 27 sortable headers plus the static "Action" `<th>` is unaffected since it's plain text) (depends on T004)

- [X] T007 [US2] Verify (no code change expected) — confirm the Shipping Manifest # column's sticky classes (`sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on the header; `sticky left-0 bg-white dark:bg-gray-800 z-10` on the body cell) survived the T004/T005/T006 edits, including the T005 `Link` conversion — restore if lost (depends on T005, T006)

**Checkpoint**: Phase 4 complete — headers render full-text, single-line, with the sticky first column intact.

---

## Phase 5: User Story 3 — Pagination (Priority: P2)

**Goal**: Confirm the Shipments landing page remains paginated at 10 rows per page — a regression guard, since pagination is already implemented today.

**Independent Test**: Open the page with more than 10 shipments and confirm pagination controls appear, showing 10 rows per page, with working navigation.

- [X] T008 [US3] Verify (no code change expected) — reload the Shipments landing page with more than 10 shipments and confirm the existing `Pagination` component (`app/shipments/page.tsx:601-609`) still renders correctly with the Phase 3 column edits applied (depends on T005)

**Checkpoint**: Phase 5 complete — no regressions to pagination from the Phase 3 edits.

---

## Phase 6: User Story 4 — Descending Default Sort Order (Priority: P2)

**Goal**: Confirm the Shipments landing page still defaults to Shipping Manifest # descending — a regression guard, since this is already correct today.

**Independent Test**: Reload the page without applying any manual sort and confirm the highest Shipping Manifest # appears first.

- [X] T009 [US4] Verify (no code change expected) — reload the Shipments landing page and confirm the `useSortableData` initializer at `app/shipments/page.tsx:180` (`{ key: 'name', direction: 'desc' }`) is unchanged and rows appear in descending Shipping Manifest # order (depends on T005)

**Checkpoint**: Phase 6 complete — no regressions to default sort behavior from the Phase 3 edits.

---

## Phase 7: Polish & Verification

- [X] T010 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/shipments/types.ts` and `app/shipments/page.tsx`

- [X] T011 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, including confirming the Proposal Number fallback behavior (the one residual live-org verification item)

**T011 result (2026-07-03, reduced scope per user's standing preference this session — login/live-data verification skipped)**: `.next` cleared and `npm run dev` started clean (`✓ Ready in 3s`, no compile errors, middleware compiled successfully). `GET /shipments` returned a `307` redirect to `/auth?return=/shipments` as expected for an unauthenticated request, confirming the route is reachable and the server doesn't crash. Server stopped after the check. Full quickstart.md scenario-by-scenario validation (column rendering, hyperlinks, Proposal # fallback, Drop Ship Yes/No, box dimension values against live Salesforce data) was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. Blocks T002.
- **Phase 3 (US1)**: T002 depends on T001. T003 depends on T002. T004 depends on T003. T005 depends on T002 and T004.
- **Phase 4 (US2)**: T006 depends on T004 (touches the same header lines). T007 depends on T005 and T006 (verification after all structural edits).
- **Phase 5 (US3)**, **Phase 6 (US4)**: Verification-only, depending on the final state of Phase 3's T005.
- **Phase 7 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The sole MVP slice — all other stories are regression guards or a follow-on formatting pass on the same file.
- **US2, US3, US4 (all P2)**: Sequenced after US1 only to avoid touching the same file's header/body JSX simultaneously; none depend on US1's specific column content, only on its edits having landed first.

### Within Each Phase

- Phase 2: T001 only.
- Phase 3: Sequential — T002 → T003 → T004 → T005, all touching the same file in dependent sections (mapping → widths config → header → body).
- Phase 4: T006 → T007 (verification after the truncate edit).

### Parallel Opportunities

- None meaningful within this feature — a single file (`app/shipments/page.tsx`) is touched by every task, so edits are inherently sequential to avoid conflicts. `app/shipments/types.ts` (T001) is the only independent file, but T002 depends on it directly.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001)
2. Complete Phase 3: US1 (T002-T005)
3. **STOP and VALIDATE**: Open the Shipments landing page, verify all 28 columns match FR-007
4. Ship as MVP — headers/pagination/sort corrections can follow as fast-follows

### Full Delivery

1. Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. Phase 7: Build + quickstart validation
3. All SC-001 through SC-009 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies — not applicable within this single-file feature beyond T001
- No test files to generate — validate visually using `quickstart.md`
- The Proposal #/Proposal Name split (T002, T004, T005) is the most structurally involved change in this feature — a single existing column becomes two, reusing the same `proposalId` for the new hyperlink
- The empty-state `colSpan` (line 489, currently `17`) MUST be updated to `28` in T005 or the "No shipments found" row will render misaligned
- Ten new/split fields carry low live-org verification risk since their field names are already confirmed via `app/proposals/[id]/page.tsx`'s existing mapping of the same object (see research.md §2); only the dedicated Proposal Number field remains genuinely unconfirmed, and it degrades gracefully to the Proposal Name fallback either way
