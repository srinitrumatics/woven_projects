# Implementation Plan: Modal Create Order Footer Button

**Branch**: `008-modal-create-order-footer` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-modal-create-order-footer/spec.md`

## Summary

Move the "Create Order" button from the modal content's empty-state block into the modal footer, placing it between the "Cancel" and "Add to Order" buttons. This is a pure UI layout change in a single React component (`AddToOrderModal.tsx`) with no data-model, API, or business-logic changes required.

## Technical Context

**Language/Version**: TypeScript / React 18 (Next.js 15 App Router)

**Primary Dependencies**: React state hooks already in the component (`creating`, `loading`, `orders`); no new packages required

**Storage**: N/A — no database or persistence changes

**Testing**: Manual browser verification (open modal, confirm footer layout in both states)

**Target Platform**: Web browser (desktop + mobile responsive)

**Project Type**: Web application — Next.js 15 client component

**Performance Goals**: N/A — pure render change, no async paths added

**Constraints**: Footer must remain usable at mobile widths (flex-wrap acceptable if needed)

**Scale/Scope**: Single component, one file change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No business-data writes or reads added; existing `handleCreateOrder` already uses the correct API route |
| II. RBAC-First Feature Design | ✅ Pass | No new route or capability exposed; button triggers the same existing action; the modal is already gated by the parent component |
| III. Next.js 15 App Router Patterns | ✅ Pass | `AddToOrderModal.tsx` is already a `"use client"` component; no route-param unwrapping involved |

**No violations. Proceed to Phase 1 directly** (no research phase required; the feature is scoped to a single well-understood component with no unknowns).

## Project Structure

### Documentation (this feature)

```text
specs/008-modal-create-order-footer/
├── plan.md              # This file
├── research.md          # N/A — no unknowns identified
├── data-model.md        # N/A — no new entities
├── quickstart.md        # Validation guide
├── contracts/           # N/A — no new API contracts
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
app/products/[id]/components/
└── AddToOrderModal.tsx   ← only file that changes
```

**Structure Decision**: Single-file change inside the existing Next.js App Router component tree. No new files, routes, or service layers needed.

## Phase 0: Research

No unknowns were identified during the Constitution Check. The implementation touches a single, well-understood client component (`AddToOrderModal.tsx`) with existing state variables (`creating`, `loading`, `orders`, `selectedOrderId`) that can be reused directly. No research phase is required.

## Phase 1: Design

### Current Footer Layout (lines 282–298 of AddToOrderModal.tsx)

```
[Cancel]  [Add to Order]   ← visible only when orders.length > 0 && !loading
```

The "Create Order" action currently only appears inside the content area in the zero-orders empty state (lines 236–245).

### Target Footer Layout

```
[Cancel]  [Create Order]  [Add to Order]
                          ↑ only when orders.length > 0 && !loading
```

"Create Order" is always shown in the footer (except during the initial loading spinner), so users in both the empty-state and orders-present state can create a new order from the predictable footer action row.

### Visibility Rules (footer buttons)

| Button | Shown when |
|---|---|
| Cancel | Always |
| Create Order | `!loading` (hide during initial draft-orders fetch; disable while `creating`) |
| Add to Order | `!loading && orders.length > 0` |

### Button Styling

Reuse the style already applied to the empty-state "Create Order" button:
`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl`

Match the `flex-1 py-3 px-4` sizing used by the other footer buttons for consistent layout.

### Data Model

No changes — all required state (`creating`, `loading`, `orders`, `handleCreateOrder`) already exists in the component.

### Contracts

No new API routes. The footer button calls the existing `handleCreateOrder` function unchanged.
