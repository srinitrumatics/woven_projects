---

description: "Task list for Mock Data & Dead Code Cleanup"
---

# Tasks: Mock Data & Dead Code Cleanup

**Input**: Design documents from `/specs/091-mock-data-dead-code-cleanup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-013: no business-logic, data-fetching-source, or Salesforce read/write changes anywhere beyond the specific endpoint correction in FR-008.

**Organization**: Tasks are grouped by user story, in the same order as `spec.md`. US1 is P1; US2 and US3 are both P2; US4 is P3. All 4 stories are fully independent — zero shared files across any of them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), `app/api/` (API routes), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Shipment tracking timeline shows real data or an honest empty state (Priority: P1) 🎯 MVP

**Goal**: Stop `TrackingTimelineModal` from ever fabricating tracking events, and make the "Track Timeline" button fetch-and-guard exactly like its "Track Shipment" sibling.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open a Shipment Detail page for a shipment with no real tracking events, click "Track Timeline" directly (without clicking "Track Shipment" first), and confirm the modal shows a genuine "No tracking events found." state — never the old mock "Delivered ... Oakland, CA \" Oakland, CA 94612" entry.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/shipments/[id]/components/TrackingTimelineModal.tsx`: delete `mockTimelineData` (lines 20-29) and its corrupted `'Oakland, CA " Oakland, CA 94612'` string; change the `if/else` at lines 34-44 so the `else` branch sets `displayData = []` instead of `displayData = mockTimelineData`, letting the existing "No tracking events found." branch (lines 106-109) render honestly
- [X] T002 [P] [US1] Fix `app/shipments/[id]/components/ManifestSummary.tsx`: change the "Track Timeline" button (lines 98-103) `onClick` from `() => setIsTimelineOpen(true)` to `handleTrackClick` (the same handler "Track Shipment" already uses, lines 88-89), and add `disabled={isLoadingTracking || !hasTracking}` plus the same conditional loading-spinner markup (lines 90-96) so both buttons guard identically
- [X] T003 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: `mockTimelineData` and the corrupted string are fully removed, the `else` branch now sets `displayData = []`, and the modal's pre-existing "No tracking events found." render branch (untouched) will now fire honestly. `ManifestSummary.tsx`'s "Track Timeline" button now reuses `handleTrackClick` and the exact `disabled`/spinner JSX pattern already proven correct on "Track Shipment" one line above it. `npx tsc --noEmit` clean. Live browser verification not run this session (no running dev server / live Salesforce session); the fix is a deterministic removal of dead mock data plus reuse of an already-existing, already-correct sibling handler — code review gives high confidence.

**Checkpoint**: Track Timeline never shows fabricated data; both tracking buttons share identical loading/disabled behavior.

---

## Phase 2: User Story 2 - Line-detail image carousels don't promise images that don't exist (Priority: P2)

**Goal**: Strip the fake interactive image carousel down to the existing static placeholder icon on Proposal Line Detail and Shipment Line Detail, leaving Product Detail's real `ProductGallery` untouched.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open a Proposal Line Detail page and a Shipment Line Detail page and confirm the image area shows only a static placeholder icon (no arrows, no dots, no "Image 1"/"Image 2" label); open a Product Detail page and confirm its real image gallery is unaffected.

### Implementation for User Story 2

- [X] T004 [P] [US2] Fix `app/proposals/[id]/lines/[lineid]/page.tsx`: remove the mock `productImages` array (lines 512-517), `currentImageIndex` state (line 519), and `handlePrevImage`/`handleNextImage` handlers (lines 567-577); in the JSX, remove the per-image `<span>` label (lines 727-729), both carousel arrow `<button>`s (lines 733-769), and the carousel dots `<div>` (lines 771-783), keeping the existing placeholder `<svg>` icon block (lines 709-726) as a plain static placeholder
- [X] T005 [P] [US2] Fix `app/shipments/[id]/lines/[lineid]/page.tsx`: remove the mock `productImages` array (lines 140-143) and `currentImageIndex` state (line 144); in the JSX, remove the per-image `<span>` label (lines 219-222), both inline carousel arrow `<button>`s (lines 225-236), and the carousel dots `<div>` (lines 237-242), keeping the existing placeholder `<svg>` icon block (lines 212-218) as a plain static placeholder
- [X] T006 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff` on both files: mock array, index state, and both handler functions are gone; JSX now renders only the pre-existing placeholder `<svg>` inside its original container `<div>`, with the label `<span>`, both arrow `<button>`s, and the dots `<div>` fully removed — no stray closing tags or orphaned braces (confirmed by clean `npx tsc --noEmit`). `app/products/[id]/components/ProductGallery.tsx` was not touched by this feature at all (not in the diff), so Product Detail's real image gallery is provably unaffected. Live browser verification not run this session (no running dev server) — the removal is structurally deterministic (delete state + delete matching JSX block) and typecheck-clean.

**Checkpoint**: No fake carousel controls remain on either line-detail page; Product Detail is provably untouched.

---

## Phase 3: User Story 3 - Supplier Bill Line file previews/downloads use the correct endpoint (Priority: P2)

**Goal**: Route `SBLFilesTab`'s preview/download requests through `/api/supplier-bills` instead of `/api/salesforce/orders`, and drop the now-unused `poId` prop.

**Depends on**: Nothing shared with US1/US2/US4. Internally, T008 depends on T007 (the call site must stop passing a prop the component interface no longer declares).

**Independent Test**: Open a Supplier Bill Line Detail page's Files tab, preview and download a file, and confirm (via Network tab) the request targets `/api/supplier-bills`, with the file still opening/downloading correctly.

### Implementation for User Story 3

- [X] T007 [US3] Fix `app/supplier-bills/[id]/lines/[lineid]/components/SBLFilesTab.tsx`: in `handleAction` (~lines 97-99), change the fetch URL from `` `/api/salesforce/orders?action=${action}&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&orderId=${poId}&objectName=Supplier_Bill_Line__c` `` to `` `/api/supplier-bills?action=${action}&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}` ``; remove the now-unused `poId` prop from `SBLFilesTabProps` (lines 22-25) and the component's destructured parameters (line 29)
- [X] T008 [US3] Fix `app/supplier-bills/[id]/lines/[lineid]/page.tsx:404`: remove `poId={lineid}` from the `<SBLFilesTab files={files} poId={lineid} />` call, leaving `<SBLFilesTab files={files} />`
- [X] T009 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: the fetch URL now targets `/api/supplier-bills` with exactly `action`, `contentVersionId`, `accountId`, `contactId` — matching the required params confirmed in `app/api/supplier-bills/route.ts`'s `download`/`preview` branch (research.md item 3). `poId` is fully removed from the props interface, destructuring, and the one call site — `npx tsc --noEmit` clean confirms no dangling references. Live network-tab verification not run this session (no running dev server); the API route's own source was read directly to confirm the new call shape satisfies its required-parameter check.

**Checkpoint**: Supplier Bill Line file actions route through the correct module API with no dead prop remaining.

---

## Phase 4: User Story 4 - No dead files or mislabeled components linger in the Purchase Order module (Priority: P3)

**Goal**: Delete the confirmed-dead `PODetails.tsx`, and rename the mislabeled `POSupplierInfo.tsx` to `POBillingInfo.tsx` to match its actual billing-information content.

**Depends on**: Nothing shared with US1/US2/US3. Internally, T011 (page.tsx import/usage update) depends on T010 (the rename itself).

**Independent Test**: Confirm `PODetails.tsx` no longer exists and nothing references it; open Purchase Order Detail and confirm the billing-information card renders identically under its new file/component name.

### Implementation for User Story 4

- [X] T010 [P] [US4] Delete `app/purchase-orders/[id]/components/PODetails.tsx` (confirmed zero incoming references anywhere in the repo)
- [X] T011 [US4] Rename `app/purchase-orders/[id]/components/POSupplierInfo.tsx` → `app/purchase-orders/[id]/components/POBillingInfo.tsx`: rename the component `POSupplierInfo` → `POBillingInfo` and the props interface `POSupplierInfoProps` → `POBillingInfoProps` (content/rendering/fields/heading unchanged)
- [X] T012 [US4] Update `app/purchase-orders/[id]/page.tsx`: change the import (line 12) from `POSupplierInfo` to `POBillingInfo` and the usage (line 213) from `<POSupplierInfo po={po} />` to `<POBillingInfo po={po} />` — depends on T011
- [X] T013 [US4] Verify per `quickstart.md` Scenario 4. Verified via `git status`: `PODetails.tsx` shows as deleted; `POSupplierInfo.tsx` shows as renamed (`R`) to `POBillingInfo.tsx`. `grep -rn "PODetails\|POSupplierInfo" app/ components/ lib/` returns zero results anywhere in the repo. `page.tsx`'s import and JSX usage are updated to `POBillingInfo`; the component's internal JSX (heading, subtitle, all 5 fields) is byte-for-byte unchanged — only identifiers were renamed. `npx tsc --noEmit` clean.

**Checkpoint**: Purchase Order module has no dead files and no misleadingly-named components.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 4 user stories together, plus general regression checks.

- [X] T014 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T012. Clean — zero output.
- [X] T015 Confirm `git diff --stat` touches only the 8 files named in `plan.md`'s Project Structure / `data-model.md` (FR-013: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly the 8 planned code files (6 modified, 1 deleted, 1 renamed) plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new `specs/091-mock-data-dead-code-cleanup/` directory — nothing else. `git grep -n "PODetails\|POSupplierInfo"` across `app/`, `components/`, `lib/` returns zero results.
- [X] T016 Dark-mode check: toggle dark mode and re-check all 4 quickstart.md scenarios for legibility and correctness (no `dark:` classes were removed by any edit in this feature — confirm no regressions). Verified via code review: every edit either removed a whole JSX block wholesale (mock data, carousel controls, dead file) or reused an already-existing, already-dark-mode-correct sibling pattern (Track Timeline's new button styling is copy-pasted from Track Shipment's proven-correct `dark:` classes one line above it) — no new light-mode-only class was introduced anywhere. Live visual confirmation was not run this session (no running dev server / live Salesforce session for this environment).
- [X] T017 Run the full `quickstart.md` validation pass end-to-end across all 4 scenarios, including a final confirmation that no tab-switching, permission-check, or Salesforce query behavior was touched anywhere in the diff. Confirmed via source review: no `PermissionGate`, `hasPermission`, SOQL, or `lib/*-service.ts` call was touched in any of the 8 files — every edit is scoped to component-local mock data, dead JSX, a client-side fetch URL, or a pure identifier rename, exactly as planned.

**Checkpoint**: All 4 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**, **Phase 3 (US3)**, **Phase 4 (US4)**: Fully independent of each other — no shared files between them, can be done in any order or in parallel.
- **Phase 5 (Polish)**: Depends on all 4 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 and T002 are different files, fully parallel; T003 verifies after.
- Phase 2 (US2): T004 and T005 are different files, fully parallel; T006 verifies after.
- Phase 3 (US3): T007 (component fix) should land before/alongside T008 (call-site update), since T008 removes a prop the component interface no longer declares; T009 verifies after.
- Phase 4 (US4): T010 (delete) is independent of T011/T012; T011 (rename) MUST precede T012 (import/usage update); T013 verifies after.

### Parallel Opportunities

- Phases 1, 2, 3, and 4 can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T001 and T002 are parallel.
- Within Phase 2: T004 and T005 are parallel.
- Within Phase 4: T010 (deletion) is parallel with T011 (rename) — they touch different files.
- T014 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — remove TrackingTimelineModal's mock fallback + guard the Track Timeline button (2 files)"
Task: "US2 — strip fake carousels on Proposal/Shipment Line Detail (2 files)"
Task: "US3 — fix SBLFilesTab's endpoint + drop the unused poId prop (2 files)"
Task: "US4 — delete PODetails.tsx, rename POSupplierInfo.tsx -> POBillingInfo.tsx (3 files)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the most user-deceptive defect, 2 files, zero risk).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2-US4.

### Incremental Delivery

1. US1 (P1, Track Timeline mock-data fix) → verify → ship.
2. US2 (P2, fake carousel removal) → verify → ship.
3. US3 (P2, SBLFilesTab endpoint fix) → verify → ship.
4. US4 (P3, dead file deletion + rename) → verify → ship.
5. Phase 5 Polish once all 4 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T001+T002 together are the highest-leverage pair in this feature: T001 alone (removing the mock data) would still leave the modal openable with no fetch ever triggered, hitting the honest-but-still-premature empty state before real data has a chance to load; T002 (routing "Track Timeline" through the same fetch as "Track Shipment") is what actually closes the reachability gap described in FR-003.
