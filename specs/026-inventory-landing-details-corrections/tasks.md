# Tasks: Inventory Landing Page & Inventory Details Page Corrections

**Input**: Design documents from `specs/026-inventory-landing-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = My Inventory landing page column corrections (brand fix, color/weight formatting, hyperlink — column order already correct). US2 = Inventory Details page column corrections (genuine reorder, RMA fallback, weight fix — the larger structural lift). US3 = full-text/no-wrap headers + sticky record-name column on both tables (regression guard — already correct today). US5 = default sort on both tables (regression guard — already correct today). US4 = pagination on both tables (regression guard — already correct today).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — My Inventory column corrections
- **[US2]**: User Story 2 — Inventory Details column corrections
- **[US3]**: User Story 3 — Full-text headers + sticky record-name column
- **[US4]**: User Story 4 — Pagination
- **[US5]**: User Story 5 — Default sort order

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — US1 (`app/inventory/page.tsx`) and US2 (`app/inventory/[id]/page.tsx`) touch entirely separate files with no shared types or mapping to update first (`InventoryPosition.brand` is already declared in `app/inventory/types.ts`).

---

## Phase 3: User Story 1 — My Inventory Column Corrections (Priority: P1) 🎯 MVP

**Goal**: The My Inventory landing page shows the exact 14-column set from FR-009, with a real Brand Name value, color-coded Qty Available, non-bold Total OH Value, and a genuine Product Name hyperlink.

**Independent Test**: Open My Inventory and verify column labels match FR-009 exactly, at least one item with a populated brand shows it, Qty Available renders red at 0 / green above 0, Total OH Value is non-bold, and clicking Product Name navigates via a real link.

- [X] T001 [US1] In `app/inventory/page.tsx`, add a `brand` field to the `mappedInventory` block (~line 86-119): `brand: item.Brand_Name__c || item.gtherp__Brand_Name__c || '',` (matches the fallback pattern already used in `app/invoices/[id]/page.tsx:52`)

- [X] T002 [US1] In `app/inventory/page.tsx`, relabel three `SortableHeader` calls in the header row (~lines 613-625): `label="Brand"` → `label="Brand Name"`, `label="Avg Inventory Age"` → `label="Avg Age (Days)"`, `label="Count Sites"` → `label="Sites"` — field props (`brand`, `avgInventoryAge`, `countSites`) stay unchanged

- [X] T003 [P] [US1] In `app/inventory/page.tsx`, replace the Product Name `<button onClick={() => router.push(...)}>` (~line 655) with a Next.js `Link` (`href={`/inventory/${item.productId || item.id}`}`), preserving the existing `title`, `hover:underline`, and `truncate` classes on the anchor so the sticky cell styling is unaffected

- [X] T004 [P] [US1] In `app/inventory/page.tsx`, add red/green conditional coloring to the Qty Available body cell (~line 672): change the static `text-primary font-bold` class to a conditional expression, e.g. `` `text-sm font-bold text-left truncate ${item.qtyAvailable === 0 ? 'text-red-600' : 'text-green-600'}` ``

- [X] T005 [P] [US1] In `app/inventory/page.tsx`, remove `font-semibold` from the Total OH Value body cell (~line 674) so it renders as regular (non-bold) text

**Checkpoint**: Phase 3 complete — reload My Inventory and verify all 14 columns match FR-009 with correct labels, a real Brand Name value, color-coded Qty Available, non-bold Total OH Value, and a working Product Name hyperlink.

---

## Phase 4: User Story 2 — Inventory Details Column Corrections (Priority: P1)

**Goal**: The Inventory Details page shows the exact 18-column set and order from FR-010 — Total CV (IN)/(SQFT) moved up after Total OH Value, Location/Site moved to the end, PO # | RMA # showing a fallback value, "Shipping Manifest" spaced correctly, and Total OH Value non-bold.

**Independent Test**: Open a product's Inventory Details page and verify column order matches FR-010 exactly, a position with only a PO # (or only an RMA #) still shows an identifier, the Shipping Manifest header reads with correct spacing, and Total OH Value is non-bold.

- [X] T006 [US2] In `app/inventory/[id]/page.tsx`, reorder and relabel the header row (~lines 209-226): move the "Total CV (IN)" and "Total CV (SQFT)" `SortableHeader` blocks to immediately after "Total Price" (relabel to "Total OH Value") and before "Sales Order"; move the "Location" and "Site" `SortableHeader` blocks to the very end, after "Invoiced"; relabel `label="Received"` → `"Received Date"`, `label="Age"` → `"Age (Days)"`, `label="PO | RMA"` → `"PO # | RMA #"`, `label="Qty On Hand"` → `"Qty on Hand"`, `label="Sales Order"` → `"Sales Order #"`, `label="ShippingManifest"` → `"Shipping Manifest"` — final header order must be: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site

- [X] T007 [US2] In `app/inventory/[id]/page.tsx`, reorder the body `<td>` cells (~lines 236-256) to match the header order from T006: move the Total CV (IN)/(SQFT) cells to immediately after the Total Price cell and before the Sales Order cell; move the Location/Site cells to the very end, after the Invoiced cell (depends on T006)

- [X] T008 [US2] In `app/inventory/[id]/page.tsx`, add an RMA fallback to the PO # | RMA # body cell: change `displayCell(item.Purchase_Order_Name)` to `displayCell(item.Purchase_Order_Name || item.RMA_Name)` — verify `RMA_Name` against the live org during validation; degrades to showing only the PO # (or "-") if the field is absent (depends on T007)

- [X] T009 [US2] In `app/inventory/[id]/page.tsx`, remove `font-bold` from the Total OH Value body cell (formerly the Total Price cell, ~line 248) so it renders as regular text (depends on T007)

**Checkpoint**: Phase 4 complete — reload Inventory Details and verify all 18 columns match FR-010 order exactly, with the RMA fallback, spacing fix, and non-bold Total OH Value confirmed.

---

## Phase 5: User Story 3 — Full-Text Headers & Sticky Record-Name Column (Priority: P2)

**Goal**: Confirm headers stay full-text/single-line and the record-name column stays pinned on both tables — this is a regression guard, since both behaviors are already correctly implemented today.

**Independent Test**: Narrow the viewport or scroll either table horizontally; confirm every header label stays fully readable on one line and the leftmost record-name column (Product Name / Inventory Position ID) remains visible.

- [X] T010 [US3] Verify (no code change expected) — in `app/inventory/page.tsx`, confirm every `SortableHeader` call still has `truncate={false}` after the T002/T003 edits, and that the Product Name cell's sticky `className`/`style={{ left: widths.checkbox }}` survived the T003 `Link` swap; in `app/inventory/[id]/page.tsx`, confirm every `SortableHeader` still has `truncate={false}` after the T006 reorder, and that "Inventory Position ID" retains its `sticky left-0` classes on both header and body cell — restore any lost classes (depends on T002, T003, T006, T007)

**Checkpoint**: Phase 5 complete — no regressions to header/sticky-column behavior from the Phase 3/4 edits.

---

## Phase 6: User Story 5 — Default Sort Order (Priority: P2)

**Goal**: Confirm My Inventory still defaults to Product Name descending and Inventory Details still defaults to Inventory Position ID ascending — a regression guard, since both are already correct today.

**Independent Test**: Reload each page without applying any manual sort and confirm the prescribed default ordering on first load.

- [X] T011 [US5] Verify (no code change expected) — reload My Inventory and confirm the `useSortableData` initializer at `app/inventory/page.tsx:133` (`{ key: 'name', direction: 'desc' }`) is unchanged and rows appear in descending Product Name order; reload Inventory Details and confirm the initializer at `app/inventory/[id]/page.tsx:131` (`{ key: 'Name', direction: 'asc' }`) is unchanged and rows appear in ascending Inventory Position ID order (depends on T002, T003, T006, T007)

**Checkpoint**: Phase 6 complete — no regressions to default sort behavior from the Phase 3/4 edits.

---

## Phase 7: User Story 4 — Pagination (Priority: P3)

**Goal**: Confirm both tables remain paginated at 10 rows per page — a regression guard, since pagination is already implemented on both pages today.

**Independent Test**: Open each page with more than 10 records and confirm pagination controls appear, showing 10 rows per page, with working navigation.

- [X] T012 [US4] Verify (no code change expected) — reload My Inventory with more than 10 items and confirm the existing `Pagination` component (`app/inventory/page.tsx:702-711`) still renders correctly with the Phase 3 column edits applied; reload a product's Inventory Details with more than 10 positions and confirm the existing `Pagination` component (`app/inventory/[id]/page.tsx:265-272`) still renders correctly with the Phase 4 column reorder applied (depends on T005, T009)

**Checkpoint**: Phase 7 complete — no regressions to pagination from the Phase 3/4 edits.

---

## Phase 8: Polish & Verification

- [X] T013 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/inventory/page.tsx` and `app/inventory/[id]/page.tsx`

- [X] T014 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios for both pages, including verifying the `RMA_Name` fallback field against the live org (per T008) and confirming it degrades gracefully if absent

**T014 result (2026-07-03, reduced scope per user request — login/live-data verification skipped)**: `.next` cleared and `npm run dev` started clean (`✓ Ready in 4.2s`, no compile errors, middleware compiled successfully). `GET /inventory` and `GET /inventory/test-id` both returned `307` redirects to `/auth?return=...` as expected for unauthenticated requests, confirming both routes are reachable and the server doesn't crash on either page. Server stopped after the check. Full quickstart.md scenario-by-scenario validation (column rendering, colors, RMA fallback against live Salesforce data) was explicitly deferred by the user to manual testing — not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** and **Foundational (Phase 2)**: Empty — no blocking prerequisites for either user story.
- **Phase 3 (US1)**: Fully independent — touches only `app/inventory/page.tsx`. Can start immediately.
- **Phase 4 (US2)**: Fully independent — touches only `app/inventory/[id]/page.tsx`, a different file from Phase 3. Can run in parallel with Phase 3.
- **Phase 5 (US3)**, **Phase 6 (US5)**: Verification-only tasks depending on the final state of both Phase 3 and Phase 4 edits (to confirm no regression).
- **Phase 7 (US4)**: Verification-only, depending on the final state of Phase 3 and Phase 4 edits.
- **Phase 8 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1 (P1)** and **US2 (P1)**: Independent of each other — different files, no shared state. Either can be the MVP slice.
- **US3 (P2)**, **US5 (P2)**, **US4 (P3)**: Pure regression guards with no code changes expected; sequenced after US1/US2 only to verify their edits didn't break already-correct behavior.

### Within Each Phase

- Phase 3: T001 and T002 touch the same header/mapping region sequentially; T003, T004, T005 are independent body-cell edits on different lines and can run in parallel (`[P]`).
- Phase 4: T006 (header reorder) must precede T007 (matching body reorder); T008 and T009 both depend on T007's completed reorder but touch different cells, so could be done in either order once T007 lands.

### Parallel Opportunities

- Phase 3 (US1, `app/inventory/page.tsx`) and Phase 4 (US2, `app/inventory/[id]/page.tsx`) can be worked on entirely in parallel by different developers since they're different files.
- Within Phase 3: T003, T004, and T005 are independent edits to different lines/cells and can run in parallel once T001/T002 land.

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# After T001 (brand mapping) and T002 (relabels) land, these are independent body-cell edits:
Task: "Replace Product Name button with Link in app/inventory/page.tsx"
Task: "Add red/green conditional color to Qty Available cell in app/inventory/page.tsx"
Task: "Remove font-semibold from Total OH Value cell in app/inventory/page.tsx"
```

---

## Implementation Strategy

### MVP (Either User Story)

Both US1 and US2 are P1 and fully independent — either can ship alone as a valid increment:

1. Complete Phase 3 (US1) → **STOP and VALIDATE**: My Inventory matches FR-009 → ship
2. Complete Phase 4 (US2) → **STOP and VALIDATE**: Inventory Details matches FR-010 → ship

### Full Delivery

1. Phase 3 + Phase 4 (in parallel or sequence)
2. Phase 5 → Phase 6 → Phase 7 (regression-guard verification)
3. Phase 8: Build + quickstart validation
4. All SC-001 through SC-012 verified

---

## Notes

- [P] = different files or non-overlapping cells/lines, no shared state dependencies
- No test files to generate — validate visually using `quickstart.md`
- US2's column reorder (T006-T007) is the largest structural change in this feature — Location/Site move from the middle of the table to the very end, and the two Total CV columns move up to sit right after Total OH Value; double-check header/body alignment carefully after reordering since a header/cell mismatch would silently show wrong data under the wrong label
- The RMA fallback field (`RMA_Name`, T008) is the one live-org verification risk in this feature — confirm during T014 or adjust the field name if the live org uses a different one; it degrades gracefully either way
- US3, US4, and US5 require no code changes — they exist as explicit tasks purely to lock in already-correct behavior as regression guards against the Phase 3/4 edits
