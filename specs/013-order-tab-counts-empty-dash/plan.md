# Implementation Plan: Order Details Tab Counts & Empty Value Dash

**Branch**: `013-order-tab-counts-empty-dash` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-order-tab-counts-empty-dash/spec.md`

## Summary

Add item-count badges to the Taxes, Fulfillment, and Returns top-level tabs on the Order Detail page so they match the existing "My Order (5)" and "Files (2)" pattern. Simultaneously, replace blank (null/undefined/empty-string) text cells across all Order Detail tables with a "-" dash so users never see empty cells. Both changes are purely frontend — no API, DB, or Salesforce schema changes required.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React 18

**Primary Dependencies**: React hooks (`useState`, `useEffect`), existing prop-callback pattern (`onFilesCountChange`) already used in `FilesTab`

**Storage**: N/A — read-only display change

**Testing**: Manual browser validation against an order with mixed populated/empty fields

**Target Platform**: Browser (all supported)

**Project Type**: Next.js 15 web application (Client portal)

**Performance Goals**: No additional data fetching; counts derived from already-fetched state arrays

**Constraints**: Must not introduce new API calls. Must not break existing sub-tab counts. Must maintain dark-mode correctness.

**Scale/Scope**: Three tab components + two table components on a single page route (`app/orders/[id]/page.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ Pass | No new queries; counts derived from already-fetched arrays |
| II — RBAC-First Feature Design | ✅ Pass | No new data exposed; display-only change. Existing role checks in FulfillmentTab and ReturnsTab are preserved and count only role-visible sub-tab records. |
| III — Next.js 15 App Router Patterns | ✅ Pass | No new routes or params. Callback props added to existing client components. |
| IV — Multi-Tenant Isolation | ✅ Pass | No cross-tenant data touched |
| V — Simplicity & Phase-Driven Scope | ✅ Pass | Minimal change: callback prop + state + render update per component. No new abstractions. |
| UI Conventions | ✅ Pass | No new table columns; existing `SortableHeader` + `useSortableData` untouched |

Post-design re-check: No violations introduced. Plan approved.

## Project Structure

### Documentation (this feature)

```text
specs/013-order-tab-counts-empty-dash/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output (component interface changes)
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/orders/[id]/
├── page.tsx                              ← add fulfillmentCount + returnsCount state; derive taxesCount from orderData
└── components/
    ├── FulfillmentTab.tsx                ← add onCountChange prop; emit sum of all sub-tab record arrays after fetch
    ├── ReturnsTab.tsx                    ← add onCountChange prop; emit sum of visible sub-tab record arrays after fetch
    ├── MyOrderTable.tsx                  ← add "—" fallback to manufacturer and productFamily cells
    └── ProductCatalog.tsx                ← add "—" fallback to manufacturer and productFamily cells
```

**Structure Decision**: Single Next.js web application. All changes confined to the existing `app/orders/[id]/` route and its `components/` subdirectory. No new files created; no new routes; no schema changes.
