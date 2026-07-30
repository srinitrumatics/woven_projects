# Implementation Plan: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Branch**: `076-po-line-edit-toggle` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/076-po-line-edit-toggle/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the current "Promise Date and Tracking Number are live inputs whenever the line's status permits editing" pattern on the Purchase Order Line detail page (`app/purchase-orders/[id]/lines/[lineid]/page.tsx`) with an Edit-icon toggle in the top-right corner, matching the Edit/Cancel/Save Changes interaction already used on the Order Line detail page (`app/orders/[id]/lines/[lineId]/page.tsx` + its `LineHeader.tsx`). The icon appears only for Draft/Approved lines (narrowed from the current Draft/Approved/Awarded); clicking it enters an editing mode that makes just those two fields editable and swaps the icon for Cancel/Save controls; Cancel discards changes and reverts to read-only; Save submits via the existing PATCH endpoint unchanged in shape. Because the status set that permits editing is narrowing, the server-side status check in `app/api/purchase-orders/route.ts` (`EDITABLE_LINE_STATUSES`) is updated in lockstep so a save cannot be forced for an Awarded line outside the UI.

## Technical Context

**Language/Version**: TypeScript, React 19 (Next.js 15 App Router), existing codebase — no version changes

**Primary Dependencies**: Next.js 15 (App Router page + API route), Tailwind CSS (utility classes only); existing `lib/purchase-order-service.ts` Salesforce client — no new dependencies

**Storage**: N/A new storage — same two Salesforce `Purchase_Order_Line__c` fields (`Tracking_Number__c`, `Promise_Date__c`) via the existing `PATCH /api/purchase-orders` route; no schema or database changes

**Testing**: Manual browser verification (light + dark mode) across Draft, Approved, Awarded, and another non-editable status, comparing the toggle behavior against the Order Line page reference; `npx tsc --noEmit` for static checks (this repo's `next lint` has no ESLint config — see `specs/075-remove-editable-tag/tasks.md` T010 note); no dedicated automated test suite exists for this page/route today

**Target Platform**: Web browser (existing WOVN Client & Partner Portal, main portal auth surface)

**Project Type**: Single Next.js web application (existing project structure, no new project/package)

**Performance Goals**: N/A — no data-flow or perf-sensitive change; adds one boolean `isEditing` state and conditional rendering

**Constraints**: MUST NOT change the `PATCH /api/purchase-orders` request body shape (`accountId`, `contactId`, `trackingNumber`, `promiseDate`) or response shape (`{ success, trackingNumber, promiseDate }`) — see `contracts/`. MUST keep every field other than Promise Date/Tracking Number read-only regardless of edit mode. MUST update the front-end (`isLineEditable`) and back-end (`EDITABLE_LINE_STATUSES`) editable-status checks together so they stay consistent — the narrowed Draft/Approved rule must hold even if Save is invoked outside the visible UI (FR-010).

**Scale/Scope**: Two files — `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (add `isEditing` state; add Edit/Cancel/Save controls to the top-right header area; gate the Promise Date/Tracking Number editable branches on `isEditing` instead of only `isLineEditable`; narrow `isLineEditable` to Draft/Approved; add a Cancel handler that reverts to `savedPromiseDate`/`savedTrackingNumber` and exits edit mode) and `app/api/purchase-orders/route.ts` (narrow `EDITABLE_LINE_STATUSES` from `["Draft", "Approved", "Awarded"]` to `["Draft", "Approved"]`). Reference only, not modified: `app/orders/[id]/lines/[lineId]/page.tsx` and `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — PASS. `lib/purchase-order-service.ts` remains the sole Salesforce access path; the `EDITABLE_LINE_STATUSES` change is a business-rule constant inside the existing API route, not a new query pattern or a new write path.
- **II. RBAC-First Feature Design** — N/A/PASS. No new functionality is exposed beyond narrowing an existing save capability; any existing permission gates on this route/page are untouched.
- **III. Next.js 15 App Router Patterns** — PASS. `use(params)` is already correctly used and is not touched by this feature.
- **IV. Multi-Tenant Isolation** — PASS. The PATCH handler's `accountId`/`contactId` scoping is unchanged; no cross-org query is introduced.
- **V. Simplicity & Phase-Driven Scope** — PASS. This reuses the exact `isEditing` toggle pattern already proven on the Order Line page rather than inventing a new interaction model; no speculative abstraction is added beyond the state and constant changes needed.

No violations. Nothing to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/076-po-line-edit-toggle/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── purchase-orders/
│   └── [id]/
│       └── lines/
│           └── [lineid]/
│               └── page.tsx          # MODIFIED: isEditing state, header Edit/Cancel/Save controls,
│                                      #   narrow isLineEditable to Draft/Approved, gate field editability on isEditing
│
├── api/
│   └── purchase-orders/
│       └── route.ts                  # MODIFIED: narrow EDITABLE_LINE_STATUSES to ["Draft", "Approved"]
│
└── orders/
    └── [id]/
        └── lines/
            └── [lineId]/
                ├── page.tsx                        # REFERENCE ONLY — not modified
                └── components/
                    └── LineHeader.tsx               # REFERENCE ONLY — not modified (source of the Edit/Cancel/Save pattern)
```

**Structure Decision**: Existing single Next.js App Router project (no new project/package). The interaction change is scoped to the two files above — no new component is extracted for the Edit/Cancel/Save controls, since they're a small addition to the existing header markup and this page does not yet have a dedicated header component (unlike the Order Line page's `LineHeader.tsx`); extracting one now would be a speculative abstraction not required by this feature's scope, per Constitution Principle V.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
