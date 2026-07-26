# Phase 0 Research: Consistent DataTable Corner & Border Styling

## Context

This feature has no `NEEDS CLARIFICATION` markers — it is a scoped, presentation-only follow-up
to `specs/067-datatable-header-border-consistency`, which already standardized the rounded-corner
/ borderless-outer-edge / row-bottom-border wrapper pattern across nearly all data tables. A prior
`/speckit-analyze` run against that feature identified two concrete, unclosed gaps. This research
independently re-verifies those gaps and confirms no additional outliers exist before planning the
fix.

## Audit: Confirming the full set of remaining outliers

A codebase-wide search was run across every file importing `components/ui/DataTable.tsx`
primitives (`Table`, `THead`, `TBody`, `TableEmptyState`, `TableLoadingState` — ~90+ usage sites),
plus the one known raw-markup consumer (`components/UserManagement/UserList.tsx`), checking for:
(a) any table wrapper `<div>` still carrying an outer `border` class alongside its `rounded-lg`/
`shadow` treatment, and (b) any table wrapper missing corner rounding entirely.

**Findings**:

- **Gap 1 confirmed, isolated**: `app/configure/ConfigureOrderClientPage.tsx:642` —
  `className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"`, wrapping a `<Table>` at line 749. This file was never touched by the 067 styling pass.
- **Gap 2 confirmed, isolated**: 6 empty-state wrapper `<div>`s across two files, each
  `className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"` wrapping a `<TableEmptyState>`:
  - `app/proposals/[id]/components/FulfillmentsTab.tsx` — lines 119, 266, 425, 585
  - `app/proposals/[id]/components/PurchasesTab.tsx` — lines 98, 261
  In both files, the *populated*-table wrapper (sibling branch of the same conditional) was already
  correctly fixed to drop the `border` class during 067 — only the empty-state branch was missed.
- **No other outliers found**: every other `<Table>`/`TableEmptyState`/`TableLoadingState`
  wrapper checked (including ambiguous-looking shared-wrapper-above-a-ternary cases in
  `app/orders/page.tsx`, `app/supplier-bills/page.tsx`, `ReturnsTab.tsx`,
  `LineReturnsTab.tsx`, `LinePurchasesTab.tsx`, `LineFulfillmentsTab.tsx`) already uses the
  standardized `rounded-lg`/`rounded-xl` + no-`border` wrapper.
- **`components/UserManagement/UserList.tsx`**: already compliant —
  `<div className="rounded-lg shadow-sm overflow-hidden">` (line 275) wrapping its raw `<table>`
  (line 277), no `border` class. No action needed.

## Decision 1: Scope of the fix

**Decision**: Fix only the 3 files / 7 total wrapper instances identified above (1 in
`ConfigureOrderClientPage.tsx`, 6 across `FulfillmentsTab.tsx`/`PurchasesTab.tsx`). Do not touch
`components/ui/DataTable.tsx` or any other consumer file.

**Rationale**: The shared primitive and the vast majority of consumers already conform to the
standard (verified above). Re-touching already-compliant files or the shared primitive would be
unnecessary churn with no functional benefit, and risks introducing a regression into working
code — contrary to Constitution Principle V (Simplicity).

**Alternatives considered**:
- *Re-run the full styling pass across all ~90 consumers again*: Rejected — redundant; the audit
  confirms they are already correct, and re-touching them adds review surface area for zero
  behavior change.
- *Add a lint rule / shared wrapper component to prevent future drift*: Considered out of scope —
  not requested by the spec, and would be a new abstraction beyond what FR-001–FR-009 require
  (the spec asks for the current state to be corrected, not for tooling to prevent future
  regressions).

## Decision 2: Fix technique

**Decision**: For each of the 7 wrapper instances, remove exactly the `border ...` /
`border-gray-* dark:border-gray-*` token pair from the `className`, leaving `rounded-lg
shadow`/`shadow-sm overflow-hidden` (or the equivalent classes already present) untouched.

**Rationale**: This is a direct, minimal-diff class removal — the exact same technique 067 already
applied successfully to the other now-compliant wrappers in the same files (e.g., the populated-
table branch of `FulfillmentsTab.tsx`/`PurchasesTab.tsx`), so it carries no new risk.

**Alternatives considered**: None — the correct end-state (matching sibling wrapper in the same
file) is directly observable in each case, so no design choice is required beyond the removal
itself.

## Open Questions

None. The fix is fully scoped to 3 files and 7 wrapper instances, using a technique already proven
correct elsewhere in the same files.
