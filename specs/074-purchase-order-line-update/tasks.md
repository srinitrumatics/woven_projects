---

description: "Task list for: Save Tracking Number and Promise Date on Purchase Order Line"
---

# Tasks: Save Tracking Number and Promise Date on Purchase Order Line

**Input**: Design documents from `/specs/074-purchase-order-line-update/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/patch-purchase-order-line.md](./contracts/patch-purchase-order-line.md), [quickstart.md](./quickstart.md)

**Tests**: Not requested in the feature specification — no automated test tasks are included. Validation is via [quickstart.md](./quickstart.md) (Final Phase, T014).

**Organization**: Tasks are grouped by user story (US1/US2/US3, matching spec.md's priorities) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path

## Path Conventions

Next.js App Router (this project, per plan.md's Project Structure): `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (client component), `app/api/purchase-orders/route.ts` (route handler), `lib/purchase-order-service.ts` (Salesforce service). No new files or directories are created — every task extends one of these three existing files.

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

No setup is required. This feature extends three existing files (`lib/purchase-order-service.ts`, `app/api/purchase-orders/route.ts`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx`) within the already-running Next.js app — there is no new project, dependency, or tooling to initialize (Constitution Principle V: no speculative scaffolding).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The Salesforce write path shared by every user story — without it, no story (save, editability guard, or failure handling) can be exercised end-to-end.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Add `patchPurchaseOrderLineInSalesforce(payload)` to `lib/purchase-order-service.ts`, mirroring `patchProductTabInSalesforce()` in `lib/product-salesforce-service.ts`: resolve `getSalesforceSession()`, `PATCH` to `${session.instanceUrl}/services/apexrest/gtherp/purchaseorderlines` with `Authorization: Bearer <accessToken>` / `Content-Type: application/json`, body = the caller-supplied payload (`{ purchaseOrderLines: [{ Id, ...fields }], accountId, contactId }` per [contracts/patch-purchase-order-line.md](./contracts/patch-purchase-order-line.md) §2), log and throw on a non-OK response, otherwise return the parsed JSON.
- [X] T002 Add a `PATCH` export to `app/api/purchase-orders/route.ts` (alongside the existing `GET`): read `lineId` from the query string and `{ accountId, contactId, trackingNumber, promiseDate }` from the JSON body; return `400` via `NextResponse.json({ error: ... }, { status: 400 })` if `lineId`/`accountId`/`contactId` is missing or neither `trackingNumber` nor `promiseDate` is present; otherwise build the upstream payload (only the provided field(s) go into `purchaseOrderLines[0]`, per data-model.md VR-004) and call `patchPurchaseOrderLineInSalesforce()` from T001.
- [X] T003 In the same `PATCH` handler from T002, map the upstream response into the client contract: on `success: true`, read `data[0].Purchase_Order_Line__c[0].Tracking_Number__c` / `.Promise_Date__c` and return `NextResponse.json({ success: true, trackingNumber, promiseDate })`; on `success: false` or a missing/empty `data` array, return `404` with `{ error: "Purchase Order Line not found or not updated" }`; on a thrown error from T001, return `500` with `{ error: ... }` (depends on T001, T002).

**Checkpoint**: The `/api/purchase-orders` PATCH endpoint is callable end-to-end (verifiable via the `curl` example in [quickstart.md](./quickstart.md)) — user story implementation can now begin.

---

## Phase 3: User Story 1 - Save an Edited Tracking Number or Promise Date (Priority: P1) 🎯 MVP

**Goal**: A user editing Tracking Number and/or Promise Date on an editable line can save the change, see it reflected immediately, and have it survive a page reload. An unmodified view never fires a save.

**Independent Test**: Open a line with status Draft/Approved/Awarded, edit one or both fields, save, confirm the page shows the new values, then reload and confirm the values persisted (spec.md Acceptance Scenarios 1-2, 4 of User Story 1).

### Implementation for User Story 1

- [X] T004 [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, extend the existing effect at lines 43-49 (which sets `promiseDate`/`trackingNumber` from `lines[currentLineIndex]`) to also capture the loaded values into a new baseline (e.g. `savedTrackingNumber`/`savedPromiseDate` state) so later edits can be compared against what's actually persisted, not just the initial render.
- [X] T005 [US1] In the same file, add a `handleSaveLine` async function: compare current `trackingNumber`/`promiseDate` state against the baseline from T004; if neither differs, return without making a request (spec.md Acceptance Scenario 3); otherwise build a body containing only the changed field(s) plus `SF_ACCOUNT_ID`/`SF_CONTACT_ID` (already derived at the top of the component) and call `fetch(\`/api/purchase-orders?lineId=${line.id}\`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })` (depends on T004, and on T002/T003 for the endpoint to exist).
- [X] T006 [US1] In the Product Information card's Tracking Number/Promise Date block (lines 429-485 of `app/purchase-orders/[id]/lines/[lineid]/page.tsx`), add a save control (e.g. a small "Save" button rendered next to the "Editable" badge) that is enabled only when `trackingNumber !== savedTrackingNumber || promiseDate !== savedPromiseDate`, calling `handleSaveLine` from T005 on click (depends on T004, T005).
- [X] T007 [US1] In `handleSaveLine`, on a `200` response, update both the live `lines` state entry for `currentLineIndex` and the `savedTrackingNumber`/`savedPromiseDate` baseline from T004 with the `trackingNumber`/`promiseDate` values returned by the API, so the page reflects the save with no manual refresh needed and the dirty-check in T006 re-disables the save control (depends on T005, T006).

**Checkpoint**: User Story 1 is fully functional and independently testable — a user can edit, save, and see the change survive a reload.

---

## Phase 4: User Story 2 - Prevent Edits on Non-Editable Lines (Priority: P1)

**Goal**: The save capability added in User Story 1 never becomes reachable for a line whose status doesn't permit editing, whether through the UI or a direct API call.

**Independent Test**: Open a line whose status is not Draft/Approved/Awarded, confirm both fields render read-only with no save control visible; separately, call the PATCH endpoint directly for such a line and confirm it is rejected (spec.md Acceptance Scenario 1 of User Story 2).

### Implementation for User Story 2

- [X] T008 [US2] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, confirm the save control added in T006 is placed inside the existing `(line.status === "Draft" || line.status === "Approved" || line.status === "Awarded")` conditional blocks (lines 439 and 467) alongside the editable `<input>` elements — it must not render in the `else` (read-only) branch of either field.
- [X] T009 [US2] In the `PATCH` handler in `app/api/purchase-orders/route.ts` (from T002/T003), add a server-side guard before calling `patchPurchaseOrderLineInSalesforce()`: look up the target line's current `Status__c` (reusing the existing lines lookup this route already performs for `GET`, or an equivalent minimal fetch scoped by `lineId`/`accountId`/`contactId`) and return `403` with `{ error: "Purchase Order Line is not editable" }` if it is not Draft, Approved, or Awarded — enforcing FR-009 independent of the client-side gate in T008 (depends on T002, T003).

**Checkpoint**: User Stories 1 AND 2 both work independently — the save path exists (US1) and is provably unreachable for non-editable lines from both the UI and the API (US2).

---

## Phase 5: User Story 3 - Handle a Failed Save (Priority: P2)

**Goal**: When a save fails, the user sees a clear failure indication and their unsaved edits remain in the input fields for retry.

**Independent Test**: Force a save request to fail (e.g., block the network call or trigger the 403/404/500 paths from T003/T009) and confirm a failure message appears while the typed values remain in the Tracking Number/Promise Date inputs (spec.md Acceptance Scenarios 1-2 of User Story 3).

### Implementation for User Story 3

- [X] T010 [US3] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, add `saveError` state; in `handleSaveLine` (from T005), wrap the `fetch` call in a try/catch and check `response.ok`/`success` on the parsed body — on any failure, set `saveError` to a user-facing message and return without touching `trackingNumber`/`promiseDate` state (depends on T005).
- [X] T011 [US3] Render the `saveError` message inline near the Tracking Number/Promise Date fields (within the same block from T006) when set; clear `saveError` at the start of the next `handleSaveLine` call and whenever the user edits either field again (depends on T010).

**Checkpoint**: All three user stories are independently functional — save, editability enforcement, and failure handling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final end-to-end validation across all stories

- [ ] T012 Run all five scenarios in [quickstart.md](./quickstart.md) against a live/mocked Salesforce org: a Draft/Approved/Awarded line (Scenarios 1-3), a non-editable line (Scenario 4), and a forced failure (Scenario 5); confirm every expected outcome matches.
  - **Status**: Not completed. `npx tsc --noEmit` passes with zero errors across the whole project (strong static check on the new/changed code in T001-T011). A live `npm run dev` smoke test was attempted but the dev server hung compiling `/api/purchase-orders` on first request (near-0% CPU for 6+ minutes after a `rm -rf .next` cold-cache start) in this sandboxed environment — aborted rather than left indefinitely. This looks like an environment/sandbox resource constraint, not a symptom traced to the code change, but it was not confirmed either way. **Action needed**: re-run `npm run dev` and the quickstart.md scenarios in a normal (non-sandboxed) environment before merging.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — no tasks.
- **Foundational (Phase 2)**: T001 → T002 → T003, strictly sequential (same files, each building on the last) — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. T004 → T005 → T006 → T007, sequential (all in the same file, each building on the prior task's state/handler).
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T009 extends the same `PATCH` handler) and on Phase 3 (T008 verifies placement of the save control T006 introduced). Not parallel with US1, but independently testable once both are done.
- **User Story 3 (Phase 5)**: Depends on Phase 3 (T010 wraps the `handleSaveLine` function T005 introduced).
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: The MVP — depends only on Phase 2 (the write endpoint).
- **User Story 2 (P1)**: Its client-side half (T008) depends on US1's save control existing; its server-side half (T009) only depends on Phase 2. Delivers no value without US1 already in place (there is nothing to gate without a save control), but the server-side guard (T009) can be implemented and tested against the raw API independently of the UI.
- **User Story 3 (P2)**: Depends on US1's `handleSaveLine` (T005) existing to wrap with error handling.

### Parallel Opportunities

This feature is small and almost entirely sequential within three shared files — most tasks touch the same function or the same JSX block as the task before it, so few tasks are marked `[P]`. The one genuine opportunity:

- T009 [US2]'s server-side guard (in `app/api/purchase-orders/route.ts`) can be implemented in parallel with T004-T007 [US1]'s client-side work (in `app/purchase-orders/[id]/lines/[lineid]/page.tsx`), since they touch different files and T009 only depends on Phase 2, not on US1's client changes.

---

## Parallel Example: Foundational → US1/US2 split

```bash
# After Phase 2 (T001-T003) completes:
Task: "T009 [US2] Add server-side status guard to PATCH handler in app/api/purchase-orders/route.ts"
Task: "T004 [US1] Capture saved-value baseline in app/purchase-orders/[id]/lines/[lineid]/page.tsx"
# T009 and T004 touch different files and have no dependency on each other.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003) — the write endpoint.
2. Complete Phase 3: User Story 1 (T004-T007) — save, reflect, and persist.
3. **STOP and VALIDATE**: Run quickstart.md Scenarios 1-3 against a Draft/Approved/Awarded line.
4. Ship if ready — this alone delivers the entire user-visible value of the feature.

### Incremental Delivery

1. Foundational (T001-T003) → write endpoint ready.
2. User Story 1 (T004-T007) → core save flow → validate → this is the MVP.
3. User Story 2 (T008-T009) → close the non-editable-line gap on both the UI and the API → validate with quickstart Scenario 4.
4. User Story 3 (T010-T011) → failure handling → validate with quickstart Scenario 5.
5. Polish (T012) → full quickstart pass.

---

## Notes

- No `[P]` markers appear within Phase 2 or within any single user story's task list — every task in this feature modifies a function or JSX block introduced by the immediately preceding task in the same file, so sequencing (not parallelism) is the norm here. The one cross-phase parallel opportunity is called out above.
- No test tasks are included — the feature specification did not request them; `T012` (quickstart) is the validation mechanism.
- Commit after each task or logical group (e.g., after each Foundational task, after each user story's task set).
