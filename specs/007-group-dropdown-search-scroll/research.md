# Research: Configure Order — Add Group Dropdown Search & Scroll

**Feature**: `specs/007-group-dropdown-search-scroll`
**Date**: 2026-06-24

## Unknowns Resolved

No NEEDS CLARIFICATION markers in spec. All decisions derivable from existing codebase and standard React patterns.

---

## Decision Log

### D-001: Where to add the search state

**Decision**: Add `const [grpSearch, setGrpSearch] = useState<string>('')` alongside the existing `grpDDOpen` and `customGrpName` state declarations at the top of `ConfigureOrderPage` (approximately line 31–33 of `app/configure/page.tsx`).

**Rationale**: Consistent with existing state declarations in the component. The search text is transient UI state scoped to the dropdown, same as `grpDDOpen` and `customGrpName`.

**Alternatives considered**: Using a `useRef` to avoid re-renders — rejected; the search text drives visible list content, so a state update that triggers a re-render is correct and necessary.

---

### D-002: Filtered list derivation — useMemo vs inline

**Decision**: Use `useMemo`:
```ts
const filteredGrpLabels = useMemo(
  () => grpLabels.filter(l => l.toLowerCase().includes(grpSearch.toLowerCase())),
  [grpLabels, grpSearch]
);
```

**Rationale**: Consistent with the pattern used for `mfrs`, `fams`, `filteredCatalog`, and `quickAddMatches` in the same file — all use `useMemo` for derived list computations. Also memoizes the filtered result so it is only recomputed when `grpLabels` or `grpSearch` changes.

**Alternatives considered**: Inline filter inside JSX — rejected; inconsistent with file conventions and recalculates on every render regardless of dependency changes.

---

### D-003: Scrollable container max-height

**Decision**: Wrap the `filteredGrpLabels.map(...)` list in `<div className="max-h-[180px] overflow-y-auto">`. Each item row is `py-2` (8px top + 8px bottom) plus text height (~20px) ≈ 36px. Five items × 36px = 180px.

**Rationale**: The spec says "approximately 5 items". 180px is a good fit for the current row height. The `overflow-y-auto` class shows a scrollbar only when content overflows, satisfying FR-008 (no scrollbar when ≤ 5 items).

**Alternatives considered**: `max-h-40` (160px = ~4.4 items) — rejected; slightly too tight. `max-h-48` (192px = ~5.3 items) — acceptable alternative; chosen 180px as exact 5-item equivalent.

---

### D-004: Search input auto-focus

**Decision**: Use the `autoFocus` prop on the search input element. Since the entire dropdown conditionally renders with `{grpDDOpen && (...)}`, the input mounts fresh each time the dropdown opens, so `autoFocus` fires on every open without needing a `useRef` + `useEffect`.

**Rationale**: Simple, no extra ref management. The `autoFocus` attribute works correctly in React for elements that mount when a condition becomes true.

**Alternatives considered**: `useRef` + `useEffect(() => ref.current?.focus(), [grpDDOpen])` — rejected; more code for the same result.

---

### D-005: Search reset on dropdown close

**Decision**: Add `useEffect(() => { if (!grpDDOpen) setGrpSearch(''); }, [grpDDOpen])` to reset `grpSearch` when the dropdown is closed.

**Rationale**: The spec (FR-010) requires the search box to reset to empty for the next open. Tying the reset to `grpDDOpen` becoming `false` is the cleanest approach — it covers all close paths (outside-click via the `onClick` handler on the page wrapper, and button toggle).

**Alternatives considered**: Resetting `grpSearch` inside each close path manually — rejected; fragile, easy to miss a close path.

---

### D-006: "No results" display

**Decision**: When `filteredGrpLabels.length === 0` and `grpSearch.length > 0`, render:
```tsx
<div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">No results</div>
```
in place of the empty items list (inside the scrollable container).

**Rationale**: FR-004 requires a non-blank "No results" state. Using a simple italic muted text is consistent with the minimal aesthetic of the existing dropdown (no icon, no elaborate empty-state component).

**Alternatives considered**: Hiding the entire "Product Groups" section when no results — rejected; the search input would disappear mid-typing, which is jarring UX.

---

### D-007: Custom section positioning relative to scroll container

**Decision**: The "Custom" header and input row live **outside and below** the scrollable container. The JSX structure is:

```
<div> {/* outer dropdown panel */}
  {grpLabels.length > 0 && (
    <>
      <div> {/* "Product Groups" header */} </div>
      <div> {/* search input */} </div>
      <div className="max-h-[180px] overflow-y-auto"> {/* scrollable items */}
        {filteredGrpLabels.map(...) or "No results"}
      </div>
    </>
  )}
  <div> {/* "Custom" header */} </div>
  <div> {/* custom input + Add button */} </div>
</div>
```

**Rationale**: FR-009 requires the custom input to always be visible regardless of scroll position. Placing it outside the scroll container guarantees it stays fixed at the bottom of the dropdown panel.
