# Phase 0 Research: Invoice Landing Page — Required Corrections

**Status**: Complete — full audit of `app/invoices/page.tsx` (widths config, data mapping, header row, body row), cross-referenced against the Invoice Detail page's own mapping of the same `Invoice__c` object (`app/invoices/[id]/page.tsx`), and against the field-naming conventions already proven across sibling list pages (`app/proposals/page.tsx`, `app/quotes/page.tsx`, `app/orders/[id]/components/FulfillmentTab.tsx`, `app/purchase-orders/[id]/components/*Table.tsx`).

No live Salesforce org verification was performed for this feature (unlike feature 022, which had org access at implementation time) — field-name decisions below are grounded in existing, already-shipped code in this repository rather than a live `describe` call. Where a field is genuinely unconfirmed, that is called out explicitly so it can be verified against the live org during implementation.

## 1. Current state of `app/invoices/page.tsx`

**Data fetch**: `useEffect` (~line 50) calls `/api/salesforce/invoices?accountId=...&contactId=...&action=list`, returning raw `Invoice__c` records in `rawItems`.

**Current mapping** (`mappedInvoices`, lines 63-88): `id`, `invoiceNumber` (`item.Name`), `accountName` (`item.Bill_to_Account_Name`), `status`, `totalAmount` (`item.Grand_Total__c`), `amountPaid`, `amountDue` (`item.Open_Balance__c`), `invoiceDate` (`item.Issued_Date__c`), `dueDate` (`item.Due_Date__c` — **already fetched, just never rendered**), `salesOrderNumber`, `purchaseOrderNumber`, `proposalName` (`item.Proposal_Name`), `customerOrder`, `customerPO`, `lineItemCount`, `paymentTerms`, `collectionStatus` (`item.Collection_Status__c`), `description`, `contactName` (`item.Bill_to_Contact_Name` — **already fetched, just never rendered**), plus five id-only fields (`salesOrderId`, `purchaseOrderId`, `proposalId`, `customerOrderId`, `accountId`).

**Current header row** (lines 476-492): Invoice Number (sticky, but rendered as a `<td><div onClick={router.push}>` in the body, not a real `<Link>`) → Status (`StatusBadge`) → Sales Order → Purchase Order (hyperlinked) → Proposal Name (hyperlinked) → Customer Order (hyperlinked) → Customer PO → Bill to Account → Total Lines → Grand Total → Issued Date → Payment Terms → Collection Status (plain text, no color) → Open Balance (color-coded already: red if `>0`, green otherwise) → Action.

**Sort default** (line 157): `useSortableData<Invoice>(filteredInvoices, { key: 'invoiceNumber', direction: 'desc' })` — **already descending by Invoice Number**, matching FR-006. No behavioral change needed, only confirmation.

**Pagination**: Already fully implemented (`ITEMS_PER_PAGE = 10`, `Pagination` component at lines 627-634) — FR-005 requires no new implementation.

**Header truncation**: Every `SortableHeader` on this page already passes `truncate={false}` (line 476-489) — **no FR-001/002 gap here**, consistent with the Proposal landing page (feature 022) and unlike the original Orders landing page (feature 021) before its fix.

**Sticky first column**: Invoice Number's header (line 476) and body cell (line 515) both already carry `sticky left-0` classes — **no FR-004 gap**, only the hyperlink correctness gap noted below.

**Pre-existing minor bug (unrelated to this spec, noted for implementation)**: the empty-state `colSpan={10}` (line 498) already undercounts the current 15 columns; it will need updating to the new column count (24) as a mechanical side-effect of this change, not a new requirement.

## 2. "Invoice #" must become a genuine hyperlink (FR-009)

Today the Invoice Number cell (line 515-517) is a `<div title=... onClick={() => router.push(...)}>` styled with `text-primary` to look like a link, not an actual `<Link>`/anchor. Every other hyperlinked column on this page (Purchase Order, Proposal Name, Customer Order, and the Action icon) already uses Next.js `<Link href=.../>`. **Decision**: replace the `onClick`-div with `<Link href={`/invoices/${invoice.id}`}>` for consistency with the rest of the page and to satisfy FR-009 (a "genuine" navigable link, not a click-handler visual approximation).

## 3. Hyperlink columns — reconciling the new list against pre-existing links

The corrected column list explicitly marks **Invoice #, Customer Quote #, Proposal #, and Customer Order #** as hyperlinks. It does not mention Purchase Order # or Proposal Name, both of which are hyperlinked today.

**Decision (same precedent as feature 022's Assumptions)**: pre-existing hyperlinks not mentioned in the corrected list are not called out for removal, so they are left unchanged. Purchase Order # keeps its existing link to `/purchase-orders/[id]`; Proposal Name keeps its existing link to `/proposals/[id]`. The four explicitly-required hyperlinks are added/confirmed independently of this.

## 4. "Customer Quote #" — new column, field name inferred from universal sibling pattern

Grep across the codebase shows `Customer_Quote__c` (id) / `Customer_Quote_Name` (display name) is the standard lookup pair present on effectively every WOVN transactional object that can reference a quote: Invoice Line Items (`app/invoices/[id]/page.tsx:65`), Invoice Payment History (`:83-84`), Invoice Credit/Debit Memos (`:104-105`, `:122-123`), Orders' Fulfillment/Returns sub-tables, Purchase Order sub-tables (Debit Memo, Supplier Bills, RTV), Shipments, and Supplier Bills. The literal top-level `Invoice__c` mapping (in both `app/invoices/page.tsx` and `app/invoices/[id]/page.tsx`) is the one place in the whole codebase this pair is conspicuously absent — strong evidence this is a missing mapping rather than a nonexistent field.

**Decision**: map `customerQuoteId: item.Customer_Quote__c || ''` and `customerQuoteName: item.Customer_Quote_Name || 'N/A'` on the invoice list mapping, rendering as a hyperlink to `/quotes/${customerQuoteId}` (same route pattern already used for this exact field pair everywhere else, e.g. `app/purchase-orders/[id]/components/PODebitMemoTable.tsx:156`). **Verify at implementation time** that the live API response actually includes this field pair on the `Invoice__c` payload; if absent, this becomes a backend/Apex-layer gap outside this feature's frontend-only scope.

## 5. "Proposal #" — new column, distinct from "Proposal Name"

The invoice mapping already carries `proposalName: item.Proposal_Name` (the linked proposal's own Name/Number-style field, since `Proposal_Name` itself is a denormalized "Name" convenience field) and `proposalId: item.Proposal__c`. The Proposal landing page's own mapping (`app/proposals/page.tsx:72`) distinguishes `proposalNumber: item.Proposal_Number__c || item.Name` from `proposalName: item.Name || item.Proposal_Name__c` — i.e., on the Proposal object itself, "Number" and "Name" are two distinct fields, and today's Invoice mapping only carries the equivalent of one of them (`Proposal_Name`, which doubles as the record's display name).

**Decision**: add `proposalNumber: item.Proposal_Number || item.Proposal_Name` as a new mapped field, hyperlinked to `/proposals/${proposalId}` (reusing the already-mapped `proposalId`). Since the exact source field is unconfirmed against a live org, the fallback chain defaults to reusing the already-working `Proposal_Name` value so the column is never blank, while the primary attempt targets the more likely dedicated number field. **Verify the correct source field at implementation time.**

## 6. "Bill to Location" and "Bill to Contact" — one new, one already fetched

The Invoice Detail page's own mapping (`app/invoices/[id]/page.tsx:195`) already confirms `billToLocation: rawInvoice.Authorized_Bill_To_Location_Name` — a genuinely distinct field from `Bill_to_Account_Name`, already proven to exist on this exact `Invoice__c` object (not inferred from a sibling object). Unlike the Proposal/Orders landing pages (features 021/022), the invoice list's existing "Bill to Account" column is **not** a mislabeling bug — it already sources from `Bill_to_Account_Name` correctly.

`contactName: item.Bill_to_Contact_Name` is already mapped on the list page (line 82) but simply not rendered as its own column.

**Decision**: add `billToLocation: item.Authorized_Bill_To_Location_Name || 'N/A'` (new field, confirmed via the Detail page's mapping of the same object) and surface the already-mapped `contactName` as the new "Bill to Contact" column. No relabeling needed for the existing "Bill to Account" column.

## 7. "Total Price", "Shipping", "Taxes" — confirmed field names via Detail page

The Invoice Detail page's mapping of the same object confirms all three: `subtotal: rawInvoice.Total_Price__c` (line 189), `taxTotal: rawInvoice.Total_Taxes_Amount__c` (line 190), `shippingCost: rawInvoice.Total_Shipping_Charges__c` (line 192) — the identical field names already used for the equivalent "Shipping"/"Taxes" columns added to the Proposal landing page in feature 022 (`Total_Shipping_Charges__c`, `Total_Taxes_Amount__c`), giving high confidence these are the correct org-wide field names.

**Decision**: map `totalPrice: item.Total_Price__c || 0`, `shipping: item.Total_Shipping_Charges__c || 0`, `taxes: item.Total_Taxes_Amount__c || 0` as three new fields. `Grand_Total__c` (already mapped as `totalAmount`) remains the fourth, distinct figure — no computed-sum fallback is needed since a dedicated Grand Total field is already confirmed working today (this list page already renders it correctly, unlike feature 022 where it had to be added from scratch).

## 8. "Due Date" — already mapped, just not displayed

`dueDate: item.Due_Date__c` is already present in the list page's mapping (line 72) and in the `Invoice` type (`app/invoices/types.ts:16`). **Decision**: no mapping change needed — just add the column to the header/body rows.

## 9. "Collection Status" color-coding

No existing badge component covers Collection Status; it currently renders as plain text (line 596). The page's existing `StatusBadge` function (lines 640-666) demonstrates the established colored-pill pattern (`bg-{color}-100 text-{color}-800 dark:bg-{color}-900/30 dark:text-{color}-400`) used for the "Status" column.

**Decision**: add a small local badge renderer (or extend the existing pattern inline) mapping `collectionStatus` values to green ("Paid"), yellow ("Pending"), and red ("Past Due"), following the exact same Tailwind class pattern as `StatusBadge`, with a neutral/gray fallback for any other or blank value (no color assumed for unrecognized values, per the spec's edge case).

## 10. "Open Balance" color-coding

Already correctly implemented today (line 598-602: red if `amountDue > 0`, green otherwise) — matches FR-015 exactly. No change needed beyond confirming this behavior is preserved through the column reorder.

## 11. "Grand Total" as plain (non-link) text

Already plain bold text today (line 590, `formatCurrency(invoice.totalAmount)` inside a `<td>`, no `<Link>` or `onClick`) — matches FR-010 exactly. No change needed; this requirement locks in existing behavior against future regression.

## 12. "Settled Date" — new field, existence unconfirmed on `Invoice__c` itself

`Settled_Date__c` is confirmed to exist on the related `Credit_Memo__c`/Debit Memo object (`app/invoices/[id]/page.tsx:136`, `cm.Settled_Date__c`), but no code anywhere in the repository currently reads a `Settled_Date__c` (or equivalent) field directly off `Invoice__c`.

**Decision**: map `settledDate: item.Settled_Date__c || ''` as a new field on the invoice list mapping, displaying "-" when empty (consistent with the null-dash convention). Since this is the one field in this feature with no prior confirmed usage anywhere on the Invoice object itself, **this is the highest-risk field mapping and should be verified against the live org or with the backend/Apex team during implementation** — if the field does not exist on `Invoice__c`, the column will consistently show "-" until a backend field is added, which is graceful degradation rather than a broken UI.

## 13. Column-order and width-config changes

All changes are confined to `app/invoices/page.tsx`: the `useResizableColumns` width map, the `mappedInvoices` construction, the header `<SortableHeader>` row, and the body `<tr>` row. No new files, no new API routes, no schema changes.

## 14. No test/contract changes needed

No new API routes, no contracts. All hyperlink URL conventions used (`/invoices/${id}`, `/quotes/${id}`, `/proposals/${id}`, `/orders/${id}`, `/purchase-orders/${id}`) are already established patterns reused unchanged from elsewhere in the portal.
