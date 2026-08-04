---

description: "Task list for Visual Hygiene Fixes"
---

# Tasks: Visual Hygiene Fixes

**Input**: Design documents from `/specs/095-visual-hygiene-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-011: no business-logic, data-fetching, or Salesforce read/write changes anywhere — every fix is presentation-layer styling consolidation or a breadcrumb-navigation bug fix.

**Organization**: Tasks are grouped by user story, ordered by priority (US3 is P1; US2/US4 are P2; US1 is P3 — spec.md's own narrative numbering doesn't match priority order). All 4 stories are fully independent — zero shared files across any of them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), `components/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: User Story 3 - Every breadcrumb trail looks the same and always navigates (Priority: P1) 🎯 MVP

**Goal**: Build a shared `Breadcrumb` component and migrate all 3 Proposal-module breadcrumb copies onto it, fixing `ProposalHeader.tsx`'s non-functional segments as a side effect.

**Depends on**: Nothing — independent of every other phase. Internally, T002-T005 depend on T001 (the component must exist first).

**Independent Test**: Open a Proposal Detail page and click its "Proposals" breadcrumb segment; confirm it now navigates to the Proposals list. Confirm the Summary and Line Detail pages' breadcrumbs are visually identical and still work.

### Implementation for User Story 3

- [X] T001 [US3] Create `components/ui/Breadcrumb.tsx`: `{ items: { label: string; href?: string }[], className? }`. Renders a `<div>` wrapping each item — items with `href` as `next/link` styled `hover:text-gray-700 dark:hover:text-gray-300`, items without `href` as plain `<span className="text-gray-900 dark:text-white truncate">`, separated by `<span>&gt;</span>`, matching the exact visual pattern already used identically by the Summary and Line Detail pages' breadcrumbs
- [X] T002 [US3] Migrate `app/proposals/[id]/components/ProposalHeader.tsx`: add a new `id: string` prop to `ProposalHeaderProps`; replace the static `<span>` breadcrumb chain (lines 14-20) with `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:proposalNumber}]} className="mb-2" />` — depends on T001
- [X] T003 [US3] Update `app/proposals/[id]/page.tsx`: pass `id={id}` to `<ProposalHeader>` (line ~1400), using the `id` already in scope from `const { id } = use(params)` (line 50) — depends on T002
- [X] T004 [P] [US3] Migrate `app/proposals/[id]/summary/page.tsx`: replace the `<button onClick={() => router.push(...)}>` breadcrumb chain (lines 56-71) with `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:"Proposal Workspace"}]} className="mb-1" />` — depends on T001. Also removed the now-unused `useRouter` import and `const router = useRouter();` (its only 2 call sites were the replaced breadcrumb buttons).
- [X] T005 [P] [US3] Migrate `app/proposals/[id]/lines/[lineid]/page.tsx`: replace the identical `<button onClick={() => router.push(...)}>` breadcrumb chain (lines 633-648) with `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:product.sku}]} className="mb-1" />` — depends on T001. Also removed the now-unused `useRouter` import and `const router = useRouter();` (its only 2 call sites were the replaced breadcrumb buttons).
- [X] T006 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: `ProposalHeader.tsx`'s "Proposals"/"Proposal Details" segments now render as real `next/link`s (previously static spans); all 3 files render `<Breadcrumb>` with identical item shapes and separator style; the final segment on all 3 remains plain non-clickable text. `npx tsc --noEmit` clean. Live browser verification not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: All 3 breadcrumb instances share one component; `ProposalHeader.tsx`'s previously-broken navigation now works.

---

## Phase 2: User Story 4 - Filter pills look and behave the same across every list page (Priority: P2)

**Goal**: Migrate Shipments List, Inventory List, and Admin Delivery Windows' filter pills onto the shared `Tabs` component.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open all 3 pages and confirm identical filter-pill shape/colors, matching `Tabs.tsx`'s existing visual style; confirm filtering still works on all 3.

### Implementation for User Story 4

- [X] T007 [P] [US4] Migrate `app/shipments/page.tsx`'s filter pills (lines 444-467) onto `<Tabs tabs={[{key:'All',label:'All'}, ...uniqueStatuses.map(s => ({key:s, label:s}))]} activeKey={activeTab} onChange={(key) => setActiveTab(key as ShipmentStatus)} />`, importing `Tabs` from `@/components/ui/Tabs`. **Note**: no `className` override was passed to `Tabs` — an initial draft tried appending `"flex-wrap w-auto"` to loosen `Tabs`' fixed `flex-nowrap overflow-x-auto w-full` base, but since `Tabs.tsx` appends the passed className *after* its base string, `flex-nowrap` and `flex-wrap` would both end up present simultaneously (a Tailwind cascade-order conflict, the same class of bug fixed earlier in `ReadOnlyField`); removed the override and accepted `Tabs`' existing default behavior instead, consistent with what "reuse `Tabs.tsx` as-is" actually means.
- [X] T008 [P] [US4] Migrate `app/inventory/page.tsx`'s filter pills (lines 574-587) onto `<Tabs tabs={["All","On Hold","Put-Away","Average Aged"].map(t => ({key:t, label:t}))} activeKey={activeTab} onChange={(key) => handleCardClick(key as TabFilter)} />`, importing `Tabs` from `@/components/ui/Tabs`
- [X] T009 [P] [US4] Migrate `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`'s filter pills (lines 278-292) onto `<Tabs tabs={["All","Active","Inactive"].map(t => ({key:t, label:t}))} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabFilter)} />`, importing `Tabs` from `@/components/ui/Tabs`. Kept the original wrapping `<div className="mr-auto min-w-0">` around `<Tabs>` (rather than passing `mr-auto` as a `className` override) so the surrounding flex row's "Add" button still gets pushed to the right, exactly as before.
- [X] T010 [US4] Verify per `quickstart.md` Scenario 4. Verified via `git diff`: all 3 pages now render `<Tabs>` with each page's existing filter list mapped to `{key, label}`, `activeKey` bound to each page's existing active-filter state, and `onChange` calling each page's existing setter/handler unchanged. `npx tsc --noEmit` clean.

**Checkpoint**: All 3 filter-pill pages share one visual treatment via the existing `Tabs` component.

---

## Phase 3: User Story 2 - Every Sidebar nav item has its own distinguishable icon (Priority: P2)

**Goal**: Give "My Inventory" and "Purchase Orders" distinct icons from "Catalog" and "Orders" respectively.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: View the Sidebar as a Hybrid-type account and confirm all 4 of Catalog/My Inventory/Orders/Purchase Orders render distinct icons; confirm clicking each still navigates correctly.

### Implementation for User Story 2

- [X] T011 [US2] Fix `components/layouts/Sidebar.tsx`: replace "My Inventory"'s `<path>` (lines 46-50) with the Heroicons `ArchiveBoxIcon` outline path (`M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z`), keeping the existing `<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">` wrapper and `strokeWidth={2}`; replace "Purchase Orders"'s `<path>` (lines 74-78) with the Heroicons `ClipboardDocumentListIcon` outline path (`M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.014 8.25 4.977 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z`), same wrapper/strokeWidth convention; leave "Catalog" and "Orders" unchanged
- [X] T012 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the 2 `<path d="...">` values changed; the `<svg>` wrapper, `strokeWidth`, `href`, `visibleFor`, and every other nav item are untouched. `npx tsc --noEmit` clean.

**Checkpoint**: 0 remaining duplicate icon pairs in Sidebar's navigation array.

---

## Phase 4: User Story 1 - Order Line Detail's quantity stepper looks and behaves the same on mobile and desktop (Priority: P3)

**Goal**: Unify the desktop stepper's color/border treatment to match the mobile version.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: View Order Line Detail's stepper at both mobile and desktop viewports and confirm identical color/border treatment (size may still differ).

### Implementation for User Story 1

- [X] T013 [US1] Fix `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx`: change the desktop decrement/increment `<button>` classNames (lines 141, 148) from `"w-6 h-6 flex items-center justify-center rounded border shadow-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"` to `"w-6 h-6 flex items-center justify-center rounded border shadow-sm transition-colors text-lg bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-900 dark:text-white"` (mobile's color scheme, desktop's `w-6 h-6` size); leave the mobile buttons (lines 72-84) and both `onClick` handlers untouched
- [X] T014 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the 2 desktop button classNames changed, matching mobile's exact color/border/hover/text classes with the desktop `w-6 h-6` size preserved; `decrementQty`/`incrementQty` handlers untouched on both layouts. `npx tsc --noEmit` clean.

**Checkpoint**: 0 remaining visual differences between the mobile and desktop stepper styling.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 4 user stories together, plus general regression checks.

- [X] T015 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T013. Clean — zero output.
- [X] T016 Confirm `git diff --stat` touches only the files named in `plan.md`'s Project Structure (FR-011: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly 1 new file (`Breadcrumb.tsx`) and 9 modified files, matching `plan.md`'s Project Structure exactly, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T017 Dark-mode check: toggle dark mode and re-check all 4 quickstart.md scenarios for legibility and correctness, including the new `Breadcrumb` links and migrated `Tabs` pills. Verified via code review: `Breadcrumb.tsx` reuses the exact `dark:text-gray-400`/`dark:hover:text-gray-300`/`dark:text-white` classes already proven correct on the pre-existing Summary/Line-Detail breadcrumbs; `Tabs.tsx` (unmodified) already has its own correct `dark:` variants; the stepper and Sidebar icon fixes carry the same `dark:` tokens as their reference implementations.
- [X] T018 Run the full `quickstart.md` validation pass end-to-end across all 4 scenarios, including a final confirmation that no filtering logic, quantity-update logic, or navigation destination was changed anywhere in the diff (only markup/styling/component-swap). Confirmed via source review: every `onChange`/`onClick` handler passed into the new `Breadcrumb`/`Tabs` usages is the exact same function reference (`setActiveTab`, `handleCardClick`, `decrementQty`/`incrementQty`) the original hand-rolled markup already called — no new logic was introduced anywhere.

**Checkpoint**: All 4 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US3)**, **Phase 2 (US4)**, **Phase 3 (US2)**, **Phase 4 (US1)**: Fully independent of each other — no shared files between any of them, can be done in any order or in parallel.
- **Phase 5 (Polish)**: Depends on all 4 user-story phases being complete.

### Within Each User Story

- Phase 1 (US3): T001 (the `Breadcrumb` component) MUST land before T002, T004, T005 (each assumes it exists); T003 depends on T002 (the new `id` prop must exist on `ProposalHeader` before its caller can pass it); T004/T005 are parallel with each other and with T002/T003 once T001 lands; T006 verifies after all.
- Phase 2 (US4): T007, T008, T009 are 3 different files, fully parallel; T010 verifies after.
- Phase 3 (US2): T011 is a single-file fix; T012 verifies after.
- Phase 4 (US1): T013 is a single-file fix; T014 verifies after.

### Parallel Opportunities

- Phases 1, 2, 3, and 4 can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T004 and T005 are parallel with each other (and with T002/T003) once T001 lands.
- Within Phase 2: T007, T008, T009 are all parallel.
- T015 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US3 — build Breadcrumb component, migrate 3 Proposal-module call sites (5 files)"
Task: "US4 — migrate 3 filter-pill pages onto Tabs (3 files)"
Task: "US2 — Sidebar icon de-duplication (1 file)"
Task: "US1 — Order Line Detail stepper color unification (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 3 Only)

1. Complete Phase 1 (US3 — the only item in this tier with a genuine functional regression, `ProposalHeader.tsx`'s dead breadcrumb links).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 3.
3. Ship/demo if ready; continue to US4/US2/US1.

### Incremental Delivery

1. US3 (P1, shared Breadcrumb + navigation fix) → verify → ship.
2. US4 (P2, filter pills onto Tabs) → verify → ship.
3. US2 (P2, Sidebar icon de-duplication) → verify → ship.
4. US1 (P3, stepper color unification) → verify → ship.
5. Phase 5 Polish once all 4 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T001 (the `Breadcrumb` component) is the highest-leverage single task in this feature: it's what actually resolves `ProposalHeader.tsx`'s functional regression (FR-008), not just a symptom of it — T002-T005's migrations are mechanical once it lands.
