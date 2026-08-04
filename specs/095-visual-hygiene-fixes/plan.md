# Implementation Plan: Visual Hygiene Fixes

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`094`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/095-visual-hygiene-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Four independent, verified visual-hygiene defects, scoped down from an original 6-item tier after investigation found 2 items (card consistency, spinner consolidation) far too large for a small-fixes tier — both deferred per user decision to future dedicated specs. This spec covers: (1) Order Line Detail's quantity stepper has 2 divergent color/border skins within one file (`OrderDetailsTable.tsx`, mobile vs. desktop) — corrected from the audit's stale "3 files" claim; fix unifies the color scheme while preserving each layout's appropriate button size. (2) `Sidebar.tsx`'s navigation array uses the identical SVG path for "Catalog"/"My Inventory" and again for "Orders"/"Purchase Orders" — a Hybrid-type account sees all 4 simultaneously with only 2 distinguishable icons; fix gives "My Inventory" and "Purchase Orders" new, semantically-fitting icons. (3) Breadcrumb markup is hand-copied independently in 3 Proposal-module places, and one copy (`ProposalHeader.tsx`) has a genuine functional regression — its "Proposals"/"Proposal Details" segments are static non-clickable text where the other 2 copies correctly navigate; fix builds a shared `Breadcrumb` component and migrates all 3, closing the functional gap as a side effect of consolidation. (4) Shipments List, Inventory List, and Admin Delivery Windows each hand-roll filter pills instead of the shared `Tabs` component — Shipments/Inventory share a wrong-token bug, Delivery Windows is a third, differently-shaped style; fix migrates all 3 onto `Tabs`, whose existing `{tabs, activeKey, onChange}` API already fits all 3 pages' data with no new props needed.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — `next/link` (already used throughout the app) is the only import the new `Breadcrumb` component needs beyond React; `Tabs.tsx` and its `TabItem` type already exist

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`094` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders beyond replacing existing markup with equivalent shared-component calls

**Constraints**:
- FR-002/FR-005: Order Line Detail's quantity-update behavior and all other Sidebar nav-item behavior MUST remain completely unchanged — every fix in this tier is visual-only.
- FR-007: every non-current breadcrumb segment MUST be a working link; every current (final) segment MUST remain non-interactive text, across all 3 migrated call sites.
- FR-010: each of the 3 filter-pill pages' existing filter/click behavior MUST remain functionally unchanged after migrating onto `Tabs`.
- FR-011: no business logic, data-fetching, or Salesforce read/write changes anywhere — every change is presentation-layer styling consolidation or a breadcrumb-navigation bug fix.

**Scale/Scope**: 7 files touched (1 stepper-color fix, 1 Sidebar icon-path fix, 1 new shared `Breadcrumb` component + 3 call-site migrations, 3 filter-pill call-site migrations onto the existing `Tabs` component) — 8 total file operations. No new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. `ProposalHeader.tsx` gains a new `id` prop (already available in its parent page's scope) — a prop addition, not a routing change.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. The stepper fix and Sidebar icon fix are pure className/path edits with no new abstraction. The `Breadcrumb` component and the `Tabs` migration both consolidate genuinely duplicated code onto one shared implementation — consistent with the Modal/SubTabs/ReadOnlyField precedent, appropriately scaled down for a much smaller number of call sites (3 each).

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/095-visual-hygiene-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — the new `Breadcrumb` component is an internal presentation-layer primitive (like `Tabs.tsx`/`Modal.tsx`), not an external API/interface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx        # fix: desktop stepper buttons (lines 141,148) -> mobile's color scheme, keep w-6 h-6 size

components/layouts/Sidebar.tsx                                          # fix: "My Inventory" (46-50) -> ArchiveBoxIcon path; "Purchase Orders" (74-78) -> ClipboardDocumentListIcon path

components/ui/Breadcrumb.tsx                                            # NEW — shared breadcrumb, { items: {label, href?}[], className? }
app/proposals/[id]/components/ProposalHeader.tsx                       # migrate onto Breadcrumb; gains new `id` prop
app/proposals/[id]/page.tsx                                             # pass id prop to <ProposalHeader> (line 1400)
app/proposals/[id]/summary/page.tsx                                     # migrate onto Breadcrumb
app/proposals/[id]/lines/[lineid]/page.tsx                              # migrate onto Breadcrumb

app/shipments/page.tsx                                                  # migrate filter pills (444-467) onto Tabs
app/inventory/page.tsx                                                  # migrate filter pills (574-587) onto Tabs
app/admin/authorize-locations/[id]/delivery-windows/page.tsx            # migrate filter pills (278-292) onto Tabs
```

**Structure Decision**: Single Next.js project. 1 new shared component (`Breadcrumb.tsx`), 9 files edited, no deletions, no new dependency. US1 and US2 are single-file fixes independent of everything else; US3 touches 5 files (1 new + 4 edits, including the parent page passing a new prop); US4 touches 3 independent files, each migrating onto the already-existing `Tabs` component.

## Complexity Tracking

*No violations — table intentionally empty.*
