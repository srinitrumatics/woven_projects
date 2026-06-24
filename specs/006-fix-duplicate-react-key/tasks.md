# Tasks: Fix Duplicate React Key — [object Object]

**Input**: Design documents from `specs/006-fix-duplicate-react-key/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual validation only (see quickstart.md).

**Organization**: Tasks grouped by user story. Single-file change (`app/configure/page.tsx`); no setup or foundational phases needed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or no dependencies)
- **[Story]**: User story this task belongs to
- Exact file paths included in every description

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `app/api/` (API routes), `components/`, `lib/`, `db/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization required — single targeted fix to an existing client component.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — all infrastructure exists; the picklist `useEffect` was introduced in feature 005 and is already in place.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 3: User Story 1 — List Items Render Correctly Without Duplication or Omission (Priority: P1) 🎯 MVP

**Goal**: Eliminate the React `[object Object]` duplicate-key warning by normalizing Salesforce picklist items to plain strings before storing them in `grpLabels` state, so every rendered list item has a unique, readable key and label.

**Independent Test**: Open `/configure` in a browser with DevTools Console open, click "+ Add Group" — zero "Encountered two children with the same key" warnings appear, every item in the "Product Groups" list shows a human-readable label (not `[object Object]`), and each item is individually clickable.

### Implementation for User Story 1

- [X] T001 [US1] In `app/configure/page.tsx`, inside the picklist `useEffect` (added in feature 005, immediately after the `if (picklistData.Product_Grouping__c)` check), replace the direct `setGrpLabels(picklistData.Product_Grouping__c)` call with a normalized version that maps each raw item through `typeof item === 'object' && item !== null ? (item.value ?? item.label ?? String(item)) : String(item)` and filters out empty strings — following the identical pattern used in `app/admin/authorize-locations/components/LocationModal.tsx` lines 192–195

**Checkpoint**: DevTools Console shows no key warning. Dropdown "Product Groups" list renders each item exactly once with a readable label. Clicking any item adds a group row with that label.

---

## Phase 4: User Story 2 — No Regression in Other List Displays (Priority: P2)

**Goal**: Confirm that the normalization change does not affect adjacent `useMemo`-derived lists (`mfrs`, `fams`) or any other dropdown/filter on the configure page.

**Independent Test**: Navigate `/configure` — the manufacturer filter, family filter, and catalog list all display the same values as before the fix. No new console warnings appear for any list.

### Implementation for User Story 2

- [X] T002 [US2] Verify in `app/configure/page.tsx` that `mfrs` useMemo (derived from `catalog.map(p => p.mfr)`) and `fams` useMemo (derived from `catalog.map(p => p.family)`) are intact and unchanged after T001 — confirm neither line was accidentally removed or modified (read-only verification, no code change expected)

**Checkpoint**: Manufacturer and family filters work correctly. No regressions.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup.

- [ ] T003 [P] Validate all 6 scenarios from `specs/006-fix-duplicate-react-key/quickstart.md` — open `/configure` in browser with DevTools Console, confirm zero key warnings, confirm items render with readable labels, confirm clicking a picklist item and typing a custom name both add group rows correctly
- [X] T004 [P] Confirm the normalization pattern in `app/configure/page.tsx` matches the reference implementations in `app/admin/authorize-locations/components/LocationModal.tsx` (lines 192–195) and `app/admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx` (lines 250–253) — read-only cross-check, no code changes expected

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: Skipped
- **Phase 3 (US1)**: Start immediately — T001 is the only implementation task
- **Phase 4 (US2)**: Can run after T001 (verifies adjacent state is untouched)
- **Phase 5 (Polish)**: Runs after Phase 3 and Phase 4 complete

### Within User Story 1

- T001 is the single atomic change — self-contained

### Parallel Opportunities

- T002 (US2 verification) can start immediately after T001 completes
- T003 and T004 (polish) can run in parallel with each other after T001 + T002

---

## Parallel Example: User Story 1

```text
# T001 is the only implementation task (single file, single statement):
Task: "Normalize Product_Grouping__c items in useEffect in app/configure/page.tsx"

# After T001:
Task: "Verify mfrs/fams useMemos intact (T002)" — runs in parallel with T003, T004
Task: "Browser validation (T003)"
Task: "Cross-check normalization pattern (T004)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — normalize picklist items in the `useEffect`
2. **STOP and VALIDATE**: Open `/configure` in browser, confirm no console key warning, confirm readable labels in dropdown
3. Ship

### Full Delivery

1. T001 (US1 core fix)
2. T002 (US2 regression verify)
3. T003 + T004 (polish + cross-check)

---

## Notes

- T001 is the entire implementation — one `map()` call replacing a direct assignment inside an existing `useEffect`
- The reference pattern to copy: `LocationModal.tsx` lines 192–195 — `typeof x === 'object' ? x.value || x.label : x`, then `filter(Boolean)`
- The `grpDDOpen` JSX block is **unchanged** — `key={label}` and `{label}` are correct once `grpLabels` holds strings
- `mfrs` and `fams` useMemos are on the lines immediately above/below the changed code — T002 confirms they are untouched
- Empty result (picklist returns empty array or normalization filters all items) → existing `grpLabels.length > 0` JSX guard hides the list section — no additional guard needed
