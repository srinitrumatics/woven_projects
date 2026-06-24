# Tasks: Configure Order — Add Group Dropdown Search & Scroll

**Input**: Design documents from `specs/007-group-dropdown-search-scroll/`

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

**Purpose**: No project initialization required — all infrastructure (useState, useMemo, useEffect, Tailwind CSS) is already in use in the file.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — the `grpLabels` state and picklist `useEffect` are already in place from features 005 and 006.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 3: User Story 1 — Search Filters the Product Groups List (Priority: P1) 🎯 MVP

**Goal**: Add a `grpSearch` state and `filteredGrpLabels` useMemo so typing in a new search input instantly filters the visible picklist group options.

**Independent Test**: Open the "+ Add Group" dropdown, type a partial group name — only matching items remain visible. Clear the text — all items reappear. Type a string that matches nothing — a "No results" message appears.

### Implementation for User Story 1

- [X] T001 [US1] Add `const [grpSearch, setGrpSearch] = useState<string>('')` to the state declarations block in `app/configure/page.tsx` — place it immediately after `const [grpLabels, setGrpLabels] = useState<string[]>([])` (line ~33)
- [X] T002 [US1] Add `const filteredGrpLabels = useMemo(() => grpLabels.filter(l => l.toLowerCase().includes(grpSearch.toLowerCase())), [grpLabels, grpSearch])` to the derived-state block in `app/configure/page.tsx` — place it immediately after the `fams` useMemo (line ~444)
- [X] T003 [US1] Add a `useEffect(() => { if (!grpDDOpen) setGrpSearch(''); }, [grpDDOpen])` to `app/configure/page.tsx` to reset the search input each time the dropdown closes — place it after the existing picklist `useEffect` (line ~106)
- [X] T004 [US1] In the `{grpDDOpen && (...)}` block in `app/configure/page.tsx`, inside the `{grpLabels.length > 0 && (<>...</>)}` fragment, add an `autoFocus` search `<input>` element immediately after the "Product Groups" header `<div>` (line ~557) and before the items list — style it consistently with the existing dropdown using Tailwind classes: `w-full px-3 py-1.5 text-xs border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none`; bind `value={grpSearch}` and `onChange={e => setGrpSearch(e.target.value)}`; set `placeholder="Search groups..."` and `autoFocus`
- [X] T005 [US1] In `app/configure/page.tsx`, replace the existing `{grpLabels.map(label => (<div key={label} ...>))}` items render (line ~558) with `{filteredGrpLabels.length > 0 ? filteredGrpLabels.map(label => (<div key={label} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => addGroup(label, 'bg-gray-500')}>{label}</div>)) : grpSearch ? (<div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">No results</div>) : null}` — keeping the same item click handler and Tailwind classes

**Checkpoint**: Dropdown has a search box that auto-focuses on open. Typing filters the list. Empty-match shows "No results". Clearing search shows all items.

---

## Phase 4: User Story 2 — Scrollable List When More Than 5 Items Are Present (Priority: P1)

**Goal**: Wrap the items render in a `max-h-[180px] overflow-y-auto` container so the dropdown does not grow beyond 5 visible items when many groups are loaded.

**Independent Test**: With 6+ groups loaded, open the dropdown — the "Product Groups" list is capped in height with a scroll bar; scrolling reveals remaining items. With 5 or fewer items visible, no scroll bar appears.

### Implementation for User Story 2

- [X] T006 [US2] In `app/configure/page.tsx`, wrap the items render from T005 (the `filteredGrpLabels.map(...)` / "No results" block) in a `<div className="max-h-[180px] overflow-y-auto">` container — ensuring this wrapper is placed **inside** the `{grpLabels.length > 0 && (...)}` fragment and **after** the search input from T004, and **before** the "Custom" section header

**Checkpoint**: With 6+ groups, dropdown shows ~5 items with a scroll bar. With ≤5 visible items (after filtering or with small picklist), no scroll bar appears. "Custom" section is below the scroll container and always visible.

---

## Phase 5: User Story 3 — Custom Group Name Input Remains Usable (Priority: P2)

**Goal**: Confirm that the "Custom" input section is outside the scrollable container and remains visible and functional after the search and scroll additions.

**Independent Test**: Open the dropdown with 6+ groups, scroll the list — the "Custom" header and input row stay fixed. Type in the custom input while the search box has text — the two inputs are independent.

### Implementation for User Story 3

- [X] T007 [US3] Verify in `app/configure/page.tsx` that the "Custom" header `<div>` (className containing `border-y`) and the custom input `<div className="p-2 flex gap-2">` row are positioned **outside and below** the `max-h-[180px] overflow-y-auto` wrapper from T006 — no code change expected; this is a read-only structural verification

**Checkpoint**: Custom input is always visible regardless of scroll position. Typing in search box does not route keystrokes to the custom input and vice versa.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup.

- [ ] T008 [P] Validate all 11 scenarios from `specs/007-group-dropdown-search-scroll/quickstart.md` — open `/configure` in browser, test search filtering, scroll at 6+ items, "No results" state, custom input, and search-reset-on-close
- [X] T009 [P] Run `npx tsc --noEmit --skipLibCheck` from repo root to confirm no TypeScript errors introduced by the new `grpSearch` state, `filteredGrpLabels` useMemo, and `useEffect` in `app/configure/page.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: Skipped
- **Phase 3 (US1)**: Start immediately
  - T001 must complete before T002 (state before derived state)
  - T002 must complete before T005 (filteredGrpLabels must exist before JSX uses it)
  - T003 can run after T001 (useEffect depends only on state, not derived state)
  - T004 must complete before T006 (search input must exist before being wrapped)
  - T005 must complete before T006 (items render must exist before being wrapped)
- **Phase 4 (US2)**: T006 depends on T004 + T005
- **Phase 5 (US3)**: T007 can run after T006 (structural verification)
- **Phase 6 (Polish)**: T008 + T009 after all implementation tasks

### Within User Story 1

T001 → T002 (sequential: state before derived state)
T001 → T003 (after state declared)
T001 → T004 → T005 → T006 (sequential: state, JSX input, JSX items, scroll wrapper)

### Parallel Opportunities

- T003 and T002 can run in parallel after T001 (T003 is a useEffect, T002 is useMemo — independent)
- T008 and T009 (polish) can run in parallel after all implementation tasks

---

## Parallel Example

```text
# Sequential core (same file, dependent changes):
T001 → T002 + T003 (parallel after T001)
          ↓
        T004 → T005 → T006 → T007 (verify)

# After T007:
T008 (browser validation)  ← can run in parallel →  T009 (tsc)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 together — they are tightly coupled)

1. T001 — add `grpSearch` state
2. T002 — add `filteredGrpLabels` useMemo
3. T003 — add reset useEffect
4. T004 — add search input to JSX
5. T005 — replace items map with `filteredGrpLabels` + "No results"
6. T006 — wrap items in scroll container
7. **STOP and VALIDATE**: Open `/configure`, test search and scroll
8. Ship

### Full Delivery

1. T001–T006 (US1 + US2 core)
2. T007 (US3 verify)
3. T008 + T009 (polish)

---

## Notes

- T001–T006 all touch `app/configure/page.tsx` — write as one atomic edit session
- The search input (T004) uses `autoFocus` — no `useRef` or `useEffect` needed for focus; the element mounts fresh each time the dropdown opens
- The `filteredGrpLabels` useMemo (T002) returns all items when `grpSearch` is `''`, so no special-case needed for the empty-search state
- The "No results" fallback in T005 renders only when `grpSearch` is non-empty AND `filteredGrpLabels.length === 0` — when `grpSearch` is `''` and `filteredGrpLabels` is empty (no groups loaded), the outer `grpLabels.length > 0` guard already hides the entire "Product Groups" section
- `max-h-[180px]` ≈ 5 × 36px items; adjust if runtime item height differs
- Dark-mode classes must match the existing dropdown: use `dark:bg-gray-800`, `dark:border-gray-700`, `dark:text-gray-300` / `dark:text-gray-500` family
