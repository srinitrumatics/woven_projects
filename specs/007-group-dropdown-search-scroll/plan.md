# Implementation Plan: Configure Order — Add Group Dropdown Search & Scroll

**Branch**: `wovn_mathu` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-group-dropdown-search-scroll/spec.md`

## Summary

Add a real-time search input and a scroll-capped list to the "Product Groups" section of the "+ Add Group" dropdown in `app/configure/page.tsx`. When the dropdown has more than 5 group items, the list is constrained to a fixed max-height with overflow scroll; when the user types in the search box, the visible list is filtered to matching items. The "Custom" input section remains fixed below the scrollable area at all times.

**Changes required** (all in `app/configure/page.tsx`):

| Change | Detail |
|--------|--------|
| Add `grpSearch` state | `useState<string>('')` — holds the current search text; resets to `''` when `grpDDOpen` becomes `false` |
| Add `filteredGrpLabels` derived value | `useMemo(() => grpLabels.filter(l => l.toLowerCase().includes(grpSearch.toLowerCase())), [grpLabels, grpSearch])` |
| Add search input to JSX | Inside the `grpLabels.length > 0` block, above the items list: a text `<input>` bound to `grpSearch`, `autoFocus`, dark-mode styled |
| Wrap items list in scrollable container | Wrap the `filteredGrpLabels.map(...)` div in a `div` with `max-h-[180px] overflow-y-auto` (≈ 5 × 36px items) |
| Add "No results" fallback | When `filteredGrpLabels.length === 0` and `grpSearch` is non-empty, render a "No results" message in place of the items |
| Reset `grpSearch` on close | Add a `useEffect` that calls `setGrpSearch('')` when `grpDDOpen` becomes `false` |

## Technical Context

**Language/Version**: TypeScript / React 18, Next.js 15 (App Router)

**Primary Dependencies**: `useState`, `useEffect`, `useMemo` (already imported), Tailwind CSS (already in use)

**Storage**: N/A — no database changes

**Testing**: Manual browser validation

**Target Platform**: Web browser (Next.js client component)

**Project Type**: Next.js 15 web application — single client component JSX edit

**Performance Goals**: Filtering must be instant (client-side, no debounce needed for lists ≤ 100 items)

**Constraints**:
- Max-height equivalent to 5 items (approx `180px` at ~36px per item); adjust if item height differs at runtime
- Search is case-insensitive substring match — no fuzzy logic
- `grpSearch` state resets to empty string on dropdown close (so the next open starts fresh)
- `autoFocus` on search input when dropdown opens — no extra ref management needed
- Dark mode classes must match existing dropdown Tailwind classes
- The "Custom" section (`div.px-3.py-2` header + `div.p-2.flex.gap-2` row) stays **outside** the scrollable container

**Scale/Scope**: JSX changes in one `{grpDDOpen && ...}` block + two new state/derived declarations.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No new API call. Filtering is a client-side transformation of already-fetched `grpLabels`. |
| II. RBAC-First Feature Design | ✅ Pass | No new UI surface or permission surface. The dropdown already requires an authenticated session to load picklist data. |
| III. Next.js 15 App Router Patterns | ✅ Pass | Client component, no route param changes, no new API route. |
| IV. Multi-Tenant Isolation | ✅ Pass | Client-side filter over data already scoped to the authenticated org. |
| V. Simplicity & Phase-Driven Scope | ✅ Pass | Two state declarations + one useMemo + minimal JSX additions. No abstraction. |

**Gate result**: All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-group-dropdown-search-scroll/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/configure/
└── page.tsx             # Only file changed — state + useMemo + JSX edits in dropdown block
```

**Structure Decision**: Single-file edit. No new files in source tree.

## Complexity Tracking

> No constitution violations. Table not applicable.
