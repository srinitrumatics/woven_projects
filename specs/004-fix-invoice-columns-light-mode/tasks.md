# Tasks: Fix Invoice List — Sales Order & Purchase Order Columns Invisible in Light Mode

**Input**: Design documents from `specs/004-fix-invoice-columns-light-mode/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual validation only (see quickstart.md).

**Organization**: Single user story, single file. No setup or foundational phases needed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or no dependencies)
- **[Story]**: User story this task belongs to
- Exact file paths included in every description

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `app/api/` (API routes), `components/`, `lib/`, `db/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization required — fix is a pure className edit in an existing file.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites.

*(No tasks — proceed directly to the user story phase.)*

---

## Phase 3: User Story 1 — Invoice List Readable in Light Mode (Priority: P1) 🎯 MVP

**Goal**: Add missing base text color classes so Sales Order and Purchase Order column values are visible in light mode, without regressing dark mode.

**Independent Test**: Open `/invoices` in a browser in light mode — Sales Order values and all Purchase Order text variants (link, plain text, "N/A") must be readable against the light background.

### Implementation for User Story 1

- [x] T001 [US1] Add `text-gray-900 dark:text-white` to the Sales Order cell inner div in `app/invoices/page.tsx` — change line 522 from `className="text-sm font-medium"` to `className="text-sm font-medium text-gray-900 dark:text-white"`
- [x] T002 [US1] Add `text-sm font-medium text-gray-900 dark:text-white` to the Purchase Order outer wrapper div in `app/invoices/page.tsx` — change line 525 from `<div>` to `<div className="text-sm font-medium text-gray-900 dark:text-white">` (covers the manufacturer span, bare-text fallback, and N/A paths; the existing link child retains its own `text-primary` class)

**Checkpoint**: Both columns show readable text in light mode. Link path unchanged. Dark mode unaffected.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validation and regression check.

- [x] T003 [P] Validate Scenarios 1–5 from `specs/004-fix-invoice-columns-light-mode/quickstart.md` — open `/invoices` in light mode and dark mode and confirm all column text variants are readable in both

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: Skipped — no setup or foundational work
- **Phase 3 (US1)**: Start immediately
  - T001 and T002 both edit `app/invoices/page.tsx` — write in one pass
- **Phase 4 (Polish)**: Depends on T001 and T002 completing

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — only story

### Within User Story 1

- T001 and T002 can be authored in a single file edit (different lines, no inter-dependency)
- T003 runs after T001 + T002 to confirm the fix in-browser

### Parallel Opportunities

- T001 and T002: same file but non-overlapping lines — write together in one edit pass
- T003: runs independently after implementation

---

## Parallel Example: User Story 1

```text
# T001 and T002 are in the same file — write as one atomic edit:
Task: "Fix Sales Order div className in app/invoices/page.tsx (line 522)"
Task: "Fix Purchase Order outer div className in app/invoices/page.tsx (line 525)"

# T003 follows once the file edit is done:
Task: "Validate all 5 quickstart scenarios in browser"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ~~Phase 1: Setup~~ — skipped
2. ~~Phase 2: Foundational~~ — skipped
3. Complete Phase 3: T001 + T002 (one edit pass)
4. **STOP and VALIDATE**: Run quickstart.md Scenarios 1–5 in browser
5. Ship

### Single Developer Strategy

1. T001 + T002 — one edit in `app/invoices/page.tsx`
2. T003 — open browser, verify light mode and dark mode

---

## Notes

- T001 and T002 are both in `app/invoices/page.tsx` — write as a single atomic edit
- The Purchase Order `<Link>` child (line 528) has its own `text-primary` class which takes precedence over the inherited outer div color — no change needed there
- `text-gray-900 dark:text-white` matches the same pair used by other primary data cells in the same table (e.g., invoice number column)
- Total edit: 2 lines changed, 0 new files
