---

description: "Task list for Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens"
---

# Tasks: Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens

**Input**: Design documents from `/specs/117-subtab-header-scrollbar/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated visual-regression suite exists in this repo for `components/ui/*` (see `plan.md` Technical Context). Verification is manual, driven by `quickstart.md` scenarios, included as tasks below instead of automated test tasks.

**Organization**: The spec defines a single user story (US1, P1). All tasks belong to it; there is no US2/US3 phase for this feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Include exact file paths and current/target className strings in descriptions (from `research.md`)

## Path Conventions

- **Next.js App Router (this project)**: `components/ui/` (shared UI components). The fix is a single Tailwind className edit on the shared `SubTabs` component; no page files under `app/` need edits since all 17+ consumers import the shared component (see `plan.md` Project Structure).

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready to implement and manually verify the change.

- [X] T001 Start the dev server (`npm run dev`), log in, and navigate to a Proposal detail page's Fulfillment tab so the "Proposals (5) | Customer Quotes (2) | Sales Orders (3) | Shipping Manifests | Invoices (3)" sub-tab row (`app/proposals/[id]/components/FulfillmentsTab.tsx`, rendered via `components/ui/SubTabs.tsx`) is visible — this is the exact row from the reported screenshot

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for user story work.

Not applicable to this feature — there is only one shared component to change (`components/ui/SubTabs.tsx`), no schema/data/API changes, and no infrastructure shared across stories since there is only one story. Proceed directly to Phase 3.

**Checkpoint**: N/A — skip directly to Phase 3.

---

## Phase 3: User Story 1 - Clean sub-tab row on narrow screens (Priority: P1) 🎯 MVP

**Goal**: Eliminate the stray vertical scrollbar / two-line appearance in the shared sub-tab header row on narrow screens, while preserving horizontal scrolling, across every page that uses the shared component.

**Independent Test**: Resize the browser (or use a small viewport) on any detail page with a sub-tab row that has more tabs than fit the width, and confirm only a single-line row with horizontal scroll appears — no extra scrollbar or second line.

### Implementation for User Story 1

- [X] T002 [US1] In `components/ui/SubTabs.tsx` line 14, change the row container className from `` `flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3  ${className ?? ""}` `` to `` `flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto overflow-y-hidden mb-3 ${className ?? ""}` `` — this pins `overflow-y` explicitly so it can no longer be computed as implicit `auto` per the root cause in `research.md`, while leaving `overflow-x-auto` (and all button classNames) untouched

### Verification for User Story 1

- [X] T003 [US1] Manually verify `quickstart.md` Scenario 1 (reported page) on the page opened in T001: narrow the viewport past the point where tabs overflow, in both light and dark mode, and confirm the row stays single-line with no vertical scrollbar (depends on T002) — verified via headless Chrome on proposal PRP-26-08-000351 at 480px width: computed `overflow-y` was `auto` before the fix (confirmed by temporarily reverting) and `hidden` after; screenshot confirms single-line row in both light and dark mode with no vertical scrollbar
- [X] T004 [P] [US1] Manually verify `quickstart.md` Scenario 2 (cross-page coverage, FR-005) on at least 3-4 other `SubTabs` consumers — e.g. `app/orders/[id]/components/FulfillmentTab.tsx`, `app/quotes/[id]/components/QuoteReturnsTab.tsx`, `app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx`, `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` — confirming the same single-line, horizontally-scrollable behavior with no vertical scrollbar artifact (depends on T002) — verified live on a Purchase Order's Returns tab (`computed overflow-y: hidden`); orders/quotes list had no records for the available test account, so those two were confirmed statically instead — none of the 17+ consumers pass a custom `className` to `SubTabs` (`grep "<SubTabs" -A2 app/**/*.tsx` shows no className overrides), so the fix applies identically everywhere by construction
- [X] T005 [US1] Manually verify `quickstart.md` Scenario 3 (no-overflow edge case): find or simulate a sub-tab row with few enough tabs to always fit, even at the narrowest tested width, and confirm no scroll affordance of any kind appears (depends on T002) — verified at 1400px viewport width: `scrollWidth` (1046) equals `clientWidth` (1046), i.e. `hasHScroll: false`, with `overflow-y: hidden` — no scrollbar of any kind renders
- [X] T006 [US1] Manually verify `quickstart.md` Scenario 4 (row height stability): resize the viewport across the point where the row transitions from "all tabs fit" to "tabs overflow and scroll," and confirm the row's height does not visibly change at that transition (depends on T002) — verified: `clientHeight` was 29px at both 1400px (no overflow) and 480px (overflowing) viewport widths — identical, no height jump

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — every page using `components/ui/SubTabs.tsx` now shows a clean, single-line, horizontally-scrollable sub-tab row on narrow screens with no stray vertical scrollbar.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final sanity checks that span the whole change.

- [X] T007 [P] Run `npx tsc --noEmit` as a static sanity check (no type changes are expected from a className-only edit, but this confirms nothing else was disturbed) — passed clean, no errors
- [X] T008 Run the full `quickstart.md` validation guide end-to-end and confirm zero instances of a vertical scrollbar or two-line appearance across all checked pages, satisfying spec success criteria SC-001–SC-003 (depends on T002, T003, T004, T005, T006) — all four quickstart scenarios pass on the checked pages (Proposal Fulfillment tab, Purchase Order Returns tab); zero vertical-scrollbar/two-line instances observed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for this feature - skipped
- **User Story 1 (Phase 3)**: Depends on Setup (T001) completion
- **Polish (Phase 4)**: Depends on User Story 1 (Phase 3) completion

### Within User Story 1

- T002 (implementation) must complete before T003-T006 (verification)
- T003, T005, T006 touch the same page/interaction sequence and are best run in order; T004 covers different pages and can run in parallel with T003, T005, or T006

### Parallel Opportunities

- T004 is marked [P] — it verifies different consumer pages/files than T003, T005, T006 and has no ordering dependency on them (only on T002)
- T007 is marked [P] — it's an independent static check that doesn't touch the pages being manually verified in T003-T006

---

## Parallel Example: User Story 1

```bash
# After T002 (the SubTabs.tsx fix) lands, run these verification tasks together:
Task: "Verify quickstart Scenario 1 (reported page) in light/dark mode"
Task: "Verify quickstart Scenario 2 (cross-page coverage) on other SubTabs consumers"
```

---

## Implementation Strategy

### MVP First (and Only) Scope

1. Complete Phase 1: Setup
2. Skip Phase 2: Foundational (N/A)
3. Complete Phase 3: User Story 1 — this **is** the entire feature (single P1 story)
4. Complete Phase 4: Polish — final `tsc` check and full quickstart run
5. Done — no further stories to add

---

## Notes

- [P] tasks = different files/pages, no dependencies between them
- This feature has exactly one user story, so there is no incremental multi-story rollout — implementing T002 and passing verification (T003-T006) delivers the complete fix
- Commit after T002 lands and verification passes
- Avoid: touching `components/ui/Tabs.tsx` (the separate primary tab bar) — it has a similar latent CSS pattern per `research.md` but was not reported or observed as broken, and is explicitly out of scope
