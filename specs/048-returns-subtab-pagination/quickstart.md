# Quickstart: Validate Returns Sub-Tab Pagination

## Prerequisites

- Repo checked out on branch `048-returns-subtab-pagination` (or wherever this fix lands)
- `npm install` already run
- An order account type other than "Customer"/"NSO" (the Debit Memos and RTV sub-tabs are
  hidden entirely for Customer/NSO accounts — see `isCustomerOrNSO` in `ReturnsTab.tsx`) with
  more than 10 debit memos and/or more than 10 RTVs on at least one order, to visibly
  demonstrate paging. If no such record exists, temporarily lower `ITEMS_PER_PAGE` in
  `ReturnsTab.tsx` locally while testing (revert before committing).

## Setup

```bash
npm run dev
```

Open http://localhost:3000, log in with a non-Customer/non-NSO account, and navigate to an
order with returns data.

## Validation Scenarios

### 1. Debit Memos and RTV sub-tabs now page their rows

1. Open the order's **Returns** tab.
2. Click the **Debit Memos** sub-tab. Confirm only 10 rows show, with a "Showing 1 to 10 of N"
   summary and Prev/page-number/Next controls, matching the look of the RMAs sub-tab.
3. Click a page number or Next; confirm the row set updates.
4. Repeat for the **RTV** sub-tab.

**Expected outcome**: both sub-tabs page in groups of 10 with working navigation, matching
RMAs and Credit Memos.

### 2. Switching sub-tabs resets the page

1. On the Debit Memos sub-tab, navigate to page 2 or later.
2. Switch to a different sub-tab (e.g. RMAs), then switch back to Debit Memos.
3. Confirm Debit Memos is back on page 1.
4. Repeat for RTV.

**Expected outcome**: both sub-tabs return to page 1 on re-entry, matching RMAs/Credit Memos.

### 3. Sorting does not reset the page (matches existing sibling behavior)

1. On the Debit Memos sub-tab, navigate to page 2.
2. Click a column header to sort.
3. Confirm the view stays on page 2, now showing that page's slice of the newly-sorted rows
   (not reset to page 1) — exactly like clicking a column header on the RMAs sub-tab while on
   page 2 today.

**Expected outcome**: no page reset on sort, consistent with RMAs/Credit Memos.

### 4. Pagination stays outside horizontal scroll

1. On the Debit Memos (or RTV) sub-tab, scroll the table horizontally if it's wide enough.
2. Confirm the pagination bar below the table does not move or hide.

**Expected outcome**: pagination bar always reachable, matching the rule from
`044-table-scroll-pagination-fix`.

### 5. No regressions

1. Confirm RMAs and Credit Memos sub-tabs still page, sort, and resize exactly as before.
2. Confirm Debit Memos/RTV columns, hyperlinks (e.g. Customer Order links), sorting, and
   column resizing are all unchanged apart from the new pagination.

## Done Criteria

All five scenarios pass — matching SC-001 through SC-003 in [spec.md](./spec.md).
