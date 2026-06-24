# Tasks: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Input**: Design documents from `specs/005-configure-group-picklist-api/`

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

**Purpose**: No project initialization required — existing picklist endpoint, `useState`, `useEffect`, and fetch are all available.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — all infrastructure exists.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 3: User Story 1 — Add Group Dropdown Populated from Salesforce Picklist (Priority: P1) 🎯 MVP

**Goal**: Replace the catalog-derived `grpLabels` useMemo with a `useState` + `useEffect` that fetches `Product_Grouping__c` values from the existing Salesforce picklist API, so the "+ Add Group" dropdown shows canonical Salesforce-defined group options.

**Independent Test**: Open `/configure`, wait for page load, click "+ Add Group" — the "Product Groups" section shows values from `Product_Grouping__c` (verifiable via DevTools network tab showing a successful call to `/api/salesforce/picklists`). These values are independent of the catalog products loaded.

### Implementation for User Story 1

- [X] T001 [US1] Remove the `grpLabels` useMemo line from `app/configure/page.tsx` — delete the line `const grpLabels = useMemo(() => [...new Set(catalog.map(p => p.groupingLabel).filter(Boolean))].sort(), [catalog]);` (added in feature 003, ~line 416)
- [X] T002 [US1] Add `const [grpLabels, setGrpLabels] = useState<string[]>([])` to the state declarations block in `app/configure/page.tsx` — place it with the other `useState` declarations near the top of the component (after `const [grpDDOpen, setGrpDDOpen] = useState(false)`)
- [X] T003 [US1] Add a `useEffect` to `app/configure/page.tsx` that fetches `/api/salesforce/picklists?accountId=...&contactId=...` when `SF_ACCOUNT_ID` and `SF_CONTACT_ID` are available, extracts `result.data[0].Product_Grouping__c`, and calls `setGrpLabels` — follow the identical pattern used at lines 548–572 of `app/orders/[id]/page.tsx`

**Checkpoint**: Dropdown "Product Groups" list is populated from the picklist API. Network tab confirms `/api/salesforce/picklists` request. No catalog dependency.

---

## Phase 4: User Story 2 — Custom Group Name Input Preserved (Priority: P2)

**Goal**: Confirm the custom group name input continues to work correctly — no changes to JSX are needed since the dropdown template from feature 003 already handles this path.

**Independent Test**: Open "+ Add Group", type a custom name, press Enter or click "Add" — a group row with that name is added.

### Implementation for User Story 2

- [X] T004 [US2] Verify the custom group input section in `app/configure/page.tsx` is intact after T001–T003 — confirm the "Custom" header, `customGrpName` text input, and "Add" button are present in the `grpDDOpen` dropdown block (no JSX change expected; this is a verification step)

**Checkpoint**: Both picklist-derived and custom group names can be added independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup.

- [ ] T005 [P] Validate all 6 scenarios from `specs/005-configure-group-picklist-api/quickstart.md` — open `/configure` in browser, verify picklist fetch in DevTools Network, confirm group list populates and all add/custom paths work
- [X] T006 [P] Confirm `fams` useMemo and the `fFamily` catalog filter still work correctly in `app/configure/page.tsx` — ensure removing the `grpLabels` useMemo did not accidentally affect adjacent derived state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: Skipped
- **Phase 3 (US1)**: Start immediately
  - T001 must complete before T002 (remove old declaration before adding new one to avoid naming conflict)
  - T002 must complete before T003 (`grpLabels` state must exist before the `useEffect` sets it)
- **Phase 4 (US2)**: Can run after T001 (verifies the unchanged JSX block)
- **Phase 5 (Polish)**: Runs after Phase 3 and Phase 4 complete

### Within User Story 1

- T001 → T002 → T003 (sequential — each step depends on the previous)

### Parallel Opportunities

- T004 (US2 verification) can start as soon as T001 is done (removal confirms JSX is intact)
- T005 and T006 can run together after all implementation tasks complete

---

## Parallel Example: User Story 1

```text
# T001 → T002 → T003 must be sequential (same file, dependent changes):
Task: "Remove grpLabels useMemo in app/configure/page.tsx"
  → Task: "Add grpLabels useState in app/configure/page.tsx"
    → Task: "Add picklist useEffect in app/configure/page.tsx"

# After T001:
Task: "Verify custom input JSX still present (T004)" — can run in parallel with T002+T003
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — remove old useMemo
2. T002 — add new useState
3. T003 — add picklist useEffect
4. **STOP and VALIDATE**: Open `/configure` in browser, check DevTools network for picklist call, confirm dropdown group list
5. Ship

### Full Delivery

1. T001–T003 (US1 core)
2. T004 (US2 verify)
3. T005–T006 (polish + regression check)

---

## Notes

- T001–T003 all touch `app/configure/page.tsx` — write as one atomic edit session
- The `useEffect` pattern to copy: `app/orders/[id]/page.tsx` lines 548–572 — identical fetch, guard, and response extraction
- The `grpDDOpen` JSX block is **unchanged** from feature 003 — it already uses `grpLabels` state, so switching the source from useMemo to useState is transparent to the template
- `fams` useMemo (catalog filter) is on the line above the removed `grpLabels` useMemo — verify it is not accidentally deleted (T006)
- Empty `grpLabels` (picklist not loaded yet or empty) → existing `grpLabels.length > 0` guard in JSX hides the list section — no additional guard needed
