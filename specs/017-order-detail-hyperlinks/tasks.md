# Tasks: Order & Quote Hyperlinks on Detail Pages

**Input**: Design documents from `specs/017-order-detail-hyperlinks/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅

**Scope note**: Research (Phase 0) confirmed that Customer Quote hyperlinks are fully implemented (spec 016) and the Order Line Details page has zero Customer Order/Quote references. The only implementation work is adding Customer Order hyperlinks to the Debit Memos and RTV sub-tables in `ReturnsTab.tsx`. US2 resolves as a verification-only task (confirmed no-op).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup

**Purpose**: Verify current state of the target file before making changes.

- [x] T001 Read and confirm current DebitMemo and RTV interface definitions and Customer_Order_Name rendering in `app/orders/[id]/components/ReturnsTab.tsx`

---

## Phase 2: User Story 1 — Customer Order Links on Order Details Page (Priority: P1) 🎯 MVP

**Goal**: Add `Customer_Order_Id__c` ID fields to the `DebitMemo` and `RTV` interfaces, add a `canLinkOrders` permission flag, and render `Customer_Order_Name` as a conditional hyperlink to `/orders/{Id}` in the Debit Memos and RTV sub-tables.

**Independent Test**: Navigate to any Order Details page → Returns tab → Debit Memos sub-tab. Confirm the Customer Order column shows a clickable hyperlink (blue, underlined) for rows with a related Customer Order. Confirm rows with no Customer Order ID show `—` as plain text. Repeat for RTV sub-tab.

### Implementation for User Story 1

- [x] T002 [US1] Add `Customer_Order_Id__c?: string` to `DebitMemo` interface in `app/orders/[id]/components/ReturnsTab.tsx`
- [x] T003 [US1] Add `Customer_Order_Id__c?: string` to `RTV` interface in `app/orders/[id]/components/ReturnsTab.tsx`
- [x] T004 [US1] Add `canLinkOrders` flag (`isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid'`) alongside existing `canLinkProposals`/`canLinkQuotes` in `app/orders/[id]/components/ReturnsTab.tsx`
- [x] T005 [US1] Render `Customer_Order_Name` as `<Link href={/orders/${dm.Customer_Order_Id__c}} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">` when `canLinkOrders && dm.Customer_Order_Id__c` in the Debit Memos sub-table in `app/orders/[id]/components/ReturnsTab.tsx`
- [x] T006 [US1] Render `Customer_Order_Name` as the same conditional hyperlink pattern using `rtv.Customer_Order_Id__c` in the RTV sub-table in `app/orders/[id]/components/ReturnsTab.tsx`

**Checkpoint**: User Story 1 is complete. Debit Memos and RTV Customer Order columns now render as hyperlinks for permitted users.

---

## Phase 3: User Story 2 — Customer Order & Quote Links on Order Line Details Page (Priority: P2)

**Goal**: Verify no Customer Order or Customer Quote reference columns exist on the Order Line Details page that require linking (research confirmed this is a no-op — the page contains no such references).

**Independent Test**: Navigate to any Order Line Details page (`/orders/[id]/lines/[lineId]`). Confirm the page renders correctly with no added or broken elements. No Customer Order or Customer Quote link columns are expected.

- [x] T007 [US2] Confirm all Order Line Details sub-components (`LineHeader`, `ProductCarousel`, `OrderLineNotes`, `ProductInfo`, `OrderDetailsTable`, `LineTaxesTab`, `LineNavigation`) contain no Customer Order or Customer Quote reference fields requiring hyperlinks in `app/orders/[id]/lines/[lineId]/` — document as confirmed no-op per research.md Decision 3

**Checkpoint**: US2 verified. Order Line Details page requires no code changes.

---

## Phase 4: Polish & Validation

**Purpose**: Build verification and end-to-end functional validation.

- [x] T008 Run `npm run build` and confirm zero TypeScript errors after ReturnsTab.tsx changes
- [ ] T009 Execute all 6 scenarios from `specs/017-order-detail-hyperlinks/quickstart.md` against `npm run dev` and confirm all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 completion
  - T002, T003 are sequential (same file)
  - T004 follows T002 and T003 (same file)
  - T005 follows T004 (requires `canLinkOrders` to be defined)
  - T006 follows T005 (same file, sequential edits)
- **US2 (Phase 3)**: Independent of Phase 2 — can run in parallel with US1 if desired; pure verification
- **Polish (Phase 4)**: Depends on Phases 2 and 3 completion

### User Story Dependencies

- **US1 (P1)**: Only dependency is completing Phase 1 (setup verification)
- **US2 (P2)**: Independent — verification only, no code changes

### Within US1 (Phase 2)

All tasks in Phase 2 modify the same file (`ReturnsTab.tsx`) and must run sequentially:

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 (parallel) → T008 → T009
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (read + verify current state)
2. Complete Phase 2: US1 (6 sequential edits to `ReturnsTab.tsx`)
3. **STOP and VALIDATE**: Run `npm run build`, then test Debit Memos and RTV manually
4. Proceed to US2 verification (Phase 3) and final polish (Phase 4)

### Incremental Delivery

1. T001 — understand current state → ready to implement
2. T002–T003 — interface fields added → TypeScript types correct
3. T004 — permission flag added → link logic can be written
4. T005–T006 — hyperlinks rendered → feature visible in UI
5. T007 — US2 no-op confirmed → scope closure documented
6. T008–T009 — build green + manual validation → feature shipped

---

## Notes

- All changes are in a single file: `app/orders/[id]/components/ReturnsTab.tsx`
- No new API routes, no DB changes, no Salesforce Apex changes
- `canLinkOrders` follows the exact same pattern as `canLinkProposals` and `canLinkQuotes`
- Null guard (`dm.Customer_Order_Id__c ? <Link> : plain text`) prevents broken links if the ID field is absent from the API response
- Existing Customer Quote links (spec 016) are unaffected — ReturnsTab.tsx changes are additive
