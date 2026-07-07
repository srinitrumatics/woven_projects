# Phase 0 Research: Customer Quote Landing Page — Required Corrections

## Context

The feature spec (FR-001 through FR-015) prescribes an exact column list, header behavior, hyperlink rules, default sort/pagination, and page title for the Customer Quotes landing page. Direct code inspection of `app/quotes/page.tsx` confirms a mix of already-correct behavior and genuine defects.

## Decision: Four cross-cutting requirements are already satisfied — lock-in only

| Requirement | Current state | Location |
|---|---|---|
| Page header reads "Customer Quotes" | Already correct: `<h1>Customer Quotes</h1>` | `page.tsx:169` |
| Headers full-text, single-line, no-wrap | Already correct: every `SortableHeader` call passes `truncate={false}` | `page.tsx:449-459` |
| First column sticky | Already correct: `sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on header, matching sticky classes on body cell | `page.tsx:449`, `page.tsx:488` |
| Pagination | Already correct: `Pagination` component, `ITEMS_PER_PAGE = 10` | `page.tsx:17`, `page.tsx:589-596` |
| Default sort DESC by record identifier | Already correct: `useSortableData<Quote>(filteredAndSearchedQuotes, { key: 'quoteNumber', direction: 'desc' })` | `page.tsx:144` |

**Rationale**: Unlike features 031/033/034 (which found genuine defects in these cross-cutting behaviors), this page already matches the requested end-state for header title, no-wrap headers, sticky column, pagination, and sort direction. FR-001 through FR-006 in the spec formalize these as regression-protected requirements; User Story 4 in the spec frames this explicitly as a lock-in story rather than new work.

## Decision: Five confirmed defects/gaps in the column list

| # | Defect/gap | Location | FR |
|---|---|---|---|
| 1 | "Proposal Name" column carries its own hyperlink (`/proposals/{proposalId}`) with no separate "Proposal #" column — merges what feature 032's Orders landing page keeps as two distinct columns (Proposal # linked, Proposal Name plain) | `page.tsx:451` (header), `page.tsx:496-515` (body) | FR-009 |
| 2 | "Customer PO" links to `/purchase-orders/{purchaseOrderId}` — the request does not mark Customer PO for a hyperlink (only Customer Quote #, Proposal #, and Customer Order # are marked), so this link must be removed | `page.tsx:453` (header), `page.tsx:536-555` (body) | FR-010 |
| 3 | "Bill to Location", "Bill to Contact", "Ship to Location", "Ship to Contact" don't exist — only bare "Bill to Account"/"Ship to Account" columns are present | `page.tsx:454-455` (headers), `page.tsx:556-561` (body) | FR-011 |
| 4 | "Drop Ship", "Shipping", "Taxes", "Grand Total", "Issued Date", "Ship Confirmed Date" don't exist as columns or mapped fields at all | N/A — absent | FR-012, FR-013, FR-014 |
| 5 | "Expiration Date" is fetched and mapped into state (`expirationDate: item.Expiration_Date__c || ''`) but never rendered as a column — dead data | `page.tsx:74` (mapping present), no corresponding header/cell | FR-014 |

**Rationale**: These are genuine, verifiable gaps with exact file/line locations. Fixing them is the primary value of User Stories 2 and 3.

## Decision: New-field-name assumptions, with graceful degradation

- **Bill to Location / Bill to Contact / Ship to Location / Ship to Contact**: assumed to follow the exact field-naming convention already confirmed and shipped on the corrected Orders landing page (feature 032): `Authorized_Bill_To_Location_Name`, `Bill_to_Contact_Name`, `Authorized_Ship_To_Location_Name`, `Ship_to_Contact_Name`. No ambiguity — this is a proven, already-working convention on a sibling landing page fed by the same Salesforce org.
- **Drop Ship**: assumed to follow `Drop_Ship__c`, the exact field already used for the equivalent column on the Orders landing page.
- **Shipping / Taxes / Grand Total**: assumed to follow the field-naming convention already used for equivalent totals on other corrected tables in this portal (e.g. `Total_Shipping_Charges__c`, `Total_Taxes_Amount__c`, `Grand_Total__c`, as seen on the Sales Order/Invoice tables in features 033/034). No live-org confirmation exists that these specific fields are populated on the `Customer_Quote__c` object; degrades to "-" if absent.
- **Issued Date**: assumed to follow `Issued_Date__c`, the convention already used for equivalent columns on other corrected tables (e.g. Invoices, RMAs). Note: the `Quote` interface in `app/quotes/types.ts` already declares an `issuedDate?: string` field (line 51), but it is never populated by the mapping in `page.tsx` today — this feature both maps and renders it for the first time.
- **Ship Confirmed Date**: the request specifies API name `gtherp__Delivered_Date__c` explicitly — no ambiguity.

All of the above degrade gracefully to "-" if the live org's field is absent or unpopulated, consistent with how prior features (031, 033, 034) documented and accepted equivalent residual risk.

## Decision: colSpan and widths config must be updated alongside the column list

The empty-state row currently hardcodes `colSpan={12}` (`page.tsx:471`), matching today's 11 data columns + Action. This must become `colSpan={24}` to match FR-008's corrected 24-column list. The `useResizableColumns` config (`page.tsx:28-41`) currently declares 11 width keys plus `actions`; it must gain keys for every new column (`proposalNumber`, `billToLocation`, `billToContact`, `shipToLocation`, `shipToContact`, `dropShip`, `shipping`, `taxes`, `grandTotal`, `issuedDate`, `expirationDate`, `shipConfirmedDate`) — `billTo`/`shipTo` keys are renamed to `billToAccount`/`shipToAccount` for clarity now that Location/Contact siblings exist, matching the naming convention already used on the corrected Orders landing page.

## Outstanding risk

Field-availability risk for Shipping, Taxes, Grand Total, and Issued Date on the `Customer_Quote__c` object — listed above with a stated fallback. No blocking risk identified for launch.
