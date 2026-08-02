# Quickstart: Validating the Line Detail Status Badge Fixes

## Prerequisites

- Local dev server running (`npm run dev`).
- Access to at least one record of each type touched: a Proposal line detail page, a Quote line detail page, an Invoice line detail page.
- Ideally records whose related sub-tables (Quotes, Sales Orders, Invoices, Shipping Manifests, Purchases, Supplier Bills, RMAs, RTVs, Credit Memos, Debit Memos) have varying statuses, to see more than one color.

## Scenario 1 — Plain text becomes a colored badge

1. Open a Proposal's line detail page (`/proposals/[id]/lines/[lineid]`) → Fulfillments tab. Before the fix, the Quotes/Sales Orders/Invoices/Shipping Manifests sub-tables show status as plain unstyled text.
2. After the fix, each status renders as a `compact`-variant colored badge, matching `LineReturnsTab.tsx`'s badge shape on the same page.
3. Repeat for the Purchases tab (Purchases and Bills sub-tables).
4. Open a Quote's line detail page (`/quotes/[id]/lines/[lineid]`) → each of the 9 fixed sub-tabs (Credit Memo, Debit Memo, Invoice, Purchase Order, RMA, RTV, Sales Order, Shipping Manifest, Supplier Bill Lines) shows status as a `bordered`-variant badge, matching the page's own product-status badge shape.
5. Open an Invoice's line detail page (`/invoices/[id]/lines/[lineid]`) → Credit Memo tab shows status as a `pill`-variant badge, matching the page's own product-status badge shape.

## Scenario 2 — Colors match the shared vocabulary, nowhere invented

1. For each fixed sub-tab, find rows with a few different statuses (e.g. `Draft`, `Approved`, `Shipped`, `Cancelled`).
2. **Expected**: each color matches what that exact status shows anywhere else in the app (e.g. compare a `Draft` badge here to the `Draft` badge on the parent Proposal/Quote header) — per `components/ui/StatusBadge.tsx`'s existing switch statement.
3. If any status renders gray (the shared default) and that status clearly has a home in an existing color group elsewhere in the app, flag it — this is the one case where `components/ui/StatusBadge.tsx` itself would need a new `case` entry (FR-004). Not expected per `research.md` §4, but not assumed either.

## Scenario 3 — Badge shape is preserved per page (no forced global uniformity)

1. Compare the Proposal line detail page's Fulfillments/Purchases tabs (`compact`) against the Quote line detail page's sub-tabs (`bordered`, no `variant` prop) against the Invoice line detail page's Credit Memo tab (`pill`).
2. **Expected**: each matches its own page's already-established shape, not a single blanket shape across all three modules — per spec FR-006 and `research.md` §3.

## Scenario 4 — Secondary status-like columns stay untouched

1. Open the Proposal line's Purchases tab and the Quote line's Purchase Order Lines sub-tab.
2. **Expected**: the `Tracking Status` and `Invoice Status` columns still render as plain text via `displayCell()` — unchanged, per FR-007. Only the primary `Status` column gains a badge.

## Scenario 5 — No new duplicate implementation introduced

1. Run, from the repo root:
   ```
   grep -l "StatusBadge" \
     "app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx" \
     "app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx" \
     "app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx" \
     "app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx"
   ```
2. **Expected**: all 12 files listed (each now imports the shared component — none define a local one).
3. Run `grep -rn "getStatusColor\|const StatusBadge\|function StatusBadge" app/*/\[id\]/lines/\[lineid\]/` and confirm zero results across all `lines/[lineid]` folders (not just the 12 fixed here) — a final cross-check that this feature didn't leave a stray local implementation anywhere in scope.

## Cross-cutting checks

- Toggle light/dark mode on each of the three shapes (`compact`/`bordered`/`pill`) and confirm all remain legible.
- Confirm `npx tsc --noEmit` is clean after all 12 files are fixed.
- Check the four tracked sibling deployment folders for drift the same way as prior status-badge fixes (diff before copying, typecheck after, ask before commit/push).

## Done when

- All 5 scenarios above pass.
- The full-repo grep in Scenario 5 confirms zero stray local implementations remain in any `lines/[lineid]` folder.
- Every one of the 17 render sites shows a colored badge, matching its page's own shape convention and the shared component's existing colors.
