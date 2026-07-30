# Data Model: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

No new persisted entity, field, or table. This feature changes an existing UI state machine and narrows an existing status-based business rule; the underlying `Purchase Order Line` record shape is unchanged.

## Existing entity referenced (rule changed)

- **Purchase Order Line** (`lib/purchase-order-service.ts`, `PurchaseOrderLine` type in `app/purchase-orders/types.ts`): `status` (`Status__c`) continues to gate whether `promiseDate`/`trackingNumber` may be edited and saved. The set of statuses considered editable narrows from `{Draft, Approved, Awarded}` to `{Draft, Approved}`, enforced identically on both the page (`isLineEditable`) and the API route (`EDITABLE_LINE_STATUSES`).

## UI state machine (new, page-local — not persisted)

A single boolean, `isEditing`, governs the page's editing mode for the Promise Date and Tracking Number fields on an editable-status (Draft/Approved) line. Non-editable-status lines never enter this machine — no Edit icon is ever shown.

| State | Entered via | Fields shown | Header controls | Exits to |
|---|---|---|---|---|
| **Read-only** (initial) | Page load, or Cancel, or a successful Save | Promise Date / Tracking Number render read-only, like every other field | Edit icon (Draft/Approved only) | → Editing (click Edit) |
| **Editing** | Click Edit icon | Promise Date / Tracking Number render as live inputs; all other fields stay read-only | Cancel + Save buttons | → Read-only (Cancel, or Save success) · stays in Editing (Save failure) |
| **Saving** (transient, `saving` flag already exists) | Click Save | Same as Editing | Save button disabled/labeled "Saving…" | → Read-only (success) · → Editing with error shown (failure) |

Transitions:
- `Read-only --(click Edit)--> Editing`: only reachable when `isLineEditable` is true (status is Draft or Approved).
- `Editing --(click Cancel)--> Read-only`: `promiseDate`/`trackingNumber` reset to `savedPromiseDate`/`savedTrackingNumber`; no request sent.
- `Editing --(click Save, succeeds)--> Read-only`: `savedPromiseDate`/`savedTrackingNumber` updated to the response values; `isEditing` set to `false`.
- `Editing --(click Save, fails)--> Editing`: `saveError` populated; `promiseDate`/`trackingNumber` (the unsaved, entered values) are left untouched so the user can retry.
- `Editing --(navigate Prev/Next line)--> Read-only` (new line): `isEditing` resets to `false` on line change, same as today's per-line state reset in the existing `useEffect` keyed on `[lines, currentLineIndex]`.
