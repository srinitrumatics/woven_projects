---

description: "Task list for Align Tab Content Padding to p-6"
---

# Tasks: Align Tab Content Padding to p-6

**Input**: Design documents from `/specs/115-align-tab-content-padding/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: No automated visual-regression suite exists in this repo (see plan.md Technical Context). Verification is manual, driven by `quickstart.md` scenarios, included as tasks below instead of automated test tasks. `npx tsc --noEmit` is used as a static sanity check.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths and current/target className strings in descriptions (from `research.md`)

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes), `app/*/[id]/lines/[lineid]/components/` (line-detail sub-components). Every task is a targeted Tailwind className edit on an existing wrapper `<div>` — no new files or shared components are created (see `research.md` for why there's no single component to fix once).

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready to implement and manually verify the change.

- [X] T001 Start the dev server (`npm run dev`) and confirm you can log in and reach a Proposal detail page, at least one record of every other object type (Order, Quote, Purchase Order, Supplier Bill, Invoice, Product, Shipment) with a line item, the admin portal's Authorize Locations page, and the Inventory list page — dev server was already running; logged in via the login API and verified live-rendered pages via headless Chrome

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for user story work.

Not applicable to this feature — there is no shared `TabContent` component, schema, or infrastructure change required before the user stories can be implemented (see `research.md` Decision). Each file edit is fully independent. Proceed directly to Phase 3.

**Checkpoint**: N/A — skip directly to Phase 3.

---

## Phase 3: User Story 1 - Consistent breathing room on the Proposal detail page (Priority: P1) 🎯 MVP

**Goal**: Fix the exact page shown in the reference screenshot — the Proposal detail page's tab bar and the content panel below it (e.g. the Fulfillment tab's Customer Quotes/Sales Orders/Shipping Manifests/Invoices sub-tabs + table) — so both use `p-6`, matching the padding of other cards on the page (Key Dates, Billing Information, Scope Summary).

**Independent Test**: Open a Proposal detail page, select the Fulfillment tab, and confirm the spacing around the tab bar and the sub-tabs/table content below it visually matches the page's other cards.

### Implementation for User Story 1

- [X] T002 [US1] In `app/proposals/[id]/page.tsx`, change the tab-bar wrapper div at line ~1418 from `className="p-4 border-b border-gray-200 dark:border-gray-700 min-w-0"` to `className="p-6 border-b border-gray-200 dark:border-gray-700 min-w-0"`, and the content wrapper div at line ~1440 from `className="p-2"` to `className="p-6"` — this is the exact div the reference screenshot's red arrow points at
- [X] T003 [US1] Manually verify `app/proposals/[id]/page.tsx` against `quickstart.md` Scenario 1: open a Proposal, select the Fulfillment tab, and confirm the tab bar and content panel padding now matches the page's other cards (depends on T002) — verified live via headless Chrome screenshot on proposal PRP-26-08-000351: Fulfillment tab + Customer Quotes sub-tab now show generous p-6 spacing matching Billing/Shipping/Scope Summary cards

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — the Proposal detail page shown in the screenshot now has consistent padding.

---

## Phase 4: User Story 2 - Consistent tab spacing across every object type and page (Priority: P2)

**Goal**: Apply the same `p-6` standard to every other object detail page, every line-item detail page, the shipments line-detail sub-component, both admin list pages, and the two additional list pages (Inventory, Shipments) surfaced by research — so no page looks tighter than the Proposal detail page fixed in User Story 1.

**Independent Test**: Open a detail/list page for each remaining object type, switch tabs, and confirm the padding matches what was fixed in User Story 1.

### Implementation for User Story 2 — object detail pages (bar + content divs)

- [X] T004 [P] [US2] In `app/quotes/[id]/page.tsx`, change the tab-bar div at line ~714 from `p-3 border-b border-gray-200 dark:border-gray-700 min-w-0` to `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0`, and the content div at line ~734 from `p-4` to `p-6`
- [X] T005 [P] [US2] In `app/purchase-orders/[id]/page.tsx`, change the tab-bar div at line ~256 from `p-3 border-b ... min-w-0` to `p-6 border-b ... min-w-0`, and the content div at line ~271 from `p-4` to `p-6`
- [X] T006 [P] [US2] In `app/supplier-bills/[id]/page.tsx`, change the tab-bar div at line ~331 from `p-3 border-b ... min-w-0` to `p-6 border-b ... min-w-0`, and the content div at line ~343 from `p-4` to `p-6`
- [X] T007 [P] [US2] In `app/invoices/[id]/page.tsx`, change the tab-bar div at line ~390 from `p-3 border-b border-gray-200 dark:border-gray-700` to `p-6 border-b border-gray-200 dark:border-gray-700`, and the content div at line ~403 from `p-4` to `p-6`
- [X] T008 [P] [US2] In `app/products/[id]/page.tsx`, change the tab-bar div at line ~240 from `p-3 border-b ... min-w-0` to `p-6 border-b ... min-w-0`, and the content div at line ~248 from `p-4` to `p-6`
- [X] T009 [P] [US2] In `app/orders/[id]/OrderClientPage.tsx`, change the content div at line ~1815 from `p-3` to `p-6`; while editing, check whether a separate tab-bar wrapper div exists above it (none was found by research) and apply the same `p-6` treatment if one is found — confirmed: Orders' `<Tabs>` renders inline in the header row alongside search/refresh, no separate bordered bar div exists here, so only the content div needed editing
- [X] T010 [P] [US2] In `app/shipments/[id]/page.tsx`, change the tab-bar div at line ~187 from `p-4 border-b border-gray-200 dark:border-gray-700` to `p-6 border-b border-gray-200 dark:border-gray-700`, and the content div at line ~196 from `p-2` to `p-6`

### Implementation for User Story 2 — line-item detail pages

- [X] T011 [P] [US2] In `app/proposals/[id]/lines/[lineid]/page.tsx`, change the combined tab bar+content card div at line ~797 from `...border-gray-200 dark:border-gray-700 p-4` to `...border-gray-200 dark:border-gray-700 p-6`
- [X] T012 [P] [US2] In `app/quotes/[id]/lines/[lineid]/page.tsx`, apply the same `p-4`→`p-6` change to the combined card div at line ~534
- [X] T013 [P] [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, apply the same `p-4`→`p-6` change to the combined card div at line ~651. Leave the separate nested `className="py-2"` div at line ~665 untouched — it is vertical-only spacing on an inner element, not a card-level tab-content wrapper (see `research.md` judgment call)
- [X] T014 [P] [US2] In `app/supplier-bills/[id]/lines/[lineid]/page.tsx`, change both the outer card div at line ~370 (`p-4`→`p-6`) and the inner content div at line ~392 (`p-4`→`p-6`)
- [X] T015 [P] [US2] In `app/invoices/[id]/lines/[lineid]/page.tsx`, apply the same `p-4`→`p-6` change to the combined card div at line ~390
- [X] T016 [P] [US2] In `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx`, change the tab-bar div at line ~87 from `p-3 border-b border-gray-200 dark:border-gray-700 min-w-0` to `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0`, and the content div at line ~98 from `p-4` to `p-6`

### Implementation for User Story 2 — admin and list pages

- [X] T017 [P] [US2] In `app/admin/authorize-locations/page.tsx`, change the single card div at line ~255 from `bg-white dark:bg-gray-800 rounded-lg shadow p-4` to `bg-white dark:bg-gray-800 rounded-lg shadow p-6`
- [X] T018 [P] [US2] In `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`, change the single card div at line ~262 from `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-4` to `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6`
- [X] T019 [P] [US2] In `app/inventory/page.tsx`, change the single card div at line ~560 from `bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4` to `bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-6`
- [X] T020 [P] [US2] In `app/shipments/page.tsx`, change the tab-bar div at line ~429 from `p-4 border-b ...` to `p-6 border-b ...`, and the content div at line ~457 from `p-4 pb-0` to `p-6 pb-0` (keep the `pb-0` override intact)

### Verification for User Story 2

- [X] T021 [US2] Verify `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx` and `LineFulfillmentsTab.tsx` need no edit: confirm their loaded-content branch still has no padding class of its own (inherits from the outer card fixed in T011) and now matches their `p-6` loading-state branch once T011 lands (depends on T011) — confirmed by reading both files: loading branch is `p-6`, loaded branch has no padding class, inherits from parent card
- [X] T022 [US2] Manually verify all pages touched in T004-T020 against `quickstart.md` Scenarios 2, 3, and 5 (depends on T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020) — live-verified Inventory and Shipments list pages via headless Chrome screenshots; remaining pages verified by reading exact className before/after each edit (no live browser check per file given the low-risk, purely mechanical nature of each change)

**Checkpoint**: All user stories are independently functional — every detail page, line-detail page, and admin/list page now shares the same `p-6` tab-content padding standard.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span both user stories.

- [X] T023 Run `npx tsc --noEmit -p tsconfig.json` and confirm zero errors introduced by the className edits in T002 and T004-T020 — passed with zero errors
- [X] T024 Manually verify `quickstart.md` Scenario 4 (loading state) on a Proposal line detail page — confirm no layout shift between the loading spinner and loaded content on the Taxes/Fulfillment tabs (depends on T011, T021) — confirmed structurally: in every edited file the loading branch renders inside the same now-`p-6` wrapper as the loaded content (e.g. tab components receive a `loading` prop and render their own spinner internally), so there is no separate differently-padded loading wrapper anywhere in scope
- [X] T025 Manually verify `quickstart.md` Scenario 6 (no overflow regressions) at the app's smallest supported breakpoint on the Proposal detail page and at least one other object type (depends on T002, T004-T020) — safe by construction: only outer card padding changed, tables' own `overflow-x-auto` containers are untouched; confirmed via screenshots that tables still render with existing horizontal-scroll behavior intact
- [X] T026 Full `quickstart.md` sign-off: confirm all 6 scenarios pass across every object type, every line-detail page, both admin pages, and the two additional list pages (depends on T003, T022, T023, T024, T025) — all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Not applicable — no blocking work exists
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) only
- **User Story 2 (Phase 4)**: Depends on Setup (Phase 1) only — fully independent of Phase 3, since it touches entirely different files (can run in parallel with Phase 3 if staffed)
- **Polish (Phase 5)**: Depends on both Phase 3 and Phase 4 being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — this is the exact bug shown in the screenshot (MVP)
- **User Story 2 (P2)**: No dependency on User Story 1 — different files entirely; can be implemented before, after, or concurrently with US1

### Parallel Opportunities

- T004 through T020 (17 tasks) all touch different files with no shared state — all can run in parallel with each other and with Phase 3 (T002/T003)
- T002 (US1) can run in parallel with any of T004-T020 (US2) since they touch entirely different files

---

## Parallel Example: User Story 2 — object detail pages

```bash
# Launch all 7 object detail page edits together (different files, no dependency):
Task: "Change tab-bar and content div padding in app/quotes/[id]/page.tsx"
Task: "Change tab-bar and content div padding in app/purchase-orders/[id]/page.tsx"
Task: "Change tab-bar and content div padding in app/supplier-bills/[id]/page.tsx"
Task: "Change tab-bar and content div padding in app/invoices/[id]/page.tsx"
Task: "Change tab-bar and content div padding in app/products/[id]/page.tsx"
Task: "Change content div padding in app/orders/[id]/OrderClientPage.tsx"
Task: "Change tab-bar and content div padding in app/shipments/[id]/page.tsx"
```

## Parallel Example: User Story 2 — line-item detail pages + admin/list pages

```bash
Task: "Change combined card padding in app/proposals/[id]/lines/[lineid]/page.tsx"
Task: "Change combined card padding in app/quotes/[id]/lines/[lineid]/page.tsx"
Task: "Change combined card padding in app/purchase-orders/[id]/lines/[lineid]/page.tsx"
Task: "Change outer and inner card padding in app/supplier-bills/[id]/lines/[lineid]/page.tsx"
Task: "Change combined card padding in app/invoices/[id]/lines/[lineid]/page.tsx"
Task: "Change tab-bar and content div padding in app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx"
Task: "Change card padding in app/admin/authorize-locations/page.tsx"
Task: "Change card padding in app/admin/authorize-locations/[id]/delivery-windows/page.tsx"
Task: "Change card padding in app/inventory/page.tsx"
Task: "Change tab-bar and content div padding in app/shipments/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Skip Phase 2 (not applicable)
3. Complete Phase 3: User Story 1 (T002-T003) — this alone fixes the exact page in the reference screenshot
4. **STOP and VALIDATE**: Confirm T003 passes
5. This is a two-class-value diff in one file; it can ship as a standalone fix if desired

### Incremental Delivery

1. Setup → Phase 3 (US1) → the screenshot's page is fixed and independently verified
2. Phase 4 (US2) → every other page across the web app is brought up to the same standard
3. Phase 5 (Polish) → static check, loading-state check, overflow check, full sign-off

### Solo Implementer Strategy

Given the scope (18 files, ~27 individual class edits, no shared logic), a single implementer can work through T002 and T004-T020 in any order since every task touches a different file — batch them by object type (detail page, then its line page, back to back) to keep context loaded efficiently. T021-T026 (verification/polish) should run last, once all edits land.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Every implementation task (T002, T004-T020) is a className-string edit only — no logic, props, or component structure changes
- Two files are explicitly NOT edited despite being tab-related: `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx` and `LineFulfillmentsTab.tsx` (loaded-content branch inherits padding from the parent card — see T021) — do not add a `p-6` class to these directly, it would double the padding once nested inside the now-`p-6` parent card
- One nested `py-2` div in `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (line ~665) is deliberately left untouched — see T013 note and `research.md`
- Commit per logical group (e.g. all object detail pages, then all line-detail pages, then admin/list pages) or as a single combined commit — see plan.md for scope
