# Implementation Plan: Paginate the Remaining Returns Sub-Tabs

**Branch**: `048-returns-subtab-pagination` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/048-returns-subtab-pagination/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

`app/orders/[id]/components/ReturnsTab.tsx` renders four mutually-exclusive sub-tabs (RMAs,
Credit Memos, Debit Memos, RTV) switched by one `activeSubTab` state. Two of the four (RMAs,
Credit Memos) already have their own `rmaPage`/`cmPage` state, a `pagedX` slice, and a
`<Pagination>` render; the other two (Debit Memos, RTV) render `sortedDebitMemos`/
`sortedRtvList` directly with no slicing or controls at all. The fix is a single-file,
single-pattern change: add `dmPage`/`rtvPage` state, `pagedDebitMemos`/`pagedRtvList` slices,
switch their `.map()` calls to the paged variables, and add a `<Pagination>` block — copying
the RMAs/Credit Memos blocks in the same file line-for-line, including their existing
sub-tab-switch-resets-page behavior and their existing (documented) lack of sort-resets-page
behavior, so all four sub-tabs end up behaviorally identical.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (Next.js 15 App Router)

**Primary Dependencies**: existing `components/ui/Pagination.tsx` and `hooks/useSortableData` /
`hooks/useResizableColumns` — already imported and used by this same file's RMAs/Credit Memos
sub-tabs; no new dependencies

**Storage**: N/A — presentation-only change; pagination slices data already fetched into
component state (`debitMemos`, `rtvList`)

**Testing**: No automated UI test suite exists for these table components; validation is
manual per `quickstart.md`, matching how `047-add-datatable-pagination` and
`046-remove-header-ellipsis` were verified in this repo

**Target Platform**: Web browser (desktop-focused data tables), both light and dark mode

**Project Type**: Existing single Next.js web application — frontend-only change, single file

**Performance Goals**: N/A — client-side array slicing of already-loaded data

**Constraints**: Must not touch the RMAs/Credit Memos sub-tabs' existing pagination or any
other data table; must not change columns, hyperlinks, sorting, or resizing on Debit
Memos/RTV — pagination state and controls are the only addition; pagination controls must sit
outside the `overflow-auto` scroll wrapper, matching the RMAs/Credit Memos blocks and the rule
established in `044-table-scroll-pagination-fix`

**Scale/Scope**: One file (`app/orders/[id]/components/ReturnsTab.tsx`), two sub-tab blocks
(Debit Memos, RTV)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **UI Component Conventions** (Technology Stack Constraints): PASS and directly enforced —
  brings the last two inconsistent sub-tabs in this file into line with the shared
  `Pagination` component convention already used by their siblings in the same file.
- **Principle V (Simplicity & Phase-Driven Scope)**: PASS — the fix is copy-paste of an
  existing, working, in-file pattern; no new abstraction, no shared-component change, no
  cross-file refactor.
- **Principle III (Next.js App Router Patterns)**: N/A — no routing/params/auth changes.
- Principles I, II, IV (Salesforce source of truth, RBAC, multi-tenant isolation): N/A — no
  data access, permission, or tenancy logic is touched.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/048-returns-subtab-pagination/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/orders/[id]/components/ReturnsTab.tsx   # Only file touched — add page state, paged
                                             # slices, and <Pagination> for the Debit Memos
                                             # and RTV sub-tab blocks, mirroring the RMAs and
                                             # Credit Memos blocks already in this file
```

**Structure Decision**: Existing single Next.js application (App Router) — no new files,
directories, or shared components. The entire fix is confined to one existing file, applying
a pattern that already exists twice within that same file to the two sub-tab blocks missing
it.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
