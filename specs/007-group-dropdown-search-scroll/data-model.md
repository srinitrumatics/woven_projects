# Data Model: Configure Order — Add Group Dropdown Search & Scroll

**Feature**: `specs/007-group-dropdown-search-scroll`
**Date**: 2026-06-24

## No New Entities

No new data entities, database tables, or API fields. This is a client-side UI enhancement.

## New State

### `grpSearch` (new)

| Property | Value |
|----------|-------|
| Declaration | `const [grpSearch, setGrpSearch] = useState<string>('')` |
| Type | `string` |
| Initial value | `''` |
| Updated when | User types in the search input |
| Reset when | `grpDDOpen` becomes `false` (dropdown closes) |
| Used by | `filteredGrpLabels` useMemo; search input `value` prop |

## New Derived State

### `filteredGrpLabels` (new useMemo)

| Property | Value |
|----------|-------|
| Declaration | `const filteredGrpLabels = useMemo(() => grpLabels.filter(l => l.toLowerCase().includes(grpSearch.toLowerCase())), [grpLabels, grpSearch])` |
| Type | `string[]` |
| Source | Filtered subset of `grpLabels` |
| Filter logic | Case-insensitive substring match of `grpSearch` against each label |
| When `grpSearch` is `''` | Returns all `grpLabels` (filter passes everything) |
| Used by | Scrollable items list in JSX |

## Unchanged State

| State | Unchanged |
|-------|-----------|
| `grpLabels: string[]` | Populated from picklist API (feature 005); not changed by this feature |
| `grpDDOpen: boolean` | Toggle state for dropdown; drives `grpSearch` reset side-effect |
| `customGrpName: string` | Custom input; not affected |

## JSX Structure Change (summary)

```
Before:
  grpLabels.map(label => <div key={label}>)

After:
  <search input>
  <div max-h-[180px] overflow-y-auto>
    filteredGrpLabels.map(label => <div key={label}>) 
    OR <"No results"> when filteredGrpLabels.length === 0 and grpSearch !== ''
  </div>
```
