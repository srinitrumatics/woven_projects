# Data Model: Configure Group Dropdown from Product Grouping

**Feature**: `specs/003-configure-group-dropdown`
**Date**: 2026-06-24

## No New Entities

This feature introduces no new data entities, database tables, or API fields. It is a pure client-side derived-state change.

## Affected Derived State

### `grpLabels` (new `useMemo`)

| Property | Value |
|----------|-------|
| Source   | `catalog` state (already loaded via `/api/salesforce/orders?action=products`) |
| Derivation | `[...new Set(catalog.map(p => p.groupingLabel).filter(Boolean))].sort()` |
| Type | `string[]` |
| Updates when | `catalog` changes |
| Used by | "Add Group" dropdown JSX |

### Existing `catalog` item shape (relevant field)

| Field | Mapped from | Notes |
|-------|-------------|-------|
| `groupingLabel` | `p.Grouping__c \|\| p.Product_Grouping__c` | Already populated in catalog mapping at `app/configure/page.tsx` ~line 65. Empty string if neither SF field is set. |

## State Transitions

No new state transitions. The `addGroup(name, color)` function signature is unchanged. Clicking a catalog-derived label calls `addGroup(label, 'bg-gray-500')`, identical to the current custom-name path.
