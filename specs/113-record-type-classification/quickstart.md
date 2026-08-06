# Quickstart: Validate the Shared Product/Service Classification Fix

## Prerequisites

- Local checkout of this branch with the fix applied.
- `npm install` already run.
- A running dev server (`npm run dev`) with a valid Salesforce-connected portal session (no automated UI test suite exists — see `research.md`).
- Proposal `a1EQL0000056p6b2AA` (2 lines, both classified `Digital`) — the specific document that demonstrates the bug this feature fixes. If it's no longer available, any Proposal with lines classified other than literally `Product` or `Services` (e.g. `Bundle`, `Kit`, `Digital`) will do.
- The same Order, Quote, Invoice, and Supplier Bill documents used to verify `112`, to directly compare before/after figures.

## 1. Type-check

```bash
npx tsc --noEmit
```

**Expected**: no new type errors from the new `lib/utils/product-record-type.ts` module or its six call sites.

## 2. Proposal — the actual bug fix

Open `/proposals/a1EQL0000056p6b2AA` (or another Proposal with non-`Product`/non-`Services` lines).

**Expected**: the Products row's count is no longer `0` — it includes every line whose classification isn't `Services`. Products count + Services count equals the proposal's total line count (previously, non-`Product` lines vanished from both rows).

## 3. Order, Quote, Invoice, Supplier Bill, Purchase Order — no visible change

Open one of each on the same documents verified in `112`, and confirm the Products/Services counts and subtotals are pixel-for-pixel identical to before this change (spec FR-006/SC-003):

| Page | URL pattern |
|---|---|
| Order | `/orders/[id]` |
| Quote | `/quotes/[id]` |
| Invoice | `/invoices/[id]` |
| Supplier Bill | `/supplier-bills/[id]` |
| Purchase Order | `/purchase-orders/[id]` |

For each, also re-verify the arithmetic invariant: Products count + Services count = total line count, and Products subtotal + Services subtotal = overall lines subtotal (spec FR-005).

## 4. Edge case — unknown classification value

If a document with a line classified as something other than the eight known values is available (or can be simulated), confirm it counts toward Products rather than vanishing from both rows (spec FR-003, Edge Cases) — this is what the negative-match design in `isServiceRecordType` guarantees structurally rather than through an explicit fallback branch.

## Rollback

This is a frontend-only data-mapping fix — one new utility module plus six call-site edits, no schema, migration, or Salesforce-side change. Reverting the commit(s) fully undoes it.
