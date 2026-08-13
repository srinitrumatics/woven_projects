# Component Contract: `SortableHeader`

This isn't a network/API contract — it's the internal component interface that ~90 call sites across the webapp depend on. The fix in this feature MUST NOT change this contract; only the internal rendering (Tailwind classes / JSX structure inside the `<th>`) may change.

## Props (unchanged by this feature)

```ts
interface SortableHeaderProps {
    label: string;
    field: string;
    sortConfig?: SortConfig<any> | null;
    requestSort?: (key: any) => void;
    className?: string;
    align?: 'left' | 'right' | 'center';
    width?: string | number;
    onResize?: (field: string, newWidth: number) => void;
    truncate?: boolean;   // retained for backward compatibility; no caller currently sets it.
                           // Semantics unchanged: true = ellipsis (existing behavior, unused
                           // by any current call site); false/default = full text, no ellipsis.
                           // This feature changes what "no ellipsis" renders as (wrap instead
                           // of unclipped nowrap) — it does not add, remove, or rename a prop.
    style?: React.CSSProperties;
}
```

## Behavioral contract

- **Given** any current call site passing any subset of the props above, **when** this fix ships, **then** the component continues to accept the exact same props with the exact same types — no call site needs to change.
- **Given** `truncate` is omitted or `false` (every current call site), **when** the header renders, **then** the full label is shown, wrapping onto additional lines if the column is too narrow, and never overlapping the sort icon.
- **Given** `truncate={true}` (hypothetical/future use), **when** the header renders, **then** existing ellipsis behavior is unchanged (out of scope for this fix; no current caller uses it).
- **Given** `onResize` is provided, **when** the user drags the resize handle to any width down to the existing 50px floor, **then** the resize handle, label, and icon all remain usable and non-overlapping.
- **Given** `sortConfig`/`requestSort` are provided, **when** the column is clicked, **then** existing sort-cycling behavior (asc/desc/unsorted) is unchanged.

## Out of scope

- No new props are introduced.
- No page-level (`app/**`) call site needs a code change to adopt this fix — it is transparent to consumers.
