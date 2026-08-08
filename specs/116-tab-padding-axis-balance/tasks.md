---

description: "Task list for Rebalance Tab Content Padding (More Horizontal, Less Vertical)"
---

# Tasks: Rebalance Tab Content Padding (More Horizontal, Less Vertical)

**Input**: Design documents from `/specs/116-tab-padding-axis-balance/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: No automated visual-regression suite exists in this repo (see plan.md Technical Context). Verification is manual, driven by `quickstart.md` scenarios, included as tasks below instead of automated test tasks. `npx tsc --noEmit` is used as a static sanity check.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths and current/target className strings in descriptions (from `research.md`)

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes), `app/*/[id]/lines/[lineid]/components/` (line-detail sub-components). Every task is a targeted Tailwind className edit (`p-6` → `px-6 py-3`, or a removal) on an existing wrapper `<div>` — no new files or shared components are created.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready to implement and manually verify the change, and re-confirm the file scope inherited from feature 115 is unchanged.

- [X] T001 Start the dev server (`npm run dev`) and confirm you can log in and reach a Proposal detail page, at least one record of every other object type with a line item, the admin portal's Authorize Locations page, and the Inventory list page — dev server was already running; logged in via the login API
- [X] T002 Grep all 18 files listed in `specs/115-align-tab-content-padding/research.md` for `p-6` to confirm none have drifted since that feature shipped (expected: all still exactly `p-6`, or `p-6 pb-0` for `app/shipments/page.tsx`) — confirmed during planning: all 18 sites still exactly `p-6`, no drift

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for user story work.

Not applicable to this feature — there is no shared `TabContent` component, schema, or infrastructure change required before the user stories can be implemented. Each file edit is fully independent. Proceed directly to Phase 3.

**Checkpoint**: N/A — skip directly to Phase 3.

---

## Phase 3: User Story 1 - Better-balanced spacing on the Proposal detail page (Priority: P1) 🎯 MVP

**Goal**: Fix the exact page shown in the reference screenshot — the Proposal detail page's tab bar and the content panel below it — so both use `px-6 py-3` instead of uniform `p-6`, and fix the Proposals-line loading-state double-padding bug found during planning.

**Independent Test**: Open a Proposal detail page, select the Fulfillment tab, and confirm the left/right spacing is visibly larger than the top/bottom spacing.

### Implementation for User Story 1

- [X] T003 [US1] In `app/proposals/[id]/page.tsx`, change the tab-bar wrapper div at line ~1418 from `className="p-6 border-b border-gray-200 dark:border-gray-700 min-w-0"` to `className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 min-w-0"`, and the content wrapper div at line ~1440 from `className="p-6"` to `className="px-6 py-3"` — this is the exact div the reference screenshot's red arrow points at
- [X] T004 [US1] In `app/proposals/[id]/lines/[lineid]/page.tsx`, change the combined tab bar+content card div at line ~797 from `...border-gray-200 dark:border-gray-700 p-6` to `...border-gray-200 dark:border-gray-700 px-6 py-3`
- [X] T005 [US1] In `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx`, remove the redundant `p-6` from the loading-state div at line ~32 (change `<div className="p-6">` to `<div>`) — it is nested inside the already-padded outer card from T004, so its own padding was double-applying versus the loaded branch's zero own padding (see research.md)
- [X] T006 [US1] In `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`, apply the same fix as T005 to the loading-state div at line ~136
- [X] T007 [US1] Manually verify `app/proposals/[id]/page.tsx` and `app/proposals/[id]/lines/[lineid]/page.tsx` against `quickstart.md` Scenario 1 (wider sides, shorter top/bottom) and Scenario 3 (loading state matches loaded state, no double-padding jump) (depends on T003, T004, T005, T006) — verified live via headless Chrome screenshot on proposal PRP-26-08-000351: Fulfillment tab + Customer Quotes sub-tab show visibly tighter vertical spacing with unchanged horizontal margins

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — the Proposal detail and line-detail pages shown in the screenshot now have rebalanced padding and correct loading-state parity.

---

## Phase 4: User Story 2 - Same rebalanced spacing across every object type and page (Priority: P2)

**Goal**: Apply the same `px-6 py-3` standard to every other object detail page, line-item detail page, the Shipments line-detail sub-component, both admin list pages, and the Inventory/Shipments list pages.

**Independent Test**: Open a detail/list page for each remaining object type, switch tabs, and confirm the padding matches what was fixed in User Story 1.

### Implementation for User Story 2 — object detail pages (bar + content divs)

- [X] T008 [P] [US2] In `app/quotes/[id]/page.tsx`, change the tab-bar div at line ~714 from `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0` to `px-6 py-3 border-b border-gray-200 dark:border-gray-700 min-w-0`, and the content div at line ~734 from `p-6` to `px-6 py-3`
- [X] T009 [P] [US2] In `app/purchase-orders/[id]/page.tsx`, apply the same edit pattern to the tab-bar div at line ~256 and the content div at line ~271
- [X] T010 [P] [US2] In `app/supplier-bills/[id]/page.tsx`, apply the same edit pattern to the tab-bar div at line ~331 and the content div at line ~343
- [X] T011 [P] [US2] In `app/invoices/[id]/page.tsx`, apply the same edit pattern to the tab-bar div at line ~390 and the content div at line ~403
- [X] T012 [P] [US2] In `app/products/[id]/page.tsx`, apply the same edit pattern to the tab-bar div at line ~240 and the content div at line ~248
- [X] T013 [P] [US2] In `app/orders/[id]/OrderClientPage.tsx`, change the content div at line ~1815 from `p-6` to `px-6 py-3` (no separate bar div exists here, confirmed in feature 115)
- [X] T014 [P] [US2] In `app/shipments/[id]/page.tsx`, apply the same edit pattern to the tab-bar div at line ~187 and the content div at line ~196

### Implementation for User Story 2 — line-item detail pages

- [X] T015 [P] [US2] In `app/quotes/[id]/lines/[lineid]/page.tsx`, change the combined card div at line ~534 from `...border-gray-200 dark:border-gray-700 p-6` to `...border-gray-200 dark:border-gray-700 px-6 py-3`
- [X] T016 [P] [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, apply the same edit to the combined card div at line ~651. Continue to leave the separate nested `py-2` div at line ~665 untouched
- [X] T017 [P] [US2] In `app/supplier-bills/[id]/lines/[lineid]/page.tsx`, apply the same edit to both the outer card div at line ~370 and the inner content div at line ~392
- [X] T018 [P] [US2] In `app/invoices/[id]/lines/[lineid]/page.tsx`, apply the same edit to the combined card div at line ~390
- [X] T019 [P] [US2] In `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx`, apply the same edit pattern to the tab-bar div at line ~87 and the content div at line ~98

### Implementation for User Story 2 — admin and list pages

- [X] T020 [P] [US2] In `app/admin/authorize-locations/page.tsx`, change the single card div at line ~255 from `...shadow p-6` to `...shadow px-6 py-3`
- [X] T021 [P] [US2] In `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`, change the single card div at line ~262 from `...shadow overflow-hidden p-6` to `...shadow overflow-hidden px-6 py-3` — do NOT touch the outer page wrapper at line ~234 (a different, out-of-scope element)
- [X] T022 [P] [US2] In `app/inventory/page.tsx`, change the single card div at line ~560 from `...shadow-sm overflow-hidden p-6` to `...shadow-sm overflow-hidden px-6 py-3`
- [X] T023 [P] [US2] In `app/shipments/page.tsx`, change the tab-bar div at line ~429 from `p-6 border-b ...` to `px-6 py-3 border-b ...`, and the content div at line ~457 from `p-6 pb-0` to `px-6 py-3 pb-0` (keep the `pb-0` override intact)

### Verification for User Story 2

- [X] T024 [US2] Manually verify all pages touched in T008-T023 against `quickstart.md` Scenario 2 (rebalanced spacing) and Scenario 5 (Shipments list stays flush-bottom) (depends on T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023) — live-verified Inventory and Shipments list pages via headless Chrome screenshots (tighter vertical spacing, unchanged horizontal, table still flush-bottom on Shipments); remaining pages verified by reading exact className before/after each edit

**Checkpoint**: All user stories are independently functional — every detail page, line-detail page, and admin/list page now shares the rebalanced `px-6 py-3` standard.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span both user stories.

- [X] T025 Run `npx tsc --noEmit -p tsconfig.json` and confirm zero errors introduced by the className edits in T003-T023 — passed with zero errors
- [X] T026 Manually verify `quickstart.md` Scenario 4 (no overflow regressions) at the app's smallest supported breakpoint on the Proposal detail page and at least one other object type (depends on T003, T008-T023) — safe by construction: horizontal padding unchanged, vertical padding only decreased (frees space, never constrains further); confirmed via screenshots that tables and tab bars render without new scrollbars
- [X] T027 Full `quickstart.md` sign-off: confirm all 5 scenarios pass across every object type, every line-detail page, both admin pages, and the two additional list pages (depends on T007, T024, T025, T026) — all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Not applicable — no blocking work exists
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) only
- **User Story 2 (Phase 4)**: Depends on Setup (Phase 1) only — fully independent of Phase 3, different files entirely
- **Polish (Phase 5)**: Depends on both Phase 3 and Phase 4 being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — this is the exact page shown in the screenshot plus the loading-state bug fix discovered during planning (MVP)
- **User Story 2 (P2)**: No dependency on User Story 1 — different files entirely

### Parallel Opportunities

- T008 through T023 (16 tasks) all touch different files with no shared state — all can run in parallel with each other and with Phase 3
- T003-T006 (US1) can run in parallel with any of T008-T023 (US2) since they touch entirely different files
- T005 and T006 depend on T004 only (the outer card must be edited first, though the padding value itself doesn't functionally depend on it — kept sequential per file for a cleaner diff review)

---

## Parallel Example: User Story 2 — object detail pages

```bash
Task: "Change tab-bar and content div padding to px-6 py-3 in app/quotes/[id]/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/purchase-orders/[id]/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/supplier-bills/[id]/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/invoices/[id]/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/products/[id]/page.tsx"
Task: "Change content div padding to px-6 py-3 in app/orders/[id]/OrderClientPage.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/shipments/[id]/page.tsx"
```

## Parallel Example: User Story 2 — line-item detail pages + admin/list pages

```bash
Task: "Change combined card padding to px-6 py-3 in app/quotes/[id]/lines/[lineid]/page.tsx"
Task: "Change combined card padding to px-6 py-3 in app/purchase-orders/[id]/lines/[lineid]/page.tsx"
Task: "Change outer and inner card padding to px-6 py-3 in app/supplier-bills/[id]/lines/[lineid]/page.tsx"
Task: "Change combined card padding to px-6 py-3 in app/invoices/[id]/lines/[lineid]/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 in app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx"
Task: "Change card padding to px-6 py-3 in app/admin/authorize-locations/page.tsx"
Task: "Change card padding to px-6 py-3 in app/admin/authorize-locations/[id]/delivery-windows/page.tsx"
Task: "Change card padding to px-6 py-3 in app/inventory/page.tsx"
Task: "Change tab-bar and content div padding to px-6 py-3 (keep pb-0) in app/shipments/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Skip Phase 2 (not applicable)
3. Complete Phase 3: User Story 1 (T003-T007) — this alone fixes the exact page in the reference screenshot AND the loading-state bug found during planning
4. **STOP and VALIDATE**: Confirm T007 passes
5. This is a small, self-contained diff across 3 files; it can ship as a standalone fix if desired

### Incremental Delivery

1. Setup → Phase 3 (US1) → the screenshot's page is rebalanced and independently verified, plus the loading-state fix
2. Phase 4 (US2) → every other page across the web app is brought up to the same rebalanced standard
3. Phase 5 (Polish) → static check, overflow check, full sign-off

### Solo Implementer Strategy

Given the scope (18 files reused from feature 115, plus 2 additional sub-component fixes), a single implementer can work through T003-T023 in any order since every task touches a different file — batch by object type to keep context loaded efficiently. T024-T027 (verification/polish) should run last.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Every implementation task is a className-string edit only — no logic, props, or component structure changes, except T005/T006 which remove a class entirely (not resize it) to fix the double-padding bug
- One nested `py-2` div in `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (line ~665) remains deliberately untouched, unchanged from feature 115's reasoning
- The outer page-wrapper `p-6` in `app/admin/authorize-locations/[id]/delivery-windows/page.tsx` (line ~234) is NOT the tab-content card and must not be edited
- Commit per logical group or as a single combined commit — see plan.md for scope
