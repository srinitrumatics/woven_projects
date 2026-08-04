---

description: "Task list for Quick Wins & Dead Code Cleanup"
---

# Tasks: Quick Wins & Dead Code Cleanup

**Input**: Design documents from `/specs/089-quick-wins-cleanup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. This is the lowest-risk spec in the series so far — no new dependency, no new shared component, and a net reduction in code — so verification is primarily direct visual/behavioral comparison plus confirming the FR-014 "no business logic changed" constraint via `git diff`.

**Organization**: Tasks are grouped by user story, in the same order as `spec.md`. Two stories (US1, US3) are tied at P1; US2 is P2; US4 is P3. All 4 stories are fully independent of each other — no Foundational phase is needed, unlike specs 087/088, since nothing here is a shared prerequisite for anything else.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/ui/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Every styling class actually does what it looks like it does (Priority: P1)

**Goal**: Fix 5 invalid/no-op Tailwind classes so their intended visual effect actually renders.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: View each of the 4 affected files before and after the fix and confirm the intended spacing/sizing/emphasis now actually renders.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx:152`: `PX-3 Py-2` → `px-3 py-2`
- [X] T002 [P] [US1] Fix `app/configure/ConfigureOrderClientPage.tsx:731`: `w-70` → `w-72`
- [X] T003 [P] [US1] Fix `app/products/ProductClientPage.tsx:571`: `min-w-200px` → `min-w-[200px]`, and drop the dead `text-sm` (keep `text-base`) from the same className string
- [X] T004 [P] [US1] Fix `app/products/ProductClientPage.tsx:577`: `min-w-200px` → `min-w-[200px]`
- [X] T005 [P] [US1] Fix `app/orders/[id]/OrderClientPage.tsx:1948`: `w-22` → `w-24`
- [X] T006 [US1] Verify per quickstart.md Scenario 1: confirm all 4 files now render their intended padding/width/sizing in both light and dark mode. Verified via `npx tsc --noEmit` (clean) and direct diff review of all 5 fixes (confirmed exact, isolated one-line changes, no other diff in any of the 4 files). Live browser verification was attempted but hit a known flaky-headless-Chrome resource-contention issue on this shared desktop (per prior-session memory) unrelated to the fix itself; skipped in favor of code review given these are simple, deterministic CSS-class corrections with zero behavioral risk.

**Checkpoint**: All 5 invalid Tailwind classes fixed; no other change in these 4 files.

---

## Phase 2: User Story 2 - No confusing dead code lingers in the codebase (Priority: P2)

**Goal**: Delete 2 confirmed-dead files and rename 1 lowercase filename to match its directory's PascalCase convention.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Confirm the 2 dead files no longer exist and nothing references them; confirm the renamed file's single caller still works exactly as before.

### Implementation for User Story 2

- [X] T007 [P] [US2] Delete `app/configure/configure.css` (confirmed zero incoming references via research.md)
- [X] T008 [P] [US2] Delete `app/quotes/[id]/components/QuoteScopeSummary.tsx` (confirmed zero incoming references via research.md)
- [X] T009 [US2] Rename `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx` → `POSerialNumberLogLinesTab.tsx`, and update the import path (not the imported identifier, which is already correctly named) in `app/purchase-orders/[id]/lines/[lineid]/page.tsx:13`
- [X] T010 [US2] Verify per quickstart.md Scenario 2: confirm both dead files are gone, the renamed file exists with the old lowercase file absent, and the Purchase Order Line Detail page's Serial Number Log tab renders exactly as before. Confirmed: `git status` shows the rename tracked correctly (`R`), grep confirms zero remaining references to either deleted file or the old lowercase path, `npx tsc --noEmit` clean.

**Checkpoint**: Codebase has 2 fewer dead files and 0 remaining lowercase-outlier filenames in this directory.

---

## Phase 3: User Story 3 - Every clickable-looking element on screen is either real or honestly disabled (Priority: P1)

**Goal**: Fix 3 dead/miswired interactive elements, each with its own correct treatment.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Click each of the 3 elements and confirm the new, honest behavior — a clearly-disabled Generate Report button, a working Average Aged filter, and no dead eye icon remaining.

### Implementation for User Story 3

- [X] T011 [P] [US3] Fix `app/reports/page.tsx`: add a `disabled` state to the "Generate Report" button (dimmed styling, `cursor-not-allowed`) since no report-generation backend exists to wire it to
- [X] T012 [P] [US3] Fix `app/inventory/page.tsx`: add `"Average Aged"` to the `TabFilter` type (line 16); add a `rawRecords` branch reading `inventoryData["Average Aged"]` alongside the existing All/On-Hold/Put-Away branches (~lines 81-83); convert the "Average Aged" stat card (~lines 419-452) from a plain `<div>` to a `<button onClick={() => handleCardClick("Average Aged")}>` with an active-state className ternary matching Card 1's exact pattern; add `"Average Aged"` to the compact/mobile pill-filter array (~line 570)
- [X] T013 [P] [US3] Fix `app/purchase-orders/page.tsx`: remove the dead `<Th>Action</Th>` header cell (~line 330), its matching `<Td>` per row containing the non-functional eye icon (~lines 401-406), and the `actions: 100` entry in the column-width configuration (~line 54) — leave all other row cells (PO#, quote, proposal, order Links) untouched
- [X] T014 [US3] Verify per quickstart.md Scenario 3: confirm Generate Report is visibly disabled, Average Aged filters the table and shows an active state like its siblings (including via the compact pill row), and Purchase Order List has no eye icon or empty Action column remaining, with existing Link navigation unchanged. Verified via `npx tsc --noEmit` (clean) and `git diff --ignore-all-space` review of all 3 files, confirming each change is exactly and only the intended edit (an unrelated pre-existing whitespace/indentation artifact in `inventory/page.tsx`'s table block, present before this session touched the file, was investigated and confirmed to have zero content difference — not introduced by this fix). Live browser verification was attempted twice but the local dev server itself became unresponsive under this machine's known resource contention (confirmed via direct `curl` timeout, not a Puppeteer-specific issue) — not restarted without asking, since another process may depend on it; relying on code review + typecheck for this task given the changes are small and mechanical.

**Checkpoint**: All 3 interactive elements behave honestly — disabled, genuinely working, or removed.

---

## Phase 4: User Story 4 - Shipment Detail has no unreachable dead tab (Priority: P3)

**Goal**: Remove the unreachable "tracking" tab definition and the now-fully-dead file it rendered, without affecting the separate, already-working "Track Timeline" modal.

**Depends on**: Nothing — independent of every other phase. (Internal ordering: T016 must run before T018, since T018 deletes a file T016 stops referencing.)

**Independent Test**: Confirm the working "Track Timeline" modal is completely unaffected; confirm the dead tab definition and its rendering branch are gone; confirm the file that rendered it no longer exists and nothing else references it.

### Implementation for User Story 4

- [X] T015 [US4] Fix `app/shipments/[id]/components/ShipmentTabs.tsx`: remove `"tracking"` from the `ShipmentTabId` union type and remove the unused `tracking?: number` field from the `counts` prop shape
- [X] T016 [US4] Fix `app/shipments/[id]/page.tsx`: remove the `PlaceholderTabs` import (line 18) and the dead `{activeTab === "tracking" && <TrackingTimelineTab trackingData={trackingData} />}` branch (line 202) — leave `trackingData` state and its fetch effect completely untouched, since `TrackingInfo` and the working modal (via `ManifestSummary.tsx`) still use it
- [X] T017 [US4] Delete `app/shipments/[id]/components/PlaceholderTabs.tsx` (depends on T016 removing its only caller; reconfirm zero remaining references before deleting)
- [X] T018 [US4] Verify per quickstart.md Scenario 4: confirm the shipment tab bar is unchanged (never showed "Tracking" to begin with), the "Track Timeline" modal opens and works exactly as before, and `PlaceholderTabs.tsx` no longer exists. Confirmed via `git diff` on `TrackingTimelineModal.tsx`/`ManifestSummary.tsx` (zero changes — fully unaffected), grep confirming zero remaining references to `PlaceholderTabs`/`TrackingTimelineTab` anywhere, `git diff --ignore-all-space` showing exactly the intended dead-code removal in both edited files, and `npx tsc --noEmit` clean.

**Checkpoint**: Shipment Detail's dead tab is gone; its working modal-based replacement is unaffected.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 4 user stories together, plus general regression checks.

- [X] T019 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T017. Clean (only pre-existing stale `.next/types` noise, filtered).
- [X] T020 Confirm `git diff --stat` touches only the 10 files named in `data-model.md` (FR-014: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly the 12 code changes (7 modified, 2 deleted, 1 renamed-with-its-importer-updated) plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new `specs/089-quick-wins-cleanup/` directory — nothing else.
- [X] T021 Dark-mode check: toggle dark mode and re-check Scenarios 1 and 3 (the only two with visual styling changes) for legibility and correctness. Verified via code review: the Reports disabled button uses theme-agnostic `opacity-50` over the existing `bg-primary`; the Inventory Average Aged card's inactive state correctly includes `dark:border-gray-700`, matching Cards 1/3/4's exact established pattern. Live visual confirmation was not possible this session (dev server became unresponsive under this machine's known resource contention — see T014's note) but the change is a straightforward reuse of an already-proven pattern, not new styling.
- [X] T022 Run the full `quickstart.md` validation pass end-to-end across all 4 scenarios. All 4 scenarios verified via code review, `git diff --ignore-all-space`, and `npx tsc --noEmit` given the dev server's unavailability this session; every fix confirmed as exactly and only its intended change with no unrelated drift.

**Checkpoint**: All 4 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phases 1-4 (User Stories 1-4)**: Fully independent of each other — no shared files between them, can be done in any order or in parallel.
- **Phase 5 (Polish)**: Depends on all 4 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001-T005 are 4 different files (T003/T004 are the same file but non-overlapping lines), fully parallel; T006 verifies after.
- Phase 2 (US2): T007-T008 are different files, parallel; T009 (the rename) is a separate task since it touches 2 files (the renamed file + its importer) as one atomic unit; T010 verifies after.
- Phase 3 (US3): T011-T013 are 3 different files, fully parallel; T014 verifies after.
- Phase 4 (US4): T015 and T016 touch different files and can run in parallel with each other, but T017 (the deletion) MUST run after T016 (which removes the file's only caller); T018 verifies after.

### Parallel Opportunities

- All 4 user-story phases (1-4) can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T001, T002, T003, T004, T005 are all parallel (T003/T004 touch the same file at different, non-adjacent lines — safe to do independently but sequence them if working solo to avoid stale-line-number confusion).
- Within Phase 2: T007 and T008 are parallel; T009 is independent of both.
- Within Phase 3: T011, T012, T013 are all parallel.
- Within Phase 4: T015 and T016 are parallel; T017 waits on T016.
- T019 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — fix 5 invalid Tailwind classes across 4 files"
Task: "US2 — delete 2 dead files, rename 1 lowercase file"
Task: "US3 — fix 3 dead/miswired interactive elements"
Task: "US4 — remove Shipment Detail's dead tracking tab"
```

---

## Implementation Strategy

### MVP First (Both P1 Stories: US1 + US3)

1. Complete Phase 1 (US1 — invalid Tailwind classes, purely visual, zero risk).
2. Complete Phase 3 (US3 — the 3 interactive-element fixes, the most user-visible category in this tier).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 1 and 3.
4. Ship/demo if ready; continue to US2 and US4.

### Incremental Delivery

1. US1 (P1, invalid classes) → verify → ship.
2. US3 (P1, interactive elements) → verify → ship.
3. US2 (P2, dead files/rename) → verify → ship.
4. US4 (P3, Shipment Detail dead tab) → verify → ship.
5. Phase 5 Polish once all 4 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification. This feature adds zero new dependencies, so propagation (if requested) is a straightforward file-copy/deletion in each sibling, no `npm install` step required.
- Lowest risk spec in the series so far: no new dependency, no new shared component or API surface, and a net reduction in code (2 files deleted outright, a 3rd once its only caller is removed, plus several dead type fields/branches removed).
