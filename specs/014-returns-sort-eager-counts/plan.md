# Implementation Plan: Returns Table Sorting, Resizing & Eager Tab Counts

**Branch**: `014-returns-sort-eager-counts` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-returns-sort-eager-counts/spec.md`

## Summary

Three coordinated improvements to the Order Detail page: (1) fetch Fulfillment and Returns data eagerly at page load so tab header counts appear immediately; (2) add sortable column headers and resizable columns to all four Returns sub-tab tables, matching the existing FulfillmentTab behaviour; (3) sweep any remaining blank text cells in all tables to display "—". All changes are purely frontend — no API, DB, or Salesforce schema changes needed.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React 18

**Primary Dependencies**:
- `useSortableData` hook (`hooks/useSortableData.ts`) — already used by FulfillmentTab
- `useResizableColumns` hook (`hooks/useResizableColumns.ts`) — already used by FulfillmentTab
- `SortableHeader` component (`components/ui/SortableHeader.tsx`) — already used by FulfillmentTab

**Storage**: N/A — frontend-only display changes

**Testing**: Manual browser validation via `quickstart.md`

**Target Platform**: Browser (all supported)

**Project Type**: Next.js 15 web application (Client portal)

**Performance Goals**: Fulfillment and Returns data fetched in parallel with primary order fetch; no serialisation penalty. No additional API calls when the user clicks the tabs (data already loaded).

**Constraints**: Must not duplicate API calls. Must not break existing FulfillmentTab sort, resize, or count behaviour. Must not regress My Order or Files tab behaviour.

**Scale/Scope**: Two tab components + one page route; four sub-tab tables in ReturnsTab

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ Pass | No new queries invented; uses existing `/api/salesforce/orders?action=fulfillment` and `?action=returns` endpoints via client-side fetch |
| II — RBAC-First Feature Design | ✅ Pass | Role check for `isCustomerOrNSO` preserved in ReturnsTab; no new data surfaces |
| III — Next.js 15 App Router Patterns | ✅ Pass | No new routes. Existing client component pattern. `id` param already unwrapped. |
| IV — Multi-Tenant Isolation | ✅ Pass | All fetches remain scoped to `accountId` from session |
| V — Simplicity & Phase-Driven Scope | ✅ Pass | Using existing hooks and components; no new abstractions. Phase 1 (Client Priority) scope. |
| UI Conventions | ✅ Pass | `SortableHeader` + `useSortableData` + `useResizableColumns` are the mandated pattern for all data tables — this feature brings ReturnsTab into compliance |

Post-design re-check: No violations introduced. Plan approved.

## Project Structure

### Documentation (this feature)

```text
specs/014-returns-sort-eager-counts/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output (component interface changes)
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/orders/[id]/
├── page.tsx                              ← add eager fetch useEffects; add fulfillmentData/returnsData state; pass preloadedData props; compute counts
└── components/
    ├── FulfillmentTab.tsx                ← add preloadedData?: FulfillmentPreloadedData prop; skip internal fetch when prop present; init state from prop
    └── ReturnsTab.tsx                    ← add preloadedData?: ReturnsPreloadedData prop; add SortableHeader + useSortableData (×4) + useResizableColumns; fix any remaining empty cells
```

**Structure Decision**: Single Next.js web application. All changes confined to the `app/orders/[id]/` route. No new files created; no new routes; no DB changes.
