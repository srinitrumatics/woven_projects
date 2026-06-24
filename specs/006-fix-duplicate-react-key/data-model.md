# Data Model: Fix Duplicate React Key — [object Object]

**Feature**: `specs/006-fix-duplicate-react-key`
**Date**: 2026-06-24

## No New Entities

No new data entities, database tables, or API fields. This is a client-side state normalization fix.

## Affected State

### `grpLabels` (type contract tightened)

| Property | Before Fix | After Fix |
|----------|------------|-----------|
| Declaration | `useState<string[]>([])` | `useState<string[]>([])` (unchanged) |
| Runtime content | May contain objects `{value, label}` when Salesforce returns object-shaped picklist items | Always contains plain strings (normalized at ingestion) |
| Used by | `grpLabels.map(label => <div key={label}>)` dropdown | Same — no JSX change |

## Normalization Applied

At the point of ingestion in the picklist `useEffect`:

```
Raw API response item shapes:
  Shape A: "Group Name"                    → String(item) = "Group Name"
  Shape B: { value: "Group Name", label: "Group Name" } → item.value = "Group Name"
  Shape C: { label: "Group Name" }         → item.label = "Group Name"
  Shape D: null / undefined                → filtered out by .filter(Boolean)
```

Result: `grpLabels` always holds a `string[]` of non-empty display names, safe for use as React keys and as the `name` argument to `addGroup()`.
