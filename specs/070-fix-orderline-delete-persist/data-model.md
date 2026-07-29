# Phase 1 Data Model: Fix Order Line Deletion Not Persisting on Save

No new entities, fields, or persisted state are introduced by this fix. This document describes the existing entities relevant to the delete/save/reload flow, as a reference for implementation — all types already exist in `app/orders/types.ts` and are populated from Salesforce via `lib/salesforce-service.ts`.

## Entity: Order Line (client-side `Product`, `app/orders/types.ts`)

Represents a single line item on an order, as held in the order details page's `orderProducts` React state array.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Salesforce Product record ID |
| `orderLineId` | `string?` | Salesforce order line record ID; **presence of this field is the signal that the line already exists in Salesforce** — its absence means the line is only local (added, not yet saved) |
| `lineItemKey` | `string?` | Client-only synthetic key (`${id}-${Date.now()}-${random}`) used to target a specific row for delete/quantity-change actions; never sent to the backend |
| `orderQty` | `number` | Current quantity for this line |
| `subtotal` | `number` | `unitPrice * orderQty` (client-computed) |
| `unitPrice`, `listPrice`, `moq`, `availableQty`, `brand`, `sku`, etc. | various | Display/catalog fields, unrelated to this fix |

**State transitions relevant to this fix**:

1. **Present, persisted** (`orderLineId` set) → user clicks delete → confirm dialog → **Deleting** (in-flight `DELETE` request) → **Deleted** (removed from `orderProducts` state) *only after* the delete request is confirmed successful (Decision 1 in `research.md` changes what "confirmed successful" means — response body, not just HTTP status).
2. **Present, local-only** (`orderLineId` absent, i.e., added this session but not yet saved) → user clicks delete → removed from `orderProducts` state immediately, no backend call (nothing to delete server-side yet).
3. On page load/reload/reopen, `orderProducts` is **fully replaced** (not merged) from a fresh `GET .../orders?...&action=orderlines` call (`page.tsx:941`) — so the source of truth for what's displayed is always whatever the last completed fetch returned.

## Entity: Order (`app/orders/types.ts` `Order`, `OrderDetail`, `SalesforceOrder`)

The parent order record. Not modified by this fix beyond ensuring its `orderLines` collection (built from `orderProducts` at save time, `page.tsx:1375-1389`) never includes a line the user has already confirmed-deleted, which is already the case in the normal flow (delete removes the line from `orderProducts` before Save reads it) — the fix targets the *confirmation reliability* of that delete, and the *race window* around concurrent edits (Decision 3), not the save payload construction itself.

## Relationships

- One **Order** has many **Order Lines** (1:N), keyed by `orderLineId` (Salesforce) / `lineItemKey` (client).
- Order Lines are deleted individually and independently — deleting one has no defined effect on any other line (per spec Assumptions and User Story 2).
