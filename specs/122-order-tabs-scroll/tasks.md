---

description: "Task list for Scrollable Tab Header Rows on Order Details Page"

---

# Tasks: Scrollable Tab Header Rows on Order Details Page

**Input**: Design documents from `/specs/122-order-tabs-scroll/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature spec — no existing automated test suite covers responsive tab-row layout (Constitution Principle V). Verification is manual, via `quickstart.md`.

**Organization**: This feature has a single Priority P1 user story touching one call site; there is no Foundational phase distinct from the story itself.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Next.js App Router (this project): `app/orders/[id]/` (page-level client component). No new files, directories, or migrations for this feature.

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches the plan's assumptions before editing.

- [X] T001 Re-read `app/orders/[id]/OrderClientPage.tsx` lines 1766–1812 (the search box, optional refresh button, and `<Tabs>` call site) and `app/globals.css` lines 98–109 (`.no-scrollbar`) to confirm both still match `research.md`'s baseline before editing.

**Checkpoint**: Baseline confirmed — proceed to User Story 1.

---

## Phase 2: User Story 1 - Every tab is reachable on the order details page, even on narrower screens (Priority: P1) 🎯 MVP

**Goal**: The order details page's top-level tab row (Add Products/My Order/Taxes/Fulfillment/Returns/Files) scrolls horizontally with a visible scroll affordance when it doesn't fit alongside the search box, instead of clipping the last tab out of view — with no change to the row's appearance when everything already fits, and no change to the search box or the already-correct Fulfillment sub-tab row.

**Independent Test**: Open an order's details page at a viewport width around 1100–1250px (where the search box and tab row share a row but don't jointly fit), confirm "Files" is reachable by scrolling and clickable once reached; then widen the browser and confirm the row looks unchanged from before this fix.

### Implementation for User Story 1

- [X] T002 [US1] In `app/orders/[id]/OrderClientPage.tsx`, change the `<Tabs>` call site's `className` (currently `"no-scrollbar pb-0.5 flex-shrink-0 lg:w-auto"`, around line 1810) to `"pb-0.5 min-w-0 lg:w-auto"` — dropping `no-scrollbar` and `flex-shrink-0`, adding `min-w-0`.
- [X] T003 [US1] Manually run `quickstart.md` Steps 1–4: reproduce the clipping at ~1100–1250px width before confirming the fix, verify scrolling reveals and allows clicking "Files", verify no change at a wide viewport, and verify the search box/refresh button are unaffected.

**Checkpoint**: The top-level tab row is fully reachable at every viewport width — independently testable and demoable.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that nothing else regressed.

- [X] T004 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors.
- [X] T005 Manually run `quickstart.md` Steps 5–6: confirm the Fulfillment sub-tab row still scrolls correctly with no visible change, and confirm the below-`lg`-breakpoint stacked mobile/tablet layout is unaffected.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends on Setup. This is the only story — no cross-story dependencies to manage.
- **Polish (Phase 3)**: Depends on User Story 1's edit (T002) being in place.

### Within User Story 1

- T002 before T003 (edit before manual validation).

### Parallel Opportunities

- None meaningful at this scale — a single className edit (T002) has nothing to parallelize against within the story. T004 can run any time after T002 lands.

---

## Implementation Strategy

### MVP First (and only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: User Story 1 — the entire feature.
3. **STOP and VALIDATE**: run `quickstart.md` in full.
4. Complete Phase 3: Polish.

There is no meaningful incremental-delivery breakdown smaller than this — the feature is a single Tailwind className edit at one call site.

## Notes

- Like `specs/121-sortable-header-icon-gap`, this is a minimal-scale fix (1 file, 1 className value) — the multi-phase structure is kept only for consistency with how every other feature in `specs/` is documented.
