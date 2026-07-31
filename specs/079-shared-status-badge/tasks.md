---

description: "Task list for Shared Status Badge Component"
---

# Tasks: Shared Status Badge Component

**Input**: Design documents from `/specs/079-shared-status-badge/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not included — not requested in the feature specification; validated manually via `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router (this project): `app/` (page routes/components), `components/ui/` (shared UI primitives). This feature extends one existing file (`components/ui/StatusBadge.tsx`) and edits 34 existing consumer files across `app/admin`, `app/invoices`, `app/orders`, `app/proposals`, `app/purchase-orders`, `app/quotes`, `app/shipments`, `app/supplier-bills`.

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies needed.

- [X] T001 Start the local dev server (`npm run dev`) and confirm at least one list page for each of Orders, Proposals, Quotes, Purchase Orders, Supplier Bills, Invoices, Shipments, and Admin Locations loads without errors, to establish a working baseline before making changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared component so it supports every status and shape variant the 34 consumer files need. **No file in Phase 3 can be migrated until this phase is complete.**

- [X] T002 In `components/ui/StatusBadge.tsx`, add an optional `variant?: 'pill' | 'bordered' | 'compact'` prop to `StatusBadge` (default `'bordered'`, preserving current behavior exactly for the 10 existing consumers when the prop is omitted). Implement the outer `<span>` className per variant per `data-model.md`: `'pill'` → `inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`; `'bordered'` → the existing unchanged className; `'compact'` → `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStyles()}`.
- [X] T003 In `components/ui/StatusBadge.tsx`, add the 32 net-new lowercase `case` entries to `getStyles()`'s switch statement, matching the merged table in `data-model.md` exactly (do not modify any of the 21 existing cases — none of the approved conflict resolutions require changing them, since the existing component's current values for `partial` (yellow) and `inactive` (red) already match the resolved answer; the conflicts only existed in the 34 *consumer* files being replaced). New cases: `accepted`, `allocated`, `applied`, `canceled`, `converted`, `delivered`, `exception`, `expired`, `in progress`, `in transit`, `inprogress`, `lead`, `negotiation`, `open`, `out for delivery`, `overdue`, `packed`, `partial rejected`, `partial shipment`, `pending review`, `picked`, `posted`, `proposal sent`, `quote ready`, `quote requested`, `rejected`, `sent`, `settled`, `shipped`, `submitted`, `under review`, `viewed` (blue: accepted, allocated, converted, in transit, inprogress, open, out for delivery, submitted; green: applied, delivered, lead, posted, shipped; red: canceled, exception, overdue, partial rejected, rejected; orange: expired; yellow: in progress, packed, partial shipment, pending review, picked; purple: sent, under review; indigo: negotiation, viewed; emerald: quote ready, settled; amber: quote requested; sky: proposal sent).
- [X] T004 Run `npx tsc --noEmit` on `components/ui/StatusBadge.tsx` in isolation (or the whole repo) to confirm the extended file compiles cleanly before any consumer migration begins (depends on T002, T003).

**Checkpoint**: The shared component now recognizes all 53 statuses across 3 shape variants. Consumer migration (Phase 3) can now begin, in any order or in parallel.

---

## Phase 3: User Story 1 - One consistent status badge across the app (Priority: P1) 🎯 MVP

**Goal**: Every one of the 34 files that currently defines its own local `StatusBadge` function instead imports and uses the shared one from `components/ui/StatusBadge.tsx`, with each page's existing badge shape and fallback behavior preserved exactly.

**Independent Test**: Pick 5 pages spanning different areas (e.g., Orders list, a Quote sub-tab, Purchase Orders list, Supplier Bills list, Shipments list); confirm each renders its status badges via the shared component with unchanged shape and (for non-conflicting statuses) unchanged color.

**Note on `variant`**: omit the `variant` prop entirely for files marked "(bordered, matches default)" below — they need no code change to their shape. All other migrations below follow the same pattern: remove the local `function StatusBadge` (and its `getStyles`/`colorMap` helper if separately named), add `import { StatusBadge } from "@/components/ui/StatusBadge";` (or the correct relative/`@/` path), and update each JSX call site to include `variant="pill"` or `variant="compact"` where noted.

### Admin Locations

- [X] T005 [P] [US1] Migrate `app/admin/authorize-locations/page.tsx`: remove the local `function StatusBadge` (and its `LocationStatus` type usage stays on the caller side, just for typing the variable passed in), import the shared component, add `variant="pill"` at its call site(s).
- [X] T006 [P] [US1] Migrate `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`: remove the local `function StatusBadge({ active }: { active: boolean })`, import the shared component, and at each call site replace `<StatusBadge active={...} />` with `<StatusBadge status={active ? "Active" : "Inactive"} variant="pill" />`.

### Invoices

- [X] T007 [P] [US1] Migrate `app/invoices/page.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T008 [P] [US1] Migrate `app/invoices/[id]/components/InvoiceHeader.tsx`: remove the local `function StatusBadge` and the local `export function getStatusStyles` helper it calls (first confirm via `grep -rn "getStatusStyles" app/` that nothing outside this file imports it — it should not, since it isn't currently exported from anywhere else), import the shared component, add `variant="pill"` at its call site(s).
- [X] T009 [P] [US1] Migrate `app/invoices/[id]/lines/[lineid]/page.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).

### Orders

- [X] T010 [P] [US1] Migrate `app/orders/page.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T011 [P] [US1] Migrate `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.

### Proposals

- [X] T012 [P] [US1] Migrate `app/proposals/page.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T013 [P] [US1] Migrate `app/proposals/[id]/lines/[lineid]/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.
- [X] T014 [P] [US1] Migrate `app/proposals/[id]/components/FulfillmentsTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T015 [P] [US1] Migrate `app/proposals/[id]/components/OrdersTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T016 [P] [US1] Migrate `app/proposals/[id]/components/ProductsTab.tsx`: remove the local `function StatusBadge` and its `colorMap` object entirely; import the shared component; keep the existing `if (!status) return <span className="text-gray-400">-</span>;` early-return guard in the call site's rendering logic exactly as-is, and for the non-empty case render `<StatusBadge status={status} variant="compact" />`.
- [X] T017 [P] [US1] Migrate `app/proposals/[id]/components/PurchasesTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T018 [P] [US1] Migrate `app/proposals/[id]/components/ReturnsTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).

### Purchase Orders

- [X] T019 [P] [US1] Migrate `app/purchase-orders/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.
- [X] T020 [P] [US1] Migrate `app/purchase-orders/[id]/lines/[lineid]/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.

### Quotes

- [X] T021 [P] [US1] Migrate `app/quotes/page.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T022 [P] [US1] Migrate `app/quotes/[id]/lines/[lineid]/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.
- [X] T023 [P] [US1] Migrate `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T024 [P] [US1] Migrate `app/quotes/[id]/components/QuoteDebitMemoSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T025 [P] [US1] Migrate `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T026 [P] [US1] Migrate `app/quotes/[id]/components/QuoteLinesTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T027 [P] [US1] Migrate `app/quotes/[id]/components/QuotePurchasesSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T028 [P] [US1] Migrate `app/quotes/[id]/components/QuoteRMASubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T029 [P] [US1] Migrate `app/quotes/[id]/components/QuoteRTVSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T030 [P] [US1] Migrate `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T031 [P] [US1] Migrate `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).
- [X] T032 [P] [US1] Migrate `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s).

### Shipments

- [X] T033 [P] [US1] Migrate `app/shipments/page.tsx`: remove the local `function StatusBadge`, import the shared component, and at each call site replace the existing `status || "N/A"` fallback pattern by passing `status={status || "N/A"}` and `variant="pill"` into the shared component.
- [X] T034 [P] [US1] Migrate `app/shipments/[id]/components/ShipmentLinesTab.tsx`: remove the local `function StatusBadge`, import the shared component, add `variant="pill"` at its call site(s). (Found during implementation: this file also had its own `status || "N/A"` fallback, not originally documented — applied the same `status={status || "N/A"}` pattern as T033.)

### Supplier Bills

- [X] T035 [P] [US1] Migrate `app/supplier-bills/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.
- [X] T036 [P] [US1] Delete `app/supplier-bills/[id]/components/Badges.tsx` entirely: its `StatusBadge` and `RemittanceBadge` exports are both confirmed unused externally (every current importer of either already points at `@/components/ui/StatusBadge`) — this file's only content is these two dead exports.
- [X] T037 [P] [US1] Migrate `app/supplier-bills/[id]/lines/[lineid]/page.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.
- [X] T038 [P] [US1] Migrate `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`: remove the local `function StatusBadge` (bordered, matches default — no `variant` prop needed), import the shared component.

**Checkpoint**: All 34 files now use the shared component. `grep -rl "function StatusBadge" app/` should return zero results.

---

## Phase 4: User Story 2 - Fixing a status update in one place fixes it everywhere (Priority: P2)

**Goal**: Confirm the consolidation actually achieved its maintainability purpose — zero independent copies remain, and a single edit to the shared component is all that's needed to affect every page.

**Independent Test**: Make one change to `components/ui/StatusBadge.tsx` and confirm it takes effect on multiple, previously-unrelated pages without touching them.

### Implementation for User Story 2

- [X] T039 [US2] Run `grep -rl "function StatusBadge" app/` from the repo root and confirm it returns zero results (depends on T005–T038 all being complete).
- [X] T040 [US2] Temporarily add one new test-only status case to `components/ui/StatusBadge.tsx` (e.g. a made-up value), confirm it renders correctly wherever you pass it on 2–3 different already-migrated pages without any change to those pages, then remove the test-only case again (depends on T039).

**Checkpoint**: Both user stories 1 and 2 are independently satisfied.

---

## Phase 5: User Story 3 - No visual regressions during the switch (Priority: P3)

**Goal**: Confirm every non-conflicting status kept its exact color, every one of the 10 documented conflict resolutions appears exactly where `data-model.md` says and nowhere else, and every badge shape (pill/bordered/compact) is visually unchanged from before this migration.

**Independent Test**: Run `quickstart.md` Scenarios 1–4 end to end.

### Implementation for User Story 3

- [X] T041 [US3] Run `quickstart.md` Scenario 1: verify 3–4 non-conflicting statuses (e.g. "Pending", "Approved" on a non-Invoice page) render in their unchanged color on the pages that show them (depends on Phase 3 complete).
- [X] T042 [US3] Run `quickstart.md` Scenario 2: for each of the 10 rows in `data-model.md`'s "Conflicts resolved" table, visit every page listed as changing and confirm the new color appears, then visit at least one page for that same status that was NOT listed and confirm its color is unchanged (depends on Phase 3 complete).
- [X] T043 [US3] Run `quickstart.md` Scenario 3: visit one `'pill'` page (e.g. Orders list), one `'bordered'` page (e.g. Supplier Bills list), and the one `'compact'` page (Proposal Products tab) and confirm each retains its pre-migration shape (depends on Phase 3 complete).
- [X] T044 [US3] Run `quickstart.md` Scenario 4: verify the Admin Locations delivery-windows boolean-to-string adaptation (T006), the Proposal Products empty-status dash fallback (T016), and the Shipments "N/A" fallback (T033) all still behave exactly as before (depends on T006, T016, T033).

**Checkpoint**: All three user stories are independently verified. The feature is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final sign-off across the whole change.

- [X] T045 [P] Run `npx tsc --noEmit` across the whole repo and confirm no new errors (ignore pre-existing stale `.next/types` cache errors unrelated to this change).
- [X] T046 [P] Toggle light/dark mode on one `'pill'`, one `'bordered'`, and the one `'compact'` example page and confirm all remain legible in both themes.
- [X] T047 Final sign-off against `spec.md`: confirm SC-001 (100% of pages use the shared component — zero local implementations), SC-002 (100% of statuses still display correctly), SC-003 (0% unintended color changes on non-conflicting statuses), and SC-004 (every color change traces back to the documented table) are all satisfied.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. **Blocks all of Phase 3** — no consumer file can be migrated until the shared component supports the statuses/variants it needs.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. The 34 individual file migrations have no dependencies on each other — fully parallelizable.
- **User Story 2 (Phase 4)**: Depends on Phase 3 being fully complete (T039 specifically needs all 34 files migrated to return zero grep matches).
- **User Story 3 (Phase 5)**: Depends on Phase 3 being fully complete (needs the actual migrated pages to visually inspect).
- **Polish (Phase 6)**: Depends on Phases 3–5 all complete.

### Within Phase 2

- T002 and T003 both edit `components/ui/StatusBadge.tsx` — do sequentially (not marked `[P]`), in either order, but both before T004.

### Within Phase 3

- All 34 tasks (T005–T038) touch different files and are fully parallelizable — no ordering constraints among them.

### Within Phase 4

- T039 before T040 (must confirm zero duplicates before demonstrating the "one edit fixes everywhere" property).

### Within Phase 5

- T041–T044 have no ordering constraints among each other, but all depend on Phase 3 being complete first.

### Parallel Opportunities

- All 34 tasks in Phase 3 can run in parallel (different files, e.g. split across multiple people or done in one large batch).
- T045 and T046 in Polish can run in parallel.

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# All 34 migrations can proceed simultaneously — no shared files, all depend only on Phase 2:
Task: "Migrate app/orders/page.tsx (T010)"
Task: "Migrate app/quotes/[id]/components/QuoteRMASubTab.tsx (T028)"
Task: "Migrate app/supplier-bills/[id]/components/Badges.tsx — delete entirely (T036)"
# ...and so on for all remaining files
```

---

## Implementation Strategy

### MVP First (Foundational + User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (extend the shared component) — this is the critical path everything else depends on.
3. Complete Phase 3: migrate all 34 files.
4. **STOP and VALIDATE**: spot-check a handful of pages per `quickstart.md` Scenario 1/3 independently.
5. This alone (Phases 1–3) already delivers the core ask ("gather all status in one function") and is a deployable increment.

### Incremental Delivery

1. Setup + Foundational → shared component ready.
2. Migrate all 34 files (US1) → the consolidation is functionally complete.
3. Verify maintainability (US2) and absence of regressions (US3) → confidence before considering this fully done.
4. Polish.

### Parallel Team Strategy

With multiple developers:

1. One person completes Phase 2 (Foundational) first — this blocks everyone else.
2. Once Phase 2 is done, split the 34 Phase 3 files across as many people as available (e.g. one person per business area: Admin/Invoices, Orders/Proposals, Purchase Orders/Quotes, Shipments/Supplier Bills).
3. Regroup for Phases 4–6 once all 34 are done.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Phase 2 is genuinely blocking (unlike the two prior, smaller `07x` features in this codebase) — do not start any Phase 3 file migration before T002/T003/T004 are done and compiling cleanly.
- Every one of the 10 documented color changes in `data-model.md` is an intentional, approved outcome of this refactor, not a bug to "fix" during migration — do not deviate from the merged table to preserve a file's old, now-superseded color.
- Commit after each task or logical group (e.g., after Phase 2, then after each business-area cluster in Phase 3).
- Stop at any checkpoint to validate independently.
