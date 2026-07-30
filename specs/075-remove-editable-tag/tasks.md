---

description: "Task list template for feature implementation"
---

# Tasks: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Input**: Design documents from `/specs/075-remove-editable-tag/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Not requested in the feature specification. This is a presentation-only change; verification is manual via `quickstart.md` plus `npm run lint`. No automated test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes)
- All tasks below operate on a single existing file: `app/purchase-orders/[id]/lines/[lineid]/page.tsx`
- Reference-only (not modified): `app/orders/[id]/lines/[lineId]/page.tsx`, `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`

---

## Phase 1: Setup

**Purpose**: Establish the pre-change baseline so later steps can verify nothing but presentation changed

- [X] T001 Record the current baseline: open `/purchase-orders/{id}/lines/{lineid}` for one line with status Draft/Approved/Awarded and one with a non-editable status; note the exact current rendering (badge present/absent, field values, save button behavior) so `Phase 6` validation has a clear "before" reference. No file changes in this task.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pin down exact edit locations shared by both user stories before either one edits the file

**⚠️ CRITICAL**: Both user stories below edit the same two field blocks in the same file; completing this phase first avoids conflicting/overlapping edits

- [X] T002 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, identify the current line ranges for the Promise Date field block (label + "Editable" badge span + `isLineEditable` ternary input) and the Tracking Number field block (same structure), confirming they match the badge markup described in `research.md` Decision 1 (`text-[10px] text-primary font-semibold uppercase tracking-wider` spans, each inside `{isLineEditable && (...)}`).

**Checkpoint**: Edit anchors confirmed — user story work can now begin

---

## Phase 3: User Story 1 - Remove the "Editable" Tag from Fields (Priority: P1) 🎯 MVP

**Goal**: Delete the "Editable" text badge next to Promise Date and Tracking Number without touching which branch renders (editable input vs. read-only input) or any save/data logic.

**Independent Test**: Open a Draft/Approved/Awarded purchase order line — confirm no "Editable" badge appears next to either label, the fields are still live inputs, and saving Tracking Number/Promise Date still works exactly as before.

### Implementation for User Story 1

- [X] T003 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, remove the `{isLineEditable && (<span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Editable</span>)}` block from the Promise Date field (currently ~line 489-491), leaving the label and the existing `isLineEditable ? <input type="date" .../> : <input type="text" readOnly .../>` ternary completely unchanged.
- [X] T004 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, remove the equivalent `{isLineEditable && (<span ...>Editable</span>)}` block from the Tracking Number field (currently ~line 517-519), leaving the label and the existing `isLineEditable ? <input type="text" .../> : <input type="text" readOnly .../>` ternary completely unchanged.
- [X] T005 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, simplify the label wrapper `<div className="flex items-center justify-between mb-1">` for Promise Date and Tracking Number (previously needed to place the label and badge side-by-side) back to the same single-label pattern used by every other field in the card (`<label className="block text-sm font-bold ... mb-1 truncate">`), preserving the exact label text and `title` attributes — no other field's markup is touched.

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — the badge is gone and all editable/save/read-only behavior is unchanged.

---

## Phase 4: User Story 2 - Align Field Presentation Style with the Order Line Detail Page (Priority: P2)

**Goal**: Bring label and input styling across the Product Information card into visual alignment with `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`, per the class-name mapping documented in `research.md` Decision 2, without changing which fields are editable or any data/save behavior.

**Independent Test**: Compare the Purchase Order Line page's Product Information card against the Order Line page's Product Information card (light and dark mode) — labels and inputs should follow the same visual pattern; the underlying `isLineEditable` gating, save flow, and error handling must behave exactly as before (re-run User Story 1's independent test to confirm no regression).

### Implementation for User Story 2

- [X] T006 [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, update the label `className` on all nine Product Information fields (Product Name, Description, Brand Name, Need by Date, Ship by Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date) from `text-sm font-bold text-gray-700 dark:text-gray-500` to `text-sm font-bold text-gray-700 dark:text-gray-300`, matching the reference in `ProductInfo.tsx`. Label text and `title` attributes are unchanged.
- [X] T007 [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, update the `className` on the seven always-read-only inputs (Product Name, Description, Brand Name, Need by Date, Ship by Date, Tracking Status, Estimated Delivery Date) from `w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate` to the reference's read-only convention `w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate`. `readOnly`, `value`, and `title` props are unchanged.
- [X] T008 [US2] [P] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, apply the same read-only input `className` from T007 to the read-only branch of Promise Date and Tracking Number (the `isLineEditable === false` branch of each ternary), leaving `value`/`title` logic unchanged. (Marked [P] with T009 — same file but non-overlapping branches of the two ternaries; coordinate if applying by hand in one pass.)
- [X] T009 [US2] [P] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, update the editable-branch `className` of Promise Date and Tracking Number (the `isLineEditable === true` branch of each ternary) to adopt the same sizing/shape convention (`h-11`, `rounded-lg`) while preserving the existing editable-state cues that signal the field can be edited (white/bg-gray-700 background, visible border, `focus:ring-2 focus:ring-primary`) per `research.md` Decision 3. All `value`, `onChange`, and `placeholder` props are unchanged.

**Checkpoint**: All user stories are now independently functional — badge removed, styling aligned, zero logic changes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the presentation-only change is clean and fully validated

- [X] T010 [P] Run `npm run lint` from the repository root and resolve any issues introduced by the className/markup edits. **Note**: `next lint` has no ESLint config in this repo and prompts interactively to create one (out of scope for this feature) — substituted `npx tsc --noEmit -p tsconfig.json`, which reports zero errors for `app/purchase-orders/[id]/lines/[lineid]/page.tsx`.
- [ ] T011 Execute every scenario in `specs/075-remove-editable-tag/quickstart.md` (badge removed for both statuses, save/error behavior unchanged, visual parity with the Order Line page in light and dark mode) and confirm each passes against the T001 baseline. **Not yet run**: requires live Salesforce-connected portal login credentials (per `[[project-headless-verification]]` memory) not available in this session, and a `next dev` server already owned by the user is running against this project — verify manually in the browser, or share test credentials to have this automated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS both user stories (shared edit-location analysis).
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion. No dependency on User Story 2.
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion. Recommended (not strictly required) to run after User Story 1 since both touch the same Promise Date/Tracking Number blocks in the same file — doing US1 first avoids re-locating the badge markup mid-restyle.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independently testable on its own — badge removal alone is a complete, shippable increment (the MVP).
- **User Story 2 (P2)**: Independently testable on its own — styling alignment does not require US1's edits to function correctly, but is sequenced after US1 in this file to avoid overlapping edits to the same lines.

### Within Each User Story

- Core implementation only (no models/services/endpoints — presentation-only feature).
- Story complete before moving to the next priority.

### Parallel Opportunities

- T008 and T009 touch disjoint branches (read-only vs. editable) of the same two ternaries and may be done in either order or together.
- All other tasks are sequential single-file edits and are not marked [P].

---

## Parallel Example: User Story 2

```bash
# T008 and T009 touch different branches of the same ternary blocks:
Task: "Align read-only branch className for Promise Date and Tracking Number"
Task: "Align editable branch className for Promise Date and Tracking Number"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline capture)
2. Complete Phase 2: Foundational (locate edit anchors)
3. Complete Phase 3: User Story 1 (remove the badge)
4. **STOP and VALIDATE**: Confirm badge is gone and save/read-only behavior is unchanged
5. Ship if that's all that's needed — the badge removal alone satisfies the user's literal, highest-priority ask

### Incremental Delivery

1. Complete Setup + Foundational → anchors confirmed
2. Add User Story 1 → validate independently → ship (MVP)
3. Add User Story 2 → validate independently (including a re-check of US1's scenarios) → ship

---

## Notes

- This is a single-file, presentation-only change (Tailwind class names and JSX markup); there are no models, services, or API endpoints to generate tasks for.
- No test tasks are included because the specification does not request them; `quickstart.md` (T011) is the verification mechanism.
- Every task in Phases 3–4 must leave `isLineEditable`, `handleSaveLine`, `hasUnsavedLineChanges`, `saveError`, and all `useState`/`useEffect` logic in `app/purchase-orders/[id]/lines/[lineid]/page.tsx` untouched — only `className` values and the badge markup change.
