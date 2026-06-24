# Implementation Plan: Fix Duplicate React Key — [object Object]

**Branch**: `wovn_mathu` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-fix-duplicate-react-key/spec.md`

## Summary

The `grpLabels.map(label => <div key={label}>)` loop in `app/configure/page.tsx` produces a React "duplicate key" warning because the Salesforce picklist API can return items as `{value, label}` objects rather than plain strings. When an object is used as a key prop, JavaScript coerces it to `"[object Object]"`, making every key identical. The fix normalizes picklist items to plain strings at the point of ingestion inside the `useEffect` that populates `grpLabels`, matching the defensive pattern already used in `app/admin/authorize-locations/components/LocationModal.tsx` (lines 192–195) and `app/admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx` (lines 250–253).

**Changes required** (all in `app/configure/page.tsx`):

| Change | Detail |
|--------|--------|
| Normalize picklist items in `useEffect` | Extract `item.value ?? item.label ?? String(item)` before calling `setGrpLabels` — keeps `grpLabels` as `string[]` |
| No JSX change needed | The `key={label}` / `{label}` in the dropdown map is correct once `grpLabels` holds only strings |

## Technical Context

**Language/Version**: TypeScript / React 18, Next.js 15 (App Router)

**Primary Dependencies**: `useState`, `useEffect` (already in file), browser `fetch`

**Storage**: N/A — no database changes

**Testing**: Manual browser validation + console inspection

**Target Platform**: Web browser (Next.js client component)

**Project Type**: Next.js 15 web application — single client component edit

**Performance Goals**: N/A — purely a correctness fix

**Constraints**:
- Fix must keep `grpLabels` typed as `string[]` — no type-widening
- Must handle both plain-string items and `{value, label}` object items from the picklist API
- Must not change the dropdown JSX (fix is in data normalization, not rendering)
- Must follow the same defensive pattern used in `LocationModal.tsx` and `DeliveryWindowModal.tsx`

**Scale/Scope**: Single statement change inside the existing picklist `useEffect` in `app/configure/page.tsx`.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No change to how data is fetched — only how raw picklist items are normalized client-side. |
| II. RBAC-First Feature Design | ✅ Pass | No new UI surface or permission surface added. |
| III. Next.js 15 App Router Patterns | ✅ Pass | No route param changes. Client-component `useEffect` pattern unchanged. |
| IV. Multi-Tenant Isolation | ✅ Pass | Normalization is pure client-side transformation with no cross-org implications. |
| V. Simplicity & Phase-Driven Scope | ✅ Pass | One-line data normalization. No abstraction introduced. |

**Gate result**: All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-duplicate-react-key/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/configure/
└── page.tsx             # Only file changed — normalize picklist items to strings in useEffect
```

**Structure Decision**: Single-file edit. No new files in source tree.

## Complexity Tracking

> No constitution violations. Table not applicable.
