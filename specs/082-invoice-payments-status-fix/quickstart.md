# Quickstart: Validating the Invoice Payments Tab Status Badge Fix

## Prerequisites

- Local dev server running (`npm run dev`).
- Access to an Invoice detail page with at least one Applied Credit Payment row whose status is "Draft" (the exact bug reported), plus ideally a few rows with "Paid"/"Posted"/"Failed" to confirm no regression.
- Access to a Supplier Bill detail page's Payments tab, for the verification-only check.

## Scenario 1 — The reported bug is fixed

1. Open an Invoice detail page → Payments tab → Applied Credit Payments sub-tab.
2. Find (or create test data for) a row with status "Draft".
3. **Expected**: the status badge is blue, matching "Draft" everywhere else in the app (e.g. compare to the invoice's own header badge, or any other already-compliant page).
4. **Before this fix**: the same row shows gray — confirm this was the actual bug by checking the code path (`getStatusColor` had no `"draft"` rule) if a live "Draft" row isn't available.

## Scenario 2 — No regression on already-correct colors

1. In the same Applied Credit Payments sub-tab, and separately in the Receive Payments sub-tab, find rows with status "Paid", "Posted", "Completed", "Failed", or "Rejected".
2. **Expected**: each keeps the exact same color it showed before this fix (green for the first three, red for the last two) — the shared component's cases match the old local function's cases for all of these.

## Scenario 3 — Receive Payments sub-tab is also migrated (User Story 2)

1. Open the Receive Payments sub-tab.
2. **Expected**: every status renders via the shared badge component, same shape (`compact`) as the Applied Credit Payments sub-tab.
3. Run: `grep -n "getStatusColor" "app/invoices/[id]/components/InvoicePayments.tsx"` — **expected**: zero results (function fully deleted, not just unused).

## Scenario 4 — Supplier Bills side confirmed unaffected (User Story 3)

1. Open a Supplier Bill detail page → Payments tab → both sub-tabs (Bill Payments, Applied Debit Memos).
2. **Expected**: no visual change from before this feature — both already render via the shared component.
3. Run: `grep -n "StatusBadge\|getStatusColor" "app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx"` — **expected**: only `StatusBadge` matches, zero `getStatusColor` matches.

## Scenario 5 — Unrecognized status values (if any occur)

1. While testing Scenarios 1–3, note any status value that renders gray (the shared component's default) that you believe should have a specific color based on how it's used elsewhere in the app.
2. If found, this is the one open item flagged in `research.md` §5 (`"in progress"`/`"scheduled"`-shaped values) — triage into the correct existing color group rather than leaving it on the default, and document the resolution in `tasks.md`.

## Cross-cutting checks

- Toggle light/dark mode on the Applied Credit Payments and Receive Payments sub-tabs and confirm all badges remain legible.
- Confirm `npx tsc --noEmit` is clean after the fix.
- Check the four tracked sibling deployment folders for drift the same way as prior status-badge fixes (diff before copying, typecheck after, ask before commit/push).

## Done when

- All 5 scenarios above pass.
- The two greps in Scenarios 3 and 4 return exactly the expected results.
- "Draft" renders blue in the Applied Credit Payments sub-tab, and nothing else changed color that wasn't supposed to.
