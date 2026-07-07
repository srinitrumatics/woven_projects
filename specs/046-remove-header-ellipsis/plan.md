# Implementation Plan: Remove Ellipsis Truncation from Data Table Headers

**Branch**: `046-remove-header-ellipsis` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/046-remove-header-ellipsis/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Every column header across the portal's data tables must show its full label with no ellipsis truncation, while table body/cell truncation stays exactly as-is. Nearly all data tables render headers through the shared `SortableHeader` component (`components/ui/SortableHeader.tsx`), whose `truncate` prop defaults to `true`; most call sites already override it with `truncate={false}`, but a few (notably the order line "Taxes" tab, the reported bug) never pass the prop and inherit the truncating default. The fix flips the component's default to `truncate = false` — a single-point change that removes the ellipsis everywhere headers omit the prop — and then removes the now-redundant per-call `truncate={false}` props for consistency, plus fixes the one data table that renders headers with raw `<th>` markup instead of `SortableHeader` (`app/configure/page.tsx`).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (Next.js 15 App Router)

**Primary Dependencies**: Tailwind CSS (utility classes, incl. `truncate`/`whitespace-nowrap`), existing `SortableHeader` / `useSortableData` / `useResizableColumns` hooks — no new dependencies

**Storage**: N/A — presentation-only change, no data model impact

**Testing**: No automated UI test suite exists for these table components; validation is manual/visual per the `/verify` skill (headless browser walk of representative tables), matching how prior data-table correction features (e.g. `044-table-scroll-pagination-fix`) were verified

**Target Platform**: Web browser (desktop-focused data tables), both light and dark mode

**Project Type**: Existing single Next.js web application — frontend-only change (no `backend/`/`frontend/` split, no API/DB layer touched)

**Performance Goals**: N/A — CSS/markup change only, no measurable perf target

**Constraints**: Must not alter table body/cell truncation behavior; must not break existing column sort, resize, or sticky-column behavior in any of the ~89 files rendering `SortableHeader`

**Scale/Scope**: One shared component change (`components/ui/SortableHeader.tsx`) affecting all ~89 call sites; cleanup of now-redundant `truncate={false}` props across those call sites; one additional non-`SortableHeader` table (`app/configure/page.tsx`) with raw `<th className="... truncate ...">` headers to fix directly

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle III (Next.js App Router Patterns)**: N/A — no routing, params, or auth changes.
- **Principle V (Simplicity & Phase-Driven Scope)**: PASS — the fix is the smallest change that satisfies "headers only": flip one shared default, delete redundant props, fix one outlier. No new abstraction introduced.
- **UI Component Conventions** (Technology Stack Constraints): PASS and reinforced — this change makes `SortableHeader` the single source of truncation behavior for all sortable data tables, aligning `app/configure/page.tsx` with the required convention instead of leaving it as a raw-markup outlier.
- Principles I, II, IV (Salesforce source of truth, RBAC, multi-tenant isolation): N/A — no data access, permission, or tenancy logic is touched.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/046-remove-header-ellipsis/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/ui/
└── SortableHeader.tsx          # Shared header cell: flip default `truncate` prop false → drives ~89 call sites

app/configure/page.tsx          # Only data table rendering raw <th> headers with a truncate class directly

app/orders/[id]/components/LineTaxesTab.tsx                              # Reported bug: SortableHeader calls omit truncate prop
app/**/*.tsx, components/**/*.tsx                                        # Remaining ~88 files passing truncate={false} explicitly today —
                                                                          # prop becomes redundant once the default flips, removed for consistency
```

**Structure Decision**: Existing single Next.js application (App Router) — no new directories, services, or routes. All work is confined to existing presentational components: one shared component (`components/ui/SortableHeader.tsx`) plus targeted edits to the files under `app/**` that render data table headers, consistent with the constitution's "UI Component Conventions" requirement that data tables use `SortableHeader`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
