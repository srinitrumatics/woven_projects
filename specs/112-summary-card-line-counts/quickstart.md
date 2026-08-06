# Quickstart: Validate the Summary Card Products/Services Fix

## Prerequisites

- Local checkout of this branch with the fix applied.
- `npm install` already run.
- A running dev server (`npm run dev`) with a valid Salesforce-connected portal session, per this project's established manual-verification convention (no automated UI test suite exists — see `research.md` Decision 4).
- At least one Customer Order, Customer Quote, Invoice, and Supplier Bill with 2+ lines to inspect (a real service line, i.e. one with `Product_Record_Type__c === 'Services'`, was not found in the test org's data during planning — if one still doesn't exist by verification time, the zero-service-lines case below is the achievable check; re-run the mixed-lines scenarios once one does exist).

## 1. Type-check

```bash
npx tsc --noEmit
```

**Expected**: no new type errors from the four new `productRecordType?: string` interface fields.

## 2. Direct API spot-check (no UI needed)

For any one Order/Quote/Invoice/Supplier Bill line list, confirm the live response includes `Product_Record_Type__c` on each line (already confirmed present during planning — this just re-confirms against current data):

```bash
curl -s "http://localhost:3000/api/salesforce/orders?accountId=<id>&orderId=<id>&contactId=<id>&action=orderlines" -H "Cookie: wovn_main_session=<session>" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>JSON.parse(d).forEach(l=>console.log(l.Id, l.Product_Record_Type__c)))"
```

Repeat with the equivalent `action=quotelines` (Quote), `action=lines` (Invoice), and `action=lines&tabName=Products` (Supplier Bill / Purchase Order) endpoints.

## 3. Manual browser verification — one page per document type

For each of the four fixed pages, open a document with 2+ lines and confirm:

| Page | URL pattern | What to confirm |
|---|---|---|
| Customer Order | `/orders/[id]` | A Services row now exists beneath Products, both showing a count + subtotal; their counts sum to the order's total line count |
| Customer Quote | `/quotes/[id]` | Products row's count/subtotal no longer includes the lines already reflected in Services; counts sum to the quote's total line count |
| Invoice | `/invoices/[id]` | Services row is no longer a fixed `(0)` — it reflects the invoice's actual lines; Products excludes those same lines |
| Supplier Bill | `/supplier-bills/[id]` | Products count no longer silently absorbs service lines; counts sum to the bill's total line count |

For each, also verify the arithmetic invariant directly: Products subtotal + Services subtotal should equal the page's own displayed overall/lines subtotal (per FR-005).

## 4. Regression check — Purchase Order and Proposal unchanged

Open one Purchase Order (`/purchase-orders/[id]`) and one Proposal (`/proposals/[id]`) that were working correctly before this change, and confirm their Products/Services counts and subtotals are pixel-for-pixel identical to before (per FR-006 / SC-005). Since neither `POSummary.tsx` nor `ProposalSummary.tsx` is touched by this fix, this should require no behavior change at all — it's a sanity check that nothing else on those pages regressed incidentally.

## 5. Edge cases

- Open (or find) a document of each of the four types with **zero** lines, or lines that are all products with no services: confirm the Services row shows `(0) Services - Subtotal — $0.00` rather than a missing row, a stale value, or an error.
- If/when a document with a genuine `Product_Record_Type__c === 'Services'` line becomes available in the org's data, re-run step 3 on that specific document to confirm a real non-zero Services count renders correctly (this could not be exercised during planning — see Prerequisites).

## Rollback

This is a frontend-only data-mapping and presentation fix — no schema, migration, or Salesforce-side change. Reverting the commit(s) fully undoes it.
