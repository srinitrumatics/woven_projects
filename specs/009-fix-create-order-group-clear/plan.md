# Implementation Plan: Fix Create Order Visibility and Group Text Box Clear

**Branch**: `009-fix-create-order-group-clear` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-fix-create-order-group-clear/spec.md`

## Summary

Two targeted bug fixes in two separate files:

1. **AddToOrderModal** — Restore correct "Create Order" button visibility: show it only when `orders.length === 0 && !loading` (not when draft orders exist).
2. **Configure page** — Clear the "Group name..." text box after a group is successfully added by calling `setCustomGrpName('')` inside the `addGroup` function.

Both are synchronous, single-line UI state corrections with no API or data model changes.

## Technical Context

**Language/Version**: TypeScript / React 18 (Next.js 15 App Router)

**Primary Dependencies**: React `useState` hooks already in both components; no new packages required

**Storage**: N/A

**Testing**: Manual browser verification via quickstart.md

**Target Platform**: Web browser (desktop + mobile)

**Project Type**: Web application — Next.js 15 client components

**Performance Goals**: N/A — pure state corrections, no async paths

**Constraints**: N/A

**Scale/Scope**: Two files, two 1-line fixes

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No data layer changes; `handleCreateOrder` unchanged |
| II. RBAC-First Feature Design | ✅ Pass | No new capabilities exposed; existing modal gating unchanged |
| III. Next.js 15 App Router Patterns | ✅ Pass | Both files are already `"use client"` components; no route-param changes |

**No violations. No research phase required.**

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-create-order-group-clear/
├── plan.md              # This file
├── quickstart.md        # Validation guide
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
app/products/[id]/components/
└── AddToOrderModal.tsx   ← Fix 1: Create Order button visibility

app/configure/
└── page.tsx              ← Fix 2: Clear customGrpName after addGroup
```

**Structure Decision**: Two independent 1-line fixes in existing files. No new files or routes needed.

## Phase 0: Research

No unknowns. Both fixes are clearly scoped to existing state variables:

- **Fix 1**: Change `{!loading && (...Create Order...)}` condition from `!loading` to `!loading && orders.length === 0`
- **Fix 2**: Add `setCustomGrpName('')` inside `addGroup()` in `app/configure/page.tsx` (line ~197, after `setGrpDDOpen(false)`)

## Phase 1: Design

### Fix 1 — AddToOrderModal footer (app/products/[id]/components/AddToOrderModal.tsx)

**Current behavior** (from spec 008 implementation):
- Footer when loading: `[Cancel]`
- Footer when no orders: `[Cancel] [Create Order]` — correct
- Footer when orders exist: `[Cancel] [Create Order] [Add to Order]` — BUG: Create Order should not appear

**Target behavior**:
- Footer when loading: `[Cancel]`
- Footer when no orders: `[Cancel] [Create Order]`
- Footer when orders exist: `[Cancel] [Add to Order]`

**Change**: In the footer, the "Create Order" button's render condition changes from `{!loading && (...)}` to `{!loading && orders.length === 0 && (...)}`.

The "Add to Order" button's condition remains `{!loading && orders.length > 0 && (...)}` — unchanged.

### Fix 2 — addGroup function (app/configure/page.tsx)

**Current `addGroup` function** (line ~193): adds group and calls `setGrpDDOpen(false)` but does NOT reset `customGrpName`.

**Target**: Add `setCustomGrpName('')` after `setGrpDDOpen(false)` so the text box resets after every group addition — whether triggered by the custom text box or picklist (safe no-op in the picklist path since `customGrpName` is already `''` there).
