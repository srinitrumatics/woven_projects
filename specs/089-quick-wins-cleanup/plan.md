# Implementation Plan: Quick Wins & Dead Code Cleanup

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`088`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/089-quick-wins-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A bundle of 12 small, independent, low-risk fixes across 10 files, verified via direct current-state investigation rather than trusted from the original static audit (which had drifted on at least 2 of these items — one line number moved, one item's assumed root cause was wrong). Covers 5 invalid/no-op Tailwind class corrections, 2 dead-file deletions, 1 filename rename, 3 dead/miswired interactive-element fixes (each requiring a different treatment: disable, wire-up-for-real, or remove), and 1 unreachable-dead-code removal (a tab definition plus the now-fully-unused file it rendered).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix uses only Tailwind classes, React state, and patterns already present in each file

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature; the one item that looks data-adjacent (Inventory's "Average Aged" filter) reads an array the existing data source already returns, adding no new field or query

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`–`088` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, 2 file deletions (net code reduction)

**Constraints**:
- FR-014: no business logic, data-fetching, or Salesforce read/write behavior changes anywhere in this feature.
- The Inventory "Average Aged" fix (FR-009/FR-010) must reuse `inventoryData["Average Aged"]`, an array the page's data source already returns and already uses to compute the card's displayed statistics — no new API call or field.
- Deleting `app/shipments/[id]/components/PlaceholderTabs.tsx` (FR-012) requires first removing its only caller (the dead `activeTab === "tracking"` branch and its import in `app/shipments/[id]/page.tsx`) — order matters within that one task, not across the feature.
- `app/shipments/[id]/page.tsx`'s `trackingData` state and its fetch logic MUST NOT be touched — it's actively used by `TrackingInfo` and the separate, already-working `TrackingTimelineModal` (shipped in spec 087); only the dead render branch consuming it via `TrackingTimelineTab` is removed.
- Removing the Purchase Order list's eye icon (FR-011) removes the entire "Action" column (header cell + body cells + its column-width config entry), not just the button, since an empty column would be its own leftover oddity.

**Scale/Scope**: 10 files touched (7 modified in place, 2 deleted, 1 renamed-and-its-1-caller-updated). No new dependency, no new shared component.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes; the Average Aged fix reuses an already-fetched array from the existing data source.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS, no exceptions. This feature is a net reduction in code (2 files deleted, several dead branches/props removed) with zero new dependencies or abstractions — the smallest-footprint spec in this series so far.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/089-quick-wins-cleanup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature has no new component API or data contract; every fix operates on existing, already-defined shapes.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx        # fix: PX-3 Py-2 -> px-3 py-2 (line 152)
app/configure/ConfigureOrderClientPage.tsx                   # fix: w-70 -> w-72 (line 731)
app/products/ProductClientPage.tsx                           # fix: min-w-200px x2 -> min-w-[200px]; drop dead text-sm (lines 571, 577)
app/orders/[id]/OrderClientPage.tsx                          # fix: w-22 -> w-24 (line 1948)
app/configure/configure.css                                  # DELETE — zero references
app/quotes/[id]/components/QuoteScopeSummary.tsx             # DELETE — zero references
app/purchase-orders/[id]/lines/[lineid]/components/
├── poserialnumberloglinestab.tsx                             # RENAME -> POSerialNumberLogLinesTab.tsx
app/purchase-orders/[id]/lines/[lineid]/page.tsx             # update import path for the rename above
app/reports/page.tsx                                          # fix: disable "Generate Report" button
app/inventory/page.tsx                                        # fix: wire up "Average Aged" card as a real filter (type, branch, button, pill row)
app/purchase-orders/page.tsx                                 # fix: remove dead Action column (header + cells + width config)
app/shipments/[id]/components/ShipmentTabs.tsx               # fix: remove unused "tracking" from ShipmentTabId + counts prop
app/shipments/[id]/page.tsx                                   # fix: remove dead activeTab==="tracking" branch + PlaceholderTabs import
app/shipments/[id]/components/PlaceholderTabs.tsx            # DELETE — zero callers once the above branch is removed
```

**Structure Decision**: Single Next.js project. No shared component, no new dependency — 7 in-place edits, 3 deletions (2 confirmed-dead files plus `PlaceholderTabs.tsx` once its only caller is removed), 1 rename with its single call site updated.

## Complexity Tracking

*No violations — table intentionally empty.*
