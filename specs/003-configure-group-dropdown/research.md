# Research: Configure Group Dropdown from Product Grouping

**Feature**: `specs/003-configure-group-dropdown`
**Date**: 2026-06-24

## Unknowns Resolved

No NEEDS CLARIFICATION markers were present in the spec. All decisions are derivable directly from the existing codebase.

---

## Decision Log

### D-001: Source of grouping data

**Decision**: Use `groupingLabel` already mapped in the `catalog` state (from `p.Grouping__c || p.Product_Grouping__c`) — no new API fields or service changes needed.

**Rationale**: The field is already fetched and stored in each catalog item. Using it directly avoids any new API surface and keeps the change within a single component.

**Alternatives considered**: Fetching a separate "product groupings" endpoint — rejected because the data is already present locally in the catalog state.

---

### D-002: Deduplication and sorting strategy

**Decision**: Use `useMemo` with `[...new Set(catalog.map(p => p.groupingLabel).filter(Boolean))].sort()` — identical in pattern to the existing `mfrs` and `fams` derived lists on lines 414–415 of `page.tsx`.

**Rationale**: Consistent with established patterns in the file. `Set` deduplicates, `.filter(Boolean)` removes empty/null/undefined, `.sort()` alphabetises. No external library needed.

**Alternatives considered**: Case-insensitive deduplication — assessed as out of scope for this change; existing `mfrs`/`fams` do not normalise casing, so this list follows the same convention.

---

### D-003: Replacement of hardcoded presets

**Decision**: Remove the three hardcoded preset `<div>` items (AV Components, Networking, Cables & Wiring) and the "Presets" section header. Replace with a mapped list of `grpLabels` items.

**Rationale**: The spec explicitly forbids hardcoded presets as the primary list (FR-002). When `grpLabels` is empty (catalog not loaded or no labels), the dropdown falls back to the custom input only, matching the edge-case requirement.

**Alternatives considered**: Keeping presets as fallback when `grpLabels` is empty — rejected because it would re-introduce hardcoded names. Only the custom input remains as fallback.

---

### D-004: Group color for catalog-derived groups

**Decision**: Use `'bg-gray-500'` as the default color (same as existing custom group creation) for all catalog-derived groups. No per-grouping color mapping.

**Rationale**: Color assignment per grouping label is not in scope per the spec assumptions. Consistent with existing `addGroup(customGrpName, 'bg-gray-500')` call.

**Alternatives considered**: Cycling through color classes per grouping index — rejected as over-engineering beyond spec scope.
