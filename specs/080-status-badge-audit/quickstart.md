# Quickstart: Validating the Status Badge Compliance Audit Fixes

## Prerequisites

- Local dev server running (`npm run dev`).
- Access to at least one record of each type touched: Order, Proposal (including its Line detail page's Returns tab), Quote, Purchase Order, Invoice, Shipment, Supplier Bill.
- Ideally a record whose status is one of the 8 conflict-resolution cases in `data-model.md` (e.g. an Order Fulfillment sub-table row with `Shipped`, `Allocated`, or `Open`; a PO with `Acknowledged` status) to directly observe the intentional color change.

## Scenario 1 — No visual regression on non-conflicting statuses

1. Before making any code change, note the current color of a status that isn't in the conflicts table (e.g. a Purchase Order Debit Memo line showing "Paid" — green) on each of the 14 files being migrated.
2. After migrating, revisit the same page and confirm the color is unchanged.
3. **Expected**: pixel-for-pixel same color; only the underlying code changed.

## Scenario 2 — Documented color changes land exactly where expected

1. Using `data-model.md`'s "Conflicts resolved" table, visit the Order detail page's Fulfillment tab and find (or create test data for) rows with `Shipped`, `In Progress`, `Allocated`, `Open`, and `Draft` statuses.
2. **Expected**: `Shipped` → green, `In Progress` → yellow, `Allocated` → blue, `Open` → blue, `Draft` → blue — matching the shared component's existing colors, not the tab's old local ones.
3. Visit the Order detail page's Returns tab and confirm `Submitted` → blue, `Draft` → blue.
4. Visit a Purchase Order with `Acknowledged` status and confirm its header badge now shows green, not blue.
5. Visit a Proposal with `Draft` status and confirm its header badge now shows blue, not gray.

## Scenario 3 — Under-coverage is fixed, not just recolored

1. Find an Invoice with a line-item or credit-memo status other than the few each file used to explicitly handle (e.g. any status besides `Paid`/`Settled`/`Approved` for line items, or besides `Posted` for credits).
2. **Expected**: the badge shows its real, correct color from the shared component's full vocabulary — not the old fallback blue.
3. Repeat for a Proposal or Quote header with a status other than `Draft`/`Pending`/`Approved`/`Rejected` (e.g. `Under Review`, `Expired`, `Sent` — all already in the shared vocabulary).

## Scenario 4 — Net-new statuses render correctly

1. Find (or note the expected rendering for) a Shipment with status `Pending Shipment` on its detail-page header. **Expected**: yellow, same group as `Pending`.
2. Find a Proposal Project with status `New` or `On Hold`. **Expected**: `New` → blue, `On Hold` → orange.

## Scenario 5 — Badge shape is preserved per page

1. Open the Order Fulfillment/Returns tabs (`compact`), a Proposal or Quote header (`pill`), and a PO header or PO line-detail related-record table (`bordered`).
2. **Expected**: each retains its pre-existing shape family (small non-fully-rounded / plain rounded-full / bordered rounded-full box) — none changed shape as a side effect of sharing color logic. Minor padding differences that already existed (documented in `research.md` §6) are expected and not a regression.

## Scenario 6 — Confirmed exceptions are untouched

1. Invoices list → confirm `CollectionStatusBadge` (Paid/Pending/Past Due) still renders exactly as before.
2. Invoice detail → Payments tab → confirm payment/transaction status colors are unchanged.
3. Any page using `RemittanceBadge` → confirm unchanged.

## Scenario 7 — No independent local implementations remain (for this feature's 14 files)

1. Run, from the repo root:
   ```
   grep -rl "function StatusBadge\|const StatusBadge\|const statusBadge\|function RemittanceBadge" \
     "app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx" \
     "app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx" \
     "app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx" \
     "app/orders/[id]/components/FulfillmentTab.tsx" \
     "app/orders/[id]/components/ReturnsTab.tsx" \
     "app/supplier-bills/page.tsx"
   ```
2. **Expected**: zero results.
3. Run `grep -n "getStatusColor" "app/proposals/[id]/components/ProposalHeader.tsx" "app/purchase-orders/[id]/components/POHeader.tsx" "app/quotes/[id]/components/QuoteHeader.tsx" "app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx" "app/proposals/[id]/components/ProjectsTab.tsx" "app/invoices/[id]/components/InvoiceCredits.tsx" "app/invoices/[id]/components/InvoiceLineItems.tsx" "app/shipments/[id]/components/ShipmentHeader.tsx" "app/proposals/[id]/components/ProposalDetails.tsx"` and confirm zero results (all deleted, not just unused).

## Scenario 8 — Spot-checks resolved

1. Open `app/invoices/page.tsx`, `app/orders/page.tsx`, and `app/purchase-orders/[id]/lines/[lineid]/page.tsx` and confirm the ternary matched by the sweep is genuinely unrelated to status-badge rendering (per `research.md` §2's low-risk classification), or migrate it too if it turns out not to be.

## Cross-cutting checks

- Toggle light/dark mode on a few pages of each variant (`pill`/`bordered`/`compact`) and confirm all remain legible.
- Confirm `npx tsc --noEmit` is clean after all 14 files are migrated and `ProposalDetails.tsx`'s dead code is deleted.
- Check the four tracked sibling deployment folders for drift the same way as prior status-badge fixes (diff before copying, typecheck after, ask before commit/push).

## Done when

- All 8 scenarios above pass.
- The two greps in Scenario 7 return nothing.
- Every documented color change and net-new status (`data-model.md`) is visible exactly where expected, and nowhere else.
- The 3 flagged spot-check files (Scenario 8) are resolved one way or the other, not left unexamined.
