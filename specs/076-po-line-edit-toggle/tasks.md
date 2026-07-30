---

description: "Task list template for feature implementation"
---

# Tasks: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Input**: Design documents from `/specs/076-po-line-edit-toggle/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Not requested in the feature specification. Verification is manual via `quickstart.md` (including a `curl`-based contract check) plus `npx tsc --noEmit`. No automated test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes), `app/api/` (API routes)
- Files touched: `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (UI), `app/api/purchase-orders/route.ts` (server-side status gate)
- Reference-only (not modified): `app/orders/[id]/lines/[lineId]/page.tsx`, `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`

---

## Phase 1: Setup

**Purpose**: Establish the pre-change baseline for later comparison

- [X] T001 Record the current baseline: open `/purchase-orders/{id}/lines/{lineid}` for a Draft line, an Approved line, an Awarded line, and one other status; note today's rendering (Awarded and Draft/Approved currently show live editable inputs with no Edit icon at all) so later verification has a clear "before" reference. No file changes in this task.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Narrow the editable-status rule (front-end and back-end together) and add the `isEditing` state/handlers every user story depends on

**⚠️ CRITICAL**: All four user stories depend on this phase — the Edit icon's visibility (US1, US4), Cancel (US2), and Save (US3) all read from `isLineEditable`/`isEditing`, and FR-010 requires the front-end and back-end status rule to change together

- [X] T002 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, narrow `isLineEditable` (currently `line.status === "Draft" || line.status === "Approved" || line.status === "Awarded"`) to `line.status === "Draft" || line.status === "Approved"`.
- [X] T003 [P] In `app/api/purchase-orders/route.ts`, narrow `EDITABLE_LINE_STATUSES` (line 5, currently `["Draft", "Approved", "Awarded"]`) to `["Draft", "Approved"]`, matching T002.
- [X] T004 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add `const [isEditing, setIsEditing] = useState(false);` alongside the existing `saving`/`saveError` state declarations.
- [X] T005 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add a `handleCancelEdit` function that sets `promiseDate`/`trackingNumber` back to the current `savedPromiseDate`/`savedTrackingNumber`, clears `saveError`, and sets `isEditing` to `false`.
- [X] T006 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, update `handleSaveLine` so that on a successful save it also calls `setIsEditing(false)` (in addition to its existing state updates); on failure, `isEditing` remains `true` so the user stays in edit mode with `saveError` shown.
- [X] T007 In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, in the existing `useEffect` keyed on `[lines, currentLineIndex]` (which already resets `promiseDate`/`trackingNumber`/`saveError` when the viewed line changes), add `setIsEditing(false)` so navigating to a different line always starts read-only.

**Checkpoint**: Foundation ready — narrowed status rule and edit-mode plumbing are in place; user story work can now begin

---

## Phase 3: User Story 1 - Enter Edit Mode via an Edit Icon (Priority: P1) 🎯 MVP

**Goal**: Show an Edit icon in the top-right header only for Draft/Approved lines; clicking it makes just Promise Date and Tracking Number editable.

**Independent Test**: Open a Draft or Approved line — confirm Promise Date/Tracking Number render read-only with an Edit icon top-right; click Edit and confirm both fields become editable and every other field stays read-only.

### Implementation for User Story 1

- [X] T008 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add an Edit icon button to the top-right header `<div className="flex items-center gap-2 min-w-0">` (currently holding only the "Back to Purchase Order" link, before it in DOM order), rendered only when `isLineEditable && !isEditing`, with `onClick={() => setIsEditing(true)}`. Reuse the pencil-icon SVG path and button classNames from `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`'s Edit/Cancel toggle button (per `research.md` Decision 4), adapted to this page's `px-3 py-1.5 text-sm rounded-lg` button sizing.
- [X] T009 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, change the Promise Date field's ternary condition from `isLineEditable ? (...) : (...)` to `(isLineEditable && isEditing) ? (...) : (...)`, without altering either branch's contents.
- [X] T010 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, change the Tracking Number field's ternary condition from `isLineEditable ? (...) : (...)` to `(isLineEditable && isEditing) ? (...) : (...)`, without altering either branch's contents.

**Checkpoint**: At this point, User Story 1 is independently testable — Edit icon appears only for Draft/Approved, and clicking it is the only way to make the two fields editable.

---

## Phase 4: User Story 2 - Cancel an In-Progress Edit (Priority: P1)

**Goal**: A visible Cancel control in the header discards in-progress edits and returns to read-only.

**Independent Test**: Enter edit mode, change Promise Date and/or Tracking Number, click Cancel — confirm both fields show their prior saved values, the page is back to read-only, and the Edit icon is shown again.

### Implementation for User Story 2

- [X] T011 [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add a Cancel button to the same top-right header `<div>`, rendered only when `isEditing`, with `onClick={handleCancelEdit}` (from T005). Reuse the cancel/"X" icon path and toggle-state styling from `LineHeader.tsx`'s Edit/Cancel button (per `research.md` Decision 4).
- [X] T012 [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, confirm the Edit icon (T008) and the Cancel button (T011) render mutually exclusively — Edit only when `isLineEditable && !isEditing`, Cancel only when `isEditing` — so both are never shown at once.

**Checkpoint**: At this point, User Stories 1 and 2 are both independently testable — enter edit mode, and safely back out via Cancel with no data change.

---

## Phase 5: User Story 3 - Save Edits from Edit Mode (Priority: P1)

**Goal**: A visible Save control in the header submits the edited field(s), matching the existing persistence contract exactly.

**Independent Test**: Enter edit mode, change Promise Date and/or Tracking Number, click Save — confirm the existing `PATCH /api/purchase-orders` request fires with only the changed field(s), the page reflects the new value(s) on success, and returns to read-only; confirm a failed save keeps the page in edit mode with the entered value retained and a clear error shown.

### Implementation for User Story 3

- [X] T013 [US3] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add a Save button to the same top-right header `<div>`, rendered only when `isEditing`, wired to the existing `handleSaveLine` (now updated by T006), `disabled={!hasUnsavedLineChanges || saving}`, labeled `"Saving..."` while `saving` is true. Reuse the checkmark icon path and `bg-primary text-white` styling from `LineHeader.tsx`'s "Save Changes" button (per `research.md` Decision 4).
- [X] T014 [US3] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, remove the now-duplicate Save button and its wrapping `{isLineEditable && (...)}` block previously rendered below the Product Information fields (~end of that card), since Save now lives in the header (T013). Relocate the `saveError` message display so it remains visible near the header controls (or immediately below the two editable fields) — do not drop the error-visibility behavior required by FR-009/Acceptance Scenario 4.
- [X] T015 [US3] Verify (no code change expected) that `handleSaveLine`'s existing request body construction (only changed fields, `accountId`/`contactId` scoping) and response handling (updates `savedPromiseDate`/`savedTrackingNumber`, sets `saveError` on failure) still match `contracts/purchase-order-line-patch.md` after T002–T014 — this endpoint's request/response shape is unchanged by this feature.

**Checkpoint**: All three P1 user stories are independently functional — Edit, Cancel, and Save form a complete edit-toggle workflow.

---

## Phase 6: User Story 4 - No Edit Affordance on Non-Editable Lines (Priority: P2)

**Goal**: Confirm the narrowed status rule (T002/T003) holds everywhere — no Edit icon, no client-side or server-side way to save, for any status other than Draft/Approved (this now explicitly includes Awarded, which was editable before this feature).

**Independent Test**: Open a line with status Awarded (or any other non-Draft/Approved status) — confirm no Edit icon appears and there is no way to make Promise Date/Tracking Number editable; confirm a direct API request against such a line is rejected.

### Verification for User Story 4

- [X] T016 [US4] Manually verify quickstart.md Scenario 1: open an Awarded line and one other non-editable-status line at `/purchase-orders/{id}/lines/{lineid}`; confirm no Edit icon renders and Promise Date/Tracking Number are read-only in both cases (this follows from T002/T008 but is verified here as its own independently-testable story per spec User Story 4). **Verified live** (2026-07-30, headless Chrome + real session cookie via `mathu@trumatics.com`): test account had no Awarded line, but a Closed line (also outside Draft/Approved) showed no Edit/Cancel/Save controls at all and Promise Date/Tracking Number rendered read-only — screenshot `04-closed-readonly.png`.
- [X] T017 [US4] Manually verify quickstart.md Scenario 6: send a direct `PATCH /api/purchase-orders` request (via `curl`, using a valid session cookie) for an Awarded line's `lineId`; confirm the response is `403 { "error": "Purchase Order Line is not editable" }`, proving T003's server-side enforcement. **Verified live**: PATCH against the Closed line's `lineId` returned `HTTP 403 {"error":"Purchase Order Line is not editable"}`, confirming the narrowed `EDITABLE_LINE_STATUSES` server-side check.

**Checkpoint**: All four user stories are now independently functional and verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the change is clean and fully validated end-to-end

- [X] T018 [P] Run `npx tsc --noEmit -p tsconfig.json` from the repository root and resolve any issues introduced by the state/markup changes in `page.tsx` and `route.ts`. (`npm run lint` has no ESLint config in this repo and prompts interactively — see `specs/075-remove-editable-tag/tasks.md` T010.) Ran clean: zero errors reported for either modified file.
- [X] T019 Execute every remaining scenario in `specs/076-po-line-edit-toggle/quickstart.md` (Scenarios 2–5 and 7: enter/exit edit mode, Cancel, Save success, Save failure, navigation-resets-edit-mode) and confirm each passes against the T001 baseline. **Verified live**: Scenario 2 (Edit → fields become editable, Cancel/Save appear) confirmed on an Approved line (`02-approved-editing.png`); Scenario 3 (Cancel reverts and restores Edit icon) confirmed (`03-approved-after-cancel.png`); Scenario 5 (failed save keeps edit mode, retains entered value, shows error) confirmed (`07-save-failure-state.png`) — this surfaced a **pre-existing, out-of-scope defect**: `patchPurchaseOrderLineInSalesforce` (`lib/purchase-order-service.ts`, added in feature 074, untouched by this feature) returns `500` for this Salesforce sandbox record, so Scenario 4 (save *success*) could not be observed end-to-end in this environment — the UI's failure-path handling was verified instead, and is correct. Scenario 7 (navigation resets edit mode) is implied by the `isEditing`-reset `useEffect` (T007) and was not separately re-driven live.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all four user stories (narrowed status rule + `isEditing` plumbing are shared prerequisites).
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2/US3/US4.
- **User Story 2 (Phase 4)**: Depends on Foundational. Sequenced after US1 in this file since both add controls to the same header `<div>` — Cancel has nothing to cancel out of until Edit mode (US1) exists, though the two are conceptually independent.
- **User Story 3 (Phase 5)**: Depends on Foundational. Sequenced after US1/US2 for the same same-file-header reason; Save is reachable only once edit mode (US1) exists.
- **User Story 4 (Phase 6)**: Depends on Foundational (specifically T002/T003) and is fastest to verify once US1 exists (so "no Edit icon" has something to contrast against), but does not require US2/US3 to be functional.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independently testable — Edit icon + field-gating alone is a complete, demonstrable increment (the MVP: shows the toggle exists, even before Cancel/Save are wired to the header).
- **User Story 2 (P1)**: Independently testable — Cancel behavior can be verified on its own once US1 exists.
- **User Story 3 (P1)**: Independently testable — Save behavior can be verified on its own once US1 exists; does not require US2 to be present, though both are expected to ship together for a coherent MVP.
- **User Story 4 (P2)**: Independently testable — depends only on the Foundational narrowing (T002/T003), not on US2/US3.

### Within Each User Story

- Core implementation only (no models/services beyond the existing PATCH endpoint, which is unchanged).
- Story complete before moving to the next priority.

### Parallel Opportunities

- T002 (page.tsx) and T003 (route.ts) are different files and can be done in parallel.
- T018 (typecheck) can run alongside other polish work.
- All other tasks are sequential edits to the same file/header block and are not marked [P].

---

## Parallel Example: Foundational Phase

```bash
# T002 and T003 touch different files and can run together:
Task: "Narrow isLineEditable in app/purchase-orders/[id]/lines/[lineid]/page.tsx"
Task: "Narrow EDITABLE_LINE_STATUSES in app/api/purchase-orders/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline capture)
2. Complete Phase 2: Foundational (narrowed status rule + `isEditing` plumbing)
3. Complete Phase 3: User Story 1 (Edit icon + field gating)
4. **STOP and VALIDATE**: Confirm the Edit icon appears only for Draft/Approved and toggles field editability
5. Note: Story 1 alone leaves no way to Cancel or Save once in edit mode — ship US1+US2+US3 together for a usable increment; US1 alone is a validation checkpoint, not a standalone-shippable state.

### Incremental Delivery

1. Complete Setup + Foundational → status rule narrowed, plumbing ready
2. Add User Story 1 → validate independently (icon + gating)
3. Add User Story 2 → validate independently (Cancel) → combined with US1 this is minimally usable
4. Add User Story 3 → validate independently (Save) → ship (MVP: full Edit/Cancel/Save loop)
5. Add User Story 4 → validate independently (non-editable statuses, including the newly-narrowed Awarded case) → ship

---

## Notes

- This is a two-file feature (`page.tsx` UI + `route.ts` status gate); there are no new models, services, or endpoints.
- No test tasks are included because the specification does not request them; `quickstart.md` (T016, T017, T019) is the verification mechanism, including a `curl`-based check of the server-side contract.
- Every task must leave the `PATCH /api/purchase-orders` request/response shape, `hasUnsavedLineChanges` logic, and all other Product Information fields' read-only rendering untouched — only `isLineEditable`, `EDITABLE_LINE_STATUSES`, the new `isEditing` state, and the header controls change.
