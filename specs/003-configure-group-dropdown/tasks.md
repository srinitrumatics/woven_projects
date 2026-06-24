# Tasks: Configure Order — Group Dropdown from Product Grouping

**Input**: Design documents from `specs/003-configure-group-dropdown/`

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

**Purpose**: No project initialization required — all infrastructure (catalog fetch, `addGroup` function, `useMemo` imports) is already present in `app/configure/page.tsx`.

*(No tasks — proceed directly to user story phases.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — catalog state and `addGroup(name, color)` function are already defined. The `useMemo` hook is already imported.

*(No tasks — proceed directly to user story phases.)*

---

## Phase 3: User Story 1 — Add Group from Product Grouping List (Priority: P1) 🎯 MVP

**Goal**: Replace the hardcoded preset list in the "+ Add Group" dropdown with a dynamic, deduplicated, alphabetically sorted list of `groupingLabel` values from the loaded product catalog.

**Independent Test**: Navigate to `/configure`, wait for catalog to load, click "+ Add Group" — the dropdown shows only catalog-derived grouping labels (no AV Components / Networking / Cables & Wiring presets). Clicking a label adds a group row and closes the dropdown.

### Implementation for User Story 1

- [x] T001 [US1] Add `grpLabels` useMemo derived from catalog in `app/configure/page.tsx` — after the existing `fams` useMemo (~line 415), add: `const grpLabels = useMemo(() => [...new Set(catalog.map(p => p.groupingLabel).filter(Boolean))].sort(), [catalog]);`
- [x] T002 [US1] Remove hardcoded preset section from the `grpDDOpen` dropdown in `app/configure/page.tsx` — delete the "Presets" header `<div>` and the three preset items (AV Components, Networking, Cables & Wiring) from the dropdown block (~lines 526–529)
- [x] T003 [US1] Replace removed preset block with a dynamic `grpLabels` list in `app/configure/page.tsx` — render a mapped list of `grpLabels` items that call `addGroup(label, 'bg-gray-500')` on click, styled consistently with the removed preset items; confirm dropdown closes on click (FR-007: `addGroup` sets `grpDDOpen` to `false`)
- [x] T004 [US1] Add empty-state guard for the grouping list section in `app/configure/page.tsx` — when `grpLabels.length === 0`, omit the list section entirely so only the custom input section shows

**Checkpoint**: User Story 1 fully functional — catalog-derived groups appear in dropdown, clicking adds a group row, empty catalog shows no list items.

---

## Phase 4: User Story 2 — Add Group with Custom Name (Priority: P2)

**Goal**: Confirm the custom group name text input continues to work correctly after the Phase 3 changes to the dropdown content.

**Independent Test**: Open the "+ Add Group" dropdown, type a name in the custom input, press Enter or click "Add" — a group row with that name is appended to the line table and the dropdown closes.

### Implementation for User Story 2

- [x] T005 [US2] Verify and preserve custom group input section in `app/configure/page.tsx` — confirm the "Custom" section header, text input bound to `customGrpName`, and "Add" button (both Enter key and click paths) are intact and below any catalog-derived list items after T002–T004 changes

**Checkpoint**: Both catalog-derived groups and custom groups can be added independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge-case hardening and validation.

- [x] T006 Validate all 5 scenarios from `specs/003-configure-group-dropdown/quickstart.md` in a running dev server (`npm run dev`)
- [x] T007 [P] Verify dark mode rendering of the updated dropdown in `app/configure/page.tsx` — confirm grouped label items use correct `dark:` Tailwind classes matching the rest of the dropdown

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: Skipped — no setup or foundational work needed
- **Phase 3 (US1)**: Can start immediately
  - T001 must complete before T003 (grpLabels must exist before rendering it)
  - T002 and T001 can proceed in parallel (different edit regions in the same file)
  - T004 depends on T003 (adds guard around the list added in T003)
- **Phase 4 (US2)**: Can start after T002 completes (verifying the section still exists after preset removal)
- **Phase 5 (Polish)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — start immediately
- **User Story 2 (P2)**: Logically depends on US1 changes being applied (same file), but is a verification task only

### Within Each User Story

- T001 → T003 (grpLabels must exist before rendering)
- T002 and T001 can be authored in one edit pass since they touch the same dropdown block
- T004 wraps the output of T003

### Parallel Opportunities

- T002 and T001 can be written together in a single file edit (both affect `app/configure/page.tsx` — schedule as one atomic change)
- T005 (US2 verification) and T006 (quickstart) can run in parallel once Phase 3 is complete
- T007 can run alongside T006

---

## Parallel Example: User Story 1

```text
# T001 and T002 affect the same file but non-overlapping regions — write together:
Task: "Add grpLabels useMemo in app/configure/page.tsx"
Task: "Remove hardcoded preset block from dropdown in app/configure/page.tsx"

# T003 and T004 follow sequentially once the above are done:
Task: "Add dynamic grpLabels list JSX in app/configure/page.tsx"
Task: "Add empty-state guard around list section in app/configure/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ~~Phase 1: Setup~~ — skipped
2. ~~Phase 2: Foundational~~ — skipped
3. Complete Phase 3: User Story 1 (T001 → T002 → T003 → T004)
4. **STOP and VALIDATE**: Run quickstart.md Scenarios 1–4
5. Ship — catalog-derived groups work end to end

### Incremental Delivery

1. T001–T004 → US1 complete → test independently → deploy
2. T005 → US2 verified → deploy (preserves existing custom input behaviour)
3. T006–T007 → polish and dark mode check → deploy

### Single Developer Strategy

All tasks touch one file. Recommended order:

1. T001 + T002 (one edit pass: add `grpLabels` useMemo and remove hardcoded presets)
2. T003 (render dynamic list)
3. T004 (empty-state guard)
4. T005 (verify custom input still works)
5. T006 (run quickstart validation)
6. T007 (dark mode check)

---

## Notes

- [P] tasks = different concern areas; can be completed in one edit pass
- All tasks touch `app/configure/page.tsx` only — no other files affected
- Custom group input (`customGrpName` state, Enter key handler, "Add" button) must remain untouched through T002
- Empty catalog edge case: `grpLabels` will be `[]` before catalog loads — T004 guards against rendering an empty list section
- Verify no hardcoded color per label is needed; `'bg-gray-500'` matches existing custom group path (confirmed in research.md D-004)
