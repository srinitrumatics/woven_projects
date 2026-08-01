---

description: "Task list for Status Badge Compliance Audit"
---

# Tasks: Status Badge Compliance Audit

**Input**: Design documents from `/specs/080-status-badge-audit/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — this repo has no automated UI test suite (per `plan.md` Technical Context); validation is manual/visual per `quickstart.md`, consistent with `077`/`078`/`079`.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task

## Path Conventions

Next.js App Router (this project): `app/` (page routes), `components/` (React components) — per `plan.md`'s Project Structure.

---

## Phase 1: Setup

**Purpose**: Confirm a clean baseline before any change.

- [ ] T001 Confirm `npx tsc --noEmit` is clean and `npm run dev` runs before making any change (baseline for comparison per `quickstart.md` Scenario 1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared component must recognize every status the migrated files will pass it, and must already reflect the precedent-wins colors, before any file is migrated onto it.

**⚠️ CRITICAL**: No User Story 2 migration task can begin until this phase is complete — every migrated file's badge would otherwise fall through to the gray default for `pending shipment`, `new`, or `on hold`.

- [x] T002 Added 3 net-new status cases to `components/ui/StatusBadge.tsx`: `"pending shipment"` → yellow group (with `pending`), `"new"` → blue group (with `draft`/`open`), `"on hold"` → orange group (with `conditional`/`expired`). `npx tsc --noEmit` clean. **Also caught and fixed a doc error while re-reading the live file**: `submitted` is actually already yellow in the shared component (not blue as `079`'s own docs claimed) — corrected `research.md`, `data-model.md`, and `tasks.md` T023 to drop the false "submitted" conflict (see `data-model.md` for the correction note)

**Checkpoint**: Foundation ready — User Story 2 migration tasks can now proceed in parallel.

---

## Phase 3: User Story 1 - Full compliance inventory (Priority: P1)

**Goal**: A definitive, closed inventory of every tab/table's status-rendering compliance — no file left unclassified.

**Independent Test**: Deliverable is written classification (compliant / needs-migration / intentional exception), not a code change — can be verified by reading `research.md`/`data-model.md` alone, independent of whether any migration has happened yet.

- [x] T003 [P] [US1] Spot-check `app/invoices/page.tsx`: confirmed unrelated — both `status ===` matches are stat-card summary-count filters ("Overdue", "Paid"/"Settled"), not badge rendering
- [x] T004 [P] [US1] Spot-check `app/orders/page.tsx`: confirmed unrelated — all matches are stat-card summary-count filters plus one action-visibility gate (`order.status === "Draft" &&`), not badge rendering
- [x] T005 [P] [US1] Spot-check `app/purchase-orders/[id]/lines/[lineid]/page.tsx`: confirmed unrelated — the one match (`isLineEditable`) gates the Edit button, not a badge
- [x] T006 [US1] Updated `data-model.md`'s spot-check section with the confirmed outcome of T003–T005 — all three are false positives, none added to the migration list

**Checkpoint**: Every tab/table in the app is now classified — compliant, needs-migration, dead-code, or intentional exception. Nothing left unknown.

---

## Phase 4: User Story 2 - Migrate confirmed duplicates (Priority: P2)

**Goal**: Every confirmed-duplicate file imports and renders the shared `StatusBadge` (or `RemittanceBadge`) instead of its own local logic, preserving badge shape and every non-conflicting status's exact color.

**Independent Test**: Each file below can be migrated and typechecked independently; visually verify the page still shows the same badge shape/position, with the same (or explicitly-resolved-in-Phase-5) colors, per `quickstart.md` Scenarios 1, 3, 5, 6.

- [x] T007 [P] [US2] Migrated `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`: removed local `const StatusBadge`, imported shared `StatusBadge` with `variant="bordered"` — zero color conflicts
- [x] T008 [P] [US2] Migrated `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`: same pattern, `variant="bordered"`
- [x] T009 [P] [US2] Migrated `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`: same pattern, `variant="bordered"`
- [x] T010 [P] [US2] Migrated `app/orders/[id]/components/FulfillmentTab.tsx`: removed local `const statusBadge`, imported shared `StatusBadge` with `variant="compact"`, updated all 7 call sites (Proposals/Quotes/Sales Orders/Shipping Manifests/Invoices sub-tables plus 2 conditional tracking/collection-status calls)
- [x] T011 [P] [US2] Migrated `app/orders/[id]/components/ReturnsTab.tsx`: removed local `const statusBadge`, imported shared `StatusBadge` with `variant="compact"`, updated all 4 call sites (RMA/Credit Memo/Debit Memo/RTV sub-tables)
- [x] T012 [P] [US2] Migrated `app/proposals/[id]/components/ProposalHeader.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="pill"`
- [x] T013 [P] [US2] Migrated `app/purchase-orders/[id]/components/POHeader.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="bordered"`
- [x] T014 [P] [US2] Migrated `app/quotes/[id]/components/QuoteHeader.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="pill"`
- [x] T015 [P] [US2] Migrated `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`: removed all 5 duplicated inline-ternary blocks (RMA, RTV, Credit Memo, Debit Memo, generic item sub-tables), imported shared `StatusBadge` with `variant="compact"` at each of the 5 call sites
- [x] T016 [P] [US2] Migrated `app/proposals/[id]/components/ProjectsTab.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="bordered"`
- [x] T017 [P] [US2] Migrated `app/invoices/[id]/components/InvoiceCredits.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="compact"`
- [x] T018 [P] [US2] Migrated `app/invoices/[id]/components/InvoiceLineItems.tsx`: removed inline ternary, imported shared `StatusBadge` with `variant="compact"`
- [x] T019 [P] [US2] Migrated `app/shipments/[id]/components/ShipmentHeader.tsx`: removed local `function getStatusColor`, imported shared `StatusBadge` with `variant="pill"`
- [x] T020 [P] [US2] Migrated `app/supplier-bills/page.tsx`: removed local `function RemittanceBadge`, imported shared `RemittanceBadge` from `components/ui/StatusBadge` instead — zero color/vocabulary change
- [x] T021 [P] [US2] Deleted the dead `getStatusColor` function in `app/proposals/[id]/components/ProposalDetails.tsx` — confirmed zero callers; no visual change

**Checkpoint reached**: All 14 files now import the shared component; the 1 dead-code file is cleaned up. `grep -rl "function StatusBadge\|const StatusBadge\|const statusBadge\|function RemittanceBadge\|getStatusColor"` across these 15 files returns nothing (verified per `quickstart.md` Scenario 7), and `npx tsc --noEmit` is clean.

---

## Phase 5: User Story 3 - Resolve newly discovered color conflicts (Priority: P3)

**Goal**: Confirm every documented color change lands exactly where expected and nowhere else, with the resolution rationale traceable.

**Independent Test**: Each conflict's before/after can be visually reviewed independently of the rest of the migration, per `quickstart.md` Scenario 2.

- [x] T022 [US3] Statically verified `app/orders/[id]/components/FulfillmentTab.tsx`'s 5 recolored statuses: confirmed `components/ui/StatusBadge.tsx`'s switch places `shipped`→green (line 21), `in progress`→yellow (line 27), `allocated`/`open`/`draft`→blue (lines 38/42/35), and confirmed all 7 call sites pass the exact original field (`prop/cq/so/sm/inv.Status__c`, `sm.Tracking_Status__c`, `inv.Collection_Status__c`) through unaltered — no typos, no logic left behind
- [x] T023 [US3] Statically verified `app/orders/[id]/components/ReturnsTab.tsx`'s 1 recolored status (`draft`→blue); confirmed `submitted` needed no change (shared component has it at yellow, line 32, matching what `ReturnsTab.tsx` already did) — corrected in Phase 2, holds true in the final code
- [x] T024 [US3] Statically verified `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`'s `draft`→blue recoloring is wired identically across all 5 sub-tables (`rma`/`rtv`/`credit`/`debit`/`item`.status, all passed unaltered)
- [x] T025 [US3] Statically verified `app/proposals/[id]/components/ProposalHeader.tsx` now delegates entirely to the shared component (no local fallback logic left) — `draft`→blue and every other status (`Under Review`, `Expired`, `Sent`, etc.) now resolve via the full shared vocabulary instead of the old 4-case-plus-blue-fallback logic
- [x] T026 [US3] Statically verified `app/purchase-orders/[id]/components/POHeader.tsx`'s `acknowledged`→green recoloring (shared component line 16, in the same case group as `approved`/`awarded`/`received`)
- [x] T027 [US3] Statically verified `app/quotes/[id]/components/QuoteHeader.tsx` now delegates entirely to the shared component — previously-uncovered statuses no longer fall through to the old blue default
- [x] T028 [US3] Statically verified `app/invoices/[id]/components/{InvoiceCredits,InvoiceLineItems}.tsx` now delegate entirely to the shared component — previously-uncovered statuses no longer fall through to the old blue default
- [x] T029 [US3] Cross-checked `components/ui/StatusBadge.tsx` case-by-case against `data-model.md`'s "Conflicts resolved" table: exactly the 6 documented statuses sit in a different group than each file's old local mapping; every other status any of the 14 migrated files used was already in the same group in both old and new logic — no undocumented color change found

**Note on verification method**: T022–T029 were verified by static code trace — reading the shared component's switch-case placement directly and confirming every migrated call site passes its original field through unaltered — rather than live browser rendering. Since the migration removed all local color logic, the rendered color is now a pure function of that switch statement, so this trace is a complete check of the *logic*. It does not substitute for **visual** confirmation against real Salesforce data (light/dark mode, actual record statuses in production data) — that's what the running dev server from the previous step is for; the user is checking that independently, per `quickstart.md`.

**Checkpoint**: All documented conflicts are confirmed resolved exactly as planned via code trace; any undocumented surprise would have been caught by the T029 cross-check. Live visual confirmation remains with the user's own manual pass in the browser.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and propagation, spanning all user stories above.

- [x] T030 Ran `npx tsc --noEmit` — clean (exit 0) across all 16 touched files
- [x] T031 [P] Confirmed via code inspection that every color branch in `components/ui/StatusBadge.tsx` has a matching `dark:` variant (16/16), and that `variant` only controls shape, not color, so dark-mode coverage is identical across `compact`/`pill`/`bordered`. Live visual toggle in the browser is the user's own check, per the note on T022-T029.
- [x] T032 Propagated all 16 files to all four sibling folders at user's explicit request. Confirmed byte-identical to `woven_projects-main` in all four post-copy. Typechecked each: `ClientPartnerPortal-main` clean (exit 0), `ClientPartnerPortal-dev` clean (exit 0), `ClientPartnerPortal-prod` shows only pre-existing stale `.next/types` errors referencing already-deleted RBAC routes (0 real errors — confirmed by filtering, matches this repo's documented "ignore stale `.next/types`" caveat), `woven_projects-claude` has no git/build tooling to typecheck against (plain file copy, as established). Not committed or pushed — awaiting separate explicit confirmation for that, per established practice (`-prod` is live production).
- [x] T033 Updated project memory (multi-repo line-status sync entry) with this feature's propagation status.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **BLOCKS** Phase 4 (T016 and T019 specifically need T002's new statuses; the rest of Phase 4 doesn't strictly need T002 but is grouped here for a single coherent checkpoint).
- **User Story 1 (Phase 3)**: Can run in parallel with Phase 2 — it's pure investigation, no code dependency. Its output (T006) only needs to land before Phase 6's final sign-off, not before Phase 4.
- **User Story 2 (Phase 4)**: Depends on Phase 2 (Foundational). All 15 tasks (T007–T021) touch different files — fully parallelizable.
- **User Story 3 (Phase 5)**: Depends on the specific Phase 4 task(s) each verification task references (see per-task "depends on" notes) — cannot verify a recolor before the file migrating it lands.
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5 all being complete.

### Parallel Opportunities

- T003–T005 (Phase 3) can all run in parallel — independent files, pure investigation.
- T007–T021 (Phase 4) can all run in parallel once T002 lands — 15 independent files, no shared state.
- T022–T028 (Phase 5) can run in parallel with each other once their respective Phase 4 dependency is done (they don't depend on each other).

---

## Parallel Example: User Story 2 (Phase 4)

```bash
# Launch all 14 file migrations + 1 deletion together once T002 (Foundational) is done:
Task: "Migrate app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx to shared StatusBadge (variant=bordered)"
Task: "Migrate app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx to shared StatusBadge (variant=bordered)"
Task: "Migrate app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx to shared StatusBadge (variant=bordered)"
Task: "Migrate app/orders/[id]/components/FulfillmentTab.tsx to shared StatusBadge (variant=compact)"
Task: "Migrate app/orders/[id]/components/ReturnsTab.tsx to shared StatusBadge (variant=compact)"
Task: "Migrate app/proposals/[id]/components/ProposalHeader.tsx to shared StatusBadge (variant=pill)"
Task: "Migrate app/purchase-orders/[id]/components/POHeader.tsx to shared StatusBadge (variant=bordered)"
Task: "Migrate app/quotes/[id]/components/QuoteHeader.tsx to shared StatusBadge (variant=pill)"
Task: "Migrate app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx to shared StatusBadge (variant=compact)"
Task: "Migrate app/proposals/[id]/components/ProjectsTab.tsx to shared StatusBadge (variant=bordered)"
Task: "Migrate app/invoices/[id]/components/InvoiceCredits.tsx to shared StatusBadge (variant=compact)"
Task: "Migrate app/invoices/[id]/components/InvoiceLineItems.tsx to shared StatusBadge (variant=compact)"
Task: "Migrate app/shipments/[id]/components/ShipmentHeader.tsx to shared StatusBadge (variant=pill)"
Task: "Migrate app/supplier-bills/page.tsx to import shared RemittanceBadge"
Task: "Delete dead getStatusColor in app/proposals/[id]/components/ProposalDetails.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 3: User Story 1 (spot-checks + finalized inventory) — this alone is a valuable, shippable deliverable (a closed audit), even before any migration code lands.
3. **STOP and VALIDATE**: confirm the inventory in `data-model.md` is complete and accurate.

### Incremental Delivery

1. Setup + Phase 3 (US1) → closed inventory, no code risk.
2. Foundational (Phase 2) → shared component ready.
3. Phase 4 (US2) → all 14 files migrated + 1 deleted → biggest visual-risk step, but every task is independent and revertible per-file.
4. Phase 5 (US3) → confirm every color change is exactly as documented, nothing more.
5. Phase 6 → typecheck, cross-theme check, sibling-repo propagation (only with explicit user go-ahead), memory update.

### Notes

- [P] tasks = different files, no dependencies.
- Commit after each task or logical group, per this repo's established practice of asking before committing anything (see project memory).
- Do not commit/push to the four sibling deployment folders without explicit user confirmation — `-prod` is a live production deployment.
