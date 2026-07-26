# UI Contract: Shared Data Table Styling (re-affirmed)

This is not a network/API contract — it is the same interface contract defined in
`specs/067-datatable-header-border-consistency/contracts/datatable-style-contract.md`. This
feature does not change the contract; it brings the two remaining non-conforming consumers into
compliance with it.

## Guaranteed wrapper structure (unchanged)

```tsx
<div className="rounded-lg shadow-sm overflow-hidden"> {/* outer: corner rounding, no border */}
  <div className="overflow-x-auto">                     {/* inner: horizontal scroll boundary */}
    <Table>
      <THead>...</THead>
      <TBody>...</TBody>
    </Table>
  </div>
</div>
```

Empty-state (`TableEmptyState`) and loading-state (`TableLoadingState`) containers follow the same
outer wrapper structure — `rounded-lg shadow-sm`, no `border` — rather than a bespoke wrapper.

## Consumer obligations (unchanged, re-affirmed)

- MUST NOT add a `border` (all-sides) utility class to the outer wrapper `<div>`, in either the
  populated-table or the empty/loading-state wrapper.
- MUST use `rounded-lg shadow` / `shadow-sm` for corner rounding and visual separation.

## Consumers being brought into compliance by this feature

| File | Wrapper(s) affected |
|---|---|
| `app/configure/ConfigureOrderClientPage.tsx` | Populated-table wrapper (~line 642) |
| `app/proposals/[id]/components/FulfillmentsTab.tsx` | 4 empty-state wrappers |
| `app/proposals/[id]/components/PurchasesTab.tsx` | 2 empty-state wrappers |

No other consumers are expected to require changes under this contract — see `research.md` for
the audit confirming this.
