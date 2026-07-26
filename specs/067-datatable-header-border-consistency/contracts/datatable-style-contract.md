# UI Contract: Shared Data Table Styling

This is not a network/API contract — it is the interface contract every page in the web app relies
on when it imports the shared table primitives from `components/ui/DataTable.tsx`. Any page using
this contract correctly, unmodified, automatically gets the standardized look; no per-page styling
should be required beyond following the wrapper structure below.

## Guaranteed wrapper structure

Consumers MUST render tables using this structure (or the equivalent centralized helper, if one is
introduced during implementation) to receive the standardized styling:

```tsx
<div className="rounded-lg shadow-sm overflow-hidden"> {/* outer: corner rounding, no border */}
  <div className="overflow-x-auto">                     {/* inner: horizontal scroll boundary */}
    <Table>
      <THead>                                             {/* sticky/pinned-header safe */}
        <tr>...</tr>
      </THead>
      <TBody>                                              {/* row bottom borders via divide-y */}
        <Tr>...</Tr>
      </TBody>
    </Table>
  </div>
</div>
```

## Component-level guarantees (post-fix)

| Component | Guarantee |
|---|---|
| `Table` | Renders `w-full`; does not itself add border or rounding (rounding/border responsibility lives on the outer wrapper `<div>` per the structure above) |
| `THead` | Retains `bg-primary-light dark:bg-gray-900`; corner rounding is achieved via the outer wrapper's `rounded-lg overflow-hidden`, not a class on `THead` itself |
| `TBody` | Retains `divide-y divide-gray-200 dark:divide-gray-700`, guaranteeing a bottom border under every row including the last |
| `Tr` | No change — hover state only; row border comes from `TBody`'s `divide-y` |
| `Th` / `Td` | No change — padding/typography only; unaffected by this contract |

## Consumer obligations

- MUST NOT add a `border` (all-sides) utility class to the outer wrapper `<div>`.
- MUST wrap the scrollable table in an outer `rounded-lg shadow-sm overflow-hidden` div and an
  inner `overflow-x-auto` div (two-level wrapper), matching the pattern already proven compatible
  with sticky headers in `ElementsTab.tsx` / `TaxesTab.tsx`.
- MAY add `sticky top-0 z-20` (or similar) to `THead` for pinned-header behavior — this is
  independent of and compatible with the outer rounding wrapper.
- Empty-state (`TableEmptyState`) and loading-state (`TableLoadingState`) views MUST be rendered
  inside the same outer wrapper, not as a full replacement that bypasses it.

## Non-shared consumer: `components/UserManagement/UserList.tsx`

This component does not import `components/ui/DataTable.tsx`; it renders equivalent raw
`<table>`/`<thead>`/`<tbody>` markup. It MUST independently match the same guarantees above
(rounded-corner wrapper, no outer border, `divide-y` row borders) using the same literal Tailwind
classes, so it is visually indistinguishable from shared-primitive tables.

## Explicitly out of contract

- `app/orders/[id]/components/PDFTemplate.tsx` — renders a printed/exported document, not an
  on-screen browsing table; not bound by this contract.
