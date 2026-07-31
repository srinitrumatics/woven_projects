# Implementation Plan: Reposition Line Status Indicator (Invoices, Shipments)

**Branch**: `078-line-status-position` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/078-line-status-position/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Invoice Line and Shipment Line detail pages each already show a working status indicator, but both currently render it stacked under the top-right "Back to Invoice" / "Back to Shipment" button instead of next to the "Line X of Y" indicator near the top-left, unlike every other line-detail page (Supplier Bills, and — after the prior `077-line-status-parity` feature — Orders, Proposals, Quotes). This is a pure JSX-relocation fix in two files: move the existing `<StatusBadge status={product.status} />` (Invoices) and the existing status `<div>` (Shipments) out of the top-right column and into the "Line X of Y" row. No data, fallback, or color-mapping logic changes on either page.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing classes reused as-is); no new packages

**Storage**: N/A — no data or fetch logic changes; status values are already being read correctly on both pages today

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077-line-status-parity` and other `*-corrections` features in this repo (no automated UI test suite exists)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls, no new components; purely moving existing JSX within the same render tree

**Constraints**: Must not change the status text, color, or fallback logic on either page (FR-004, FR-005); must not change the "Back to Invoice" / "Back to Shipment" button's own behavior or styling, only its resulting layout position once the neighboring status element is removed (FR-007); must not merge Invoice's invoice-specific status vocabulary/colors or Shipment's current fixed-color styling into the generic `StatusBadge` pattern used elsewhere — that normalization is explicitly out of scope per spec Assumptions

**Scale/Scope**: 2 files change (`app/invoices/[id]/lines/[lineid]/page.tsx`, `app/shipments/[id]/lines/[lineid]/page.tsx`); each is a self-contained JSX move within a single file, no shared component or cross-file dependency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No data-fetching or query changes on either page — the same already-fetched `product.status` (Invoices) and `product.Status__c` (Shipments) values are displayed, just relocated within the JSX.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or data-mutation path is introduced; both pages remain behind their existing auth/route protection.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — the same org-scoped data already being displayed is simply moved to a different part of the page.
- **V. Simplicity & Phase-Driven Scope**: PASS. Scope is strictly "move this existing element" — explicitly excludes normalizing Shipment's status styling to the color-per-status pattern used elsewhere, per spec Assumptions, to avoid scope creep beyond what was requested.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/078-line-status-position/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is generated — this feature changes no API route, request, or response shape; it only moves existing, already-rendered JSX within two pages.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`. This feature touches only two existing files, each independently:

```text
app/
├── invoices/[id]/lines/[lineid]/
│   └── page.tsx    # Move the existing <StatusBadge status={product.status} /> out of the
│                   # top-right column (currently under "Back to Invoice") into the
│                   # "Line X of Y" row. StatusBadge function itself is untouched.
└── shipments/[id]/lines/[lineid]/
    └── page.tsx    # Move the existing status <div> out of the top-right column
                    # (currently under "Back to Shipment") into the "(Line X of Y)" row.
                    # The div's styling/content is untouched.
```

**Structure Decision**: Single Next.js project, no new files, routes, or shared components. Each page is edited independently and can ship independently, matching the P1/P2 independent user stories in `spec.md`. No `LineHeader`-style extracted component exists for either page (both render their header inline), so each is a direct, self-contained JSX edit.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — no violations.
