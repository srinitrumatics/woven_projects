# Contract: `SortableHeader` Rendering Behavior

This is a UI component contract, not a network/API contract — it documents what every one of `SortableHeader`'s ~90+ call sites can rely on after this feature ships. Consumers pass the same props as today; nothing here changes the TypeScript prop interface.

## Prop interface (UNCHANGED)

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
    truncate?: boolean;
    style?: React.CSSProperties;
}
```

No prop is added, removed, or renamed. The `truncate` prop remains present for backward compatibility with the type signature, but per FR-002 it MUST NOT be relied on to produce ellipsis output — passing `truncate={true}` MUST NOT cause the label to render with a clipped/ellipsis line. (No current call site passes `truncate={true}`; this contract closes off that path for any future call site too.)

## Rendering guarantees (NEW, added by this feature)

1. **Single line**: For any `label` value, the rendered header text occupies exactly one line — never two or more.
2. **No ellipsis**: The rendered header text is never clipped with `text-overflow: ellipsis` or any visual truncation; the full string is always visible.
3. **No icon overlap**: The rendered header label's box and the sort icon's box never visually overlap, at the component's default width, at any `width` prop value, and after any `onResize`-driven resize.
4. **Width is a floor, not a ceiling**: If `width` (default or resized) is narrower than the label's natural single-line width, the rendered column widens to fit the label; if `width` is wider than the label needs, the column honors the wider requested value (existing behavior, unchanged).
5. **Icon visibility unaffected**: The sort icon (`↑`/`↓` when sorted, `↕` when not — always visible per the icon-visibility fix already shipped ahead of this feature) continues to render exactly as before; this feature does not change icon glyphs, color, or visibility rules, only the label's wrapping/width behavior around it.

## Non-goals / explicitly out of scope

- `components/ui/DataTable.tsx`'s `Th` (used for non-sortable static tables) is not covered by this contract — it has no sort icon and is out of scope per the spec's Key Entities definition.
- Body cell (`<td>`) rendering, truncation, or wrapping is unaffected — this contract covers header cells only.
