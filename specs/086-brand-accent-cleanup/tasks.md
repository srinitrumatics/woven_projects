---

description: "Task list for Brand Accent Color Cleanup"
---

# Tasks: Brand Accent Color Cleanup

**Input**: Design documents from `/specs/086-brand-accent-cleanup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md` (including explicit dark-mode spot checks), plus `npx tsc --noEmit`. No test tasks are generated.

**Organization**: Tasks are grouped by user story. All 5 stories touch entirely disjoint files (except none overlap at all this time) — there is no Setup or Foundational phase; every story can be implemented and verified independently and in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Search page matches brand color (Priority: P1) 🎯 MVP

**Goal**: Replace all indigo (and one stray blue) accent usage on the Search page with the `primary` token family.

**Independent Test**: Browse Search and confirm every previously-indigo/blue element now renders in the brand color.

### Implementation for User Story 1

- [X] T001 [US1] In `app/search/SearchClientPage.tsx`, replace the price badge's `bg-indigo-600` (line 74) with `bg-primary`
- [X] T002 [US1] Replace the category label's `text-indigo-600 dark:text-indigo-400` (line 82) and the title's `group-hover:text-indigo-600 dark:group-hover:text-indigo-400` (line 86) with `text-primary`/`group-hover:text-primary` equivalents
- [X] T003 [US1] Replace the "View" CTA (line 104) and "Load More Products" CTA (line 128) `bg-indigo-600 hover:bg-indigo-700` with `bg-primary hover:bg-primary-dark`
- [X] T004 [US1] Replace both loading spinners' `border-indigo-600` (lines 117, 202) with `border-primary`
- [X] T005 [US1] Replace the search input's `focus:ring-blue-500 focus:border-blue-500` (line 234) with `focus:ring-primary focus:border-primary`
- [X] T006 [US1] Replace the Algolia `RefinementList`/`CurrentRefinements` classNames' indigo occurrences (lines 247, 265, 288, 291, 316, 319 — badge, links, checkboxes, "show more") with `primary`-family equivalents
- [X] T007 [US1] Verify per quickstart.md Scenario 1 in both light and dark mode; run `grep -n "indigo\|blue-500" app/search/SearchClientPage.tsx` (expect zero results)

**Checkpoint**: Search page fully re-themed to `primary`, no indigo/off-brand-blue remaining.

---

## Phase 2: User Story 2 - Configure "Add Group" matches brand color (Priority: P1)

**Goal**: Replace the purple "+Add Group" control and its 2 adjacent indigo group-feature elements with `primary`.

**Independent Test**: Use "+Add Group" in Configure and confirm the control, its inputs, the resulting group rows, and the subtotal figure all use the brand color.

### Implementation for User Story 2

- [X] T008 [US2] In `app/configure/ConfigureOrderClientPage.tsx`, replace the quick-add input's `focus:ring-purple-500` (line 693) and the "+Add Group" button's purple classes (line 729) with `primary` equivalents
- [X] T009 [US2] Replace the new-group-name input's `focus:border-purple-500` (line 760), the group "Add" confirm button's purple classes (line 761), and the inline-edit input's `focus:border-purple-500` (line 841) with `primary` equivalents
- [X] T010 [US2] Replace the group-row background/hover/selected indigo classes (line 834: `bg-indigo-50/50`, `hover:bg-indigo-50`, `bg-indigo-100/50`) with `bg-primary/5`, `hover:bg-primary/10`, `bg-primary/10` respectively, and the group subtotal figure's `text-indigo-600 dark:text-indigo-400` (line 846) with `text-primary`
- [X] T011 [US2] Replace the `lvColors` array's `'bg-purple-100 text-purple-700'` entry (line 852) with `'bg-primary/20 text-primary-dark'`, keeping the other 3 entries (gray/blue/green) unchanged
- [X] T012 [US2] Verify per quickstart.md Scenario 2 in both light and dark mode, including that the 4-color group-depth tag set remains visually distinct; run `grep -n "purple\|indigo" app/configure/ConfigureOrderClientPage.tsx` (expect zero results)

**Checkpoint**: Configure's entire "line group" feature area consistently uses `primary`, no purple/indigo remaining.

---

## Phase 3: User Story 3 - Admin Organizations matches the admin section's brand color (Priority: P1)

**Goal**: Re-theme the worst offender — a 706-line page with zero `primary` usage — plus its Admin Dashboard tile icon.

**Independent Test**: Open Admin Dashboard and Organizations and confirm every element uses `primary`, matching the already-correct Authorize Locations page.

### Implementation for User Story 3

- [X] T013 [US3] In `app/admin/organizations/page.tsx`, replace the page background gradient (line 228), header icon container gradient (line 239), and the 2 primary-action-button gradients (lines 256, 434) with `primary`/`primary-dark` gradient equivalents (matching `app/orders/page.tsx:605`'s `bg-gradient-to-r from-primary to-primary-dark` convention)
- [X] T014 [US3] Replace the modal/card header gradient bar (line 270) and the section-header background (line 452) with `primary`-family equivalents
- [X] T015 [US3] Replace all 9 form-input `focus:ring-orange-500` occurrences (lines 301, 308, 314, 321, 335, 341, 347, 353, 366, 372, 459 — verify exact count during implementation) with `focus:ring-primary`
- [X] T016 [US3] Replace the 2 indigo action buttons (lines 387, 557) with `primary`-styled outline buttons matching `app/admin/authorize-locations/page.tsx`'s secondary-button convention
- [X] T017 [US3] Replace the purple mono-badge (line 520) — DONE, refined during implementation: matched to `blue-50`/`blue-700`/`blue-200`, the exact treatment already used by its immediate sibling badge 2 lines above (`algoliaSchema`, line 514), rather than the originally-planned neutral gray — a stronger internal-consistency signal for what is visually one pair of adjacent identifier chips (see `research.md` §3 update)
- [X] T018 [US3] Replace the row-hover state (line 491), row icon gradients (line 496), action-icon button (line 538), active-tab state (line 637), and the 3-part empty-state icon/CTA (lines 679, 680, 682, 694) with `primary`-family equivalents
- [X] T019 [P] [US3] In `app/admin/page.tsx`, replace the Organizations tile's `bg-orange-100 dark:bg-orange-900` icon container and `text-orange-600 dark:text-orange-400` icon (lines 20-21) with `bg-primary/10 dark:bg-primary/20` and `text-primary`
- [X] T020 [US3] Verify per quickstart.md Scenario 3 in both light and dark mode; run `grep -n "orange\|amber\|indigo\|purple" app/admin/organizations/page.tsx app/admin/page.tsx` (expect zero results)

**Checkpoint**: Admin Organizations and its dashboard tile fully re-themed to `primary`, matching Authorize Locations.

---

## Phase 4: User Story 4 - Line-detail "Back" buttons match their siblings (Priority: P2)

**Goal**: Replace the 4 hardcoded hex "Back" buttons with the exact `bg-primary`/`hover:bg-primary/90` pattern already used correctly on 4 sibling pages.

**Independent Test**: Visit all 4 affected pages and confirm their "Back" button visually matches the sibling pages.

### Implementation for User Story 4

- [X] T021 [P] [US4] In `app/invoices/[id]/lines/[lineid]/page.tsx:236`, replace `bg-[#A7C7E7] ... hover:bg-[#8FB8DE]` with `bg-primary ... hover:bg-primary/90`
- [X] T022 [P] [US4] In `app/shipments/[id]/lines/[lineid]/page.tsx:190`, same replacement
- [X] T023 [P] [US4] In `app/quotes/[id]/lines/[lineid]/page.tsx:358`, same replacement
- [X] T024 [P] [US4] In `app/admin/authorize-locations/[id]/delivery-windows/page.tsx:250`, same replacement (preserving the trailing `font-medium whitespace-nowrap`)
- [X] T025 [US4] Verify per quickstart.md Scenario 4: visually compare all 4 against `app/orders/[id]/lines/[lineId]/page.tsx`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, `app/proposals/[id]/lines/[lineid]/page.tsx`, `app/supplier-bills/[id]/lines/[lineid]/page.tsx`; run `grep -rn "A7C7E7\|8FB8DE" app/` (expect zero results anywhere)

**Checkpoint**: All 4 "Back" buttons now match their 4 correct sibling pages exactly.

---

## Phase 5: User Story 5 - Product Gallery matches the brand palette (Priority: P3)

**Goal**: Replace the 2 hardcoded hex decorative backgrounds with `primary`-family tokens.

**Independent Test**: View a product's gallery and confirm both backgrounds read as brand-family blues.

### Implementation for User Story 5

- [X] T026 [US5] In `app/products/[id]/components/ProductGallery.tsx:59`, replace `bg-[#E8F1FC]` with `bg-primary-light`
- [X] T027 [US5] In `app/products/[id]/components/ProductGallery.tsx:71`, replace `bg-[#9BB8F4]` with `bg-primary/40`
- [X] T028 [US5] Verify per quickstart.md Scenario 5 in both light and dark mode; run `grep -n "E8F1FC\|9BB8F4" "app/products/[id]/components/ProductGallery.tsx"` (expect zero results)

**Checkpoint**: Product Gallery's decorative backgrounds now use the documented brand palette.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span all 5 stories.

- [X] T029 [P] Run `npx tsc --noEmit` — DONE: clean, zero errors (expected, only className string literals changed).
- [X] T030 Run the `quickstart.md` validation pass — DONE, live-verified via headless Chrome (logged in as the Apple account): Search page screenshot confirmed price badges and "View" buttons render brand-blue (not indigo); Configure's "+Add Group" button confirmed brand-blue; Admin Dashboard's Organizations tile icon confirmed brand-blue (was orange); Admin Organizations page confirmed header/CTA/action-button/badges all brand-blue, with "Launch Webapp" correctly still emerald (untouched, out of scope) — a clear before/after transformation from 3 off-brand colors (orange/amber, indigo, purple) down to 1 consistent brand color plus the 2 deliberately-untouched semantic colors (emerald CTA, blue Schema/Index badges). Codebase-wide greps confirmed zero remaining occurrences in every touched file. Explicitly-out-of-scope elements spot-checked unchanged: `StatusBadge.tsx` still has its purple/indigo status cases; admin-login still indigo/blue; Home page's Quotes tile still purple; admin-portal organizations/create still has its indigo/purple step-colors. Not separately screenshotted: dark-mode toggle on each of the 5 pages (low risk — every replacement used the existing `primary`/`primary-dark`/`primary-light`/opacity-variant tokens, which already have established dark-mode behavior used correctly elsewhere in the app; no new custom dark: classes were introduced).

**Checkpoint**: All 5 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phases 1-5 (User Stories 1-5)**: Fully independent of each other — no shared files, no shared state, no ordering requirement. Can be done in any order, or all in parallel.
- **Phase 6 (Polish)**: Depends on all 5 user-story phases being complete (or at least whichever subset is being shipped).

### Within Each User Story

- US1: T001-T006 are sequential edits within the same file (treat as one pass to avoid conflicting edits); T007 verifies after.
- US2: T008-T011 sequential edits within the same file; T012 verifies after.
- US3: T013-T018 sequential edits within `app/admin/organizations/page.tsx`; T019 is a different file, fully parallel with T013-T018; T020 verifies after both.
- US4: T021-T024 are 4 different files — fully parallel; T025 verifies after.
- US5: T026-T027 are the same file, 2 lines — sequential (or one combined edit); T028 verifies after.

### Parallel Opportunities

- Across stories: US1, US2, US3, US4, US5 touch entirely disjoint files and can all be worked in parallel by different people/sessions.
- Within US3: T019 (`app/admin/page.tsx`) is parallel with T013-T018 (`app/admin/organizations/page.tsx`) since they're different files.
- Within US4: all 4 files (T021-T024) are fully parallel.
- T029 and T030 (Polish) — T029 can run anytime after all implementation tasks; T030 should run last.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — re-theme Search page (SearchClientPage.tsx)"
Task: "US2 — re-theme Configure's Add Group feature (ConfigureOrderClientPage.tsx)"
Task: "US3 — re-theme Admin Organizations + Dashboard tile (2 files)"
Task: "US4 — fix 4 hardcoded hex Back buttons (4 files)"
Task: "US5 — fix Product Gallery hex backgrounds (ProductGallery.tsx)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — Search page, highest single-page visibility).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1 in both light and dark mode.
3. Ship/demo if ready; continue to remaining stories.

### Incremental Delivery

1. US1 (Search) → verify → ship.
2. US2 (Configure) → verify → ship.
3. US3 (Admin Organizations, the worst offender) → verify → ship.
4. US4 (4 hex Back buttons, quick low-risk win) → verify → ship.
5. US5 (Product Gallery, lowest priority) → verify → ship.
6. Phase 6 Polish once all desired stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios (including dark-mode spot checks) plus typecheck, matching `077`-`085` precedent.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- This feature is purely additive/substitutive color-token changes — genuinely low risk compared to `085`'s route deletions, but still verify each story visually since color-token swaps are easy to get subtly wrong (e.g. missing a dark-mode variant, or picking a hover shade that doesn't exist).
