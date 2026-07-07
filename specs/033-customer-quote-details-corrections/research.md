# Phase 0 Research: Customer Quote Details Page — Lines, Fulfillment, Returns Corrections

## Context

The feature spec (FR-001 through FR-036) prescribes exact column lists, hyperlink rules, default sort, and cross-cutting layout/pagination requirements for seven tables. This is a genuine corrections feature (unlike feature 032) — direct code inspection confirmed real gaps and defects, catalogued below with exact file/line references.

## Data flow (shared across all seven tables)

All data originates from one endpoint: `GET /api/salesforce/quotes?accountId=...&contactId=...&quoteId=...&action={quotelines|fulfillment|returns}`, proxied via `lib/quote-service.ts` to a Salesforce Apex REST endpoint. The raw, unmapped Salesforce response is mapped client-side inside `app/quotes/[id]/page.tsx`'s `fetchTabData` function (lines 255-552) — one mapping block per `action` value. This differs slightly from the Orders landing page (feature 032), which does its own mapping in a `useMemo`, but is functionally equivalent: all new field references in this feature are added to these existing mapping blocks, not to a new API route.

Sort state and column widths for the five Fulfillment/Returns sub-tables are NOT owned by the sub-tab components themselves — they live one level up, in `QuoteFulfillmentTab.tsx` (Sales Orders, Shipping Manifests, Invoices) and `QuoteReturnsTab.tsx` (RMAs, Credit Memos, plus out-of-scope RTVs/Debit Memos), which pass `sortField`/`sortDirection`/`widths` down as props. The Customer Quote Lines tab's sort state lives directly in `app/quotes/[id]/page.tsx` (lines 42-43).

## Decision: Six confirmed defects, not just missing columns

**Rationale**: Beyond the requested column additions/reorderings, code inspection surfaced defects that the spec's FRs explicitly call out for correction (not net-new scope, but bugs the corrected column list exposes):

| # | Defect | Location | FR |
|---|--------|----------|----|
| 1 | "Brand" column always renders blank — `line.brand` is read but the mapping never sets a `brand` key (only `manufacturerDBA`) | `page.tsx:263-287` (mapping), `QuoteLinesTab.tsx:71,103-104` (render) | FR-008 |
| 2 | "Sales Order" has no hyperlink — plain text only | `QuoteSalesOrdersSubTab.tsx:95-97` | FR-013 |
| 3 | RMAs' `isRestricted` is hardcoded to `''` (always falsy) instead of computed from account type, so the Customer Order # restriction that works on every sibling table never applies here | `QuoteRMASubTab.tsx:37` (compare to `QuoteSalesOrdersSubTab.tsx:36`, `QuoteShippingManifestsSubTab.tsx:36`, `QuoteInvoicesSubTab.tsx:36`, `QuoteCreditMemoSubTab.tsx:36`, all of which correctly compute `accountType === 'Customer' \|\| accountType === 'NSO'`) | FR-029 |
| 4 | Credit Memos renders the Customer Order # link unconditionally — no `customerOrderId` existence check and no `isManufacturer`/`isRestricted` gating, unlike every other Customer Order cell on this page | `QuoteCreditMemoSubTab.tsx:114-119` | FR-035, FR-036 |
| 5 | RMAs' `Pagination` has a blank `itemName=""` | `QuoteRMASubTab.tsx:158` (compare to `itemName="sales orders"`, `"shipping manifests"`, `"invoices"`, `"credit memos"`, `"quote lines"` on the other five tables) | FR-030 |
| 6 | Tracking Number/Tracking Status/Estimated Delivery Date/Actual Delivery Date appear in the wrong order (Tracking Status and Estimated Delivery Date swapped) on both Shipping Manifests and RMAs | `QuoteShippingManifestsSubTab.tsx:88-91`, `QuoteRMASubTab.tsx:87-90` | FR-020, FR-028 |

**Alternatives considered**: Treating these as "will fix opportunistically while reordering columns" without calling them out explicitly was rejected — defects 3 and 4 are access-control/data-visibility issues, not cosmetic, and deserve their own acceptance scenarios (spec User Stories 5 and 6) so they're independently verified rather than silently folded into a column-order diff.

## Decision: Default sort correction is real, not a lock-in

Unlike feature 032 (where sort was already correct), all seven tables here need a genuine sort-key and/or sort-direction fix:

| Table | Current sort (field, direction) | Location | Target (FR-004) |
|---|---|---|---|
| Customer Quote Lines | `productName`, `asc` | `page.tsx:42-43` | `Name` (own record), `asc` — only the field is wrong; direction is already correct |
| Sales Orders | `salesOrderNumber`, `desc` | `QuoteFulfillmentTab.tsx:25-26` | `salesOrderNumber`, `asc` — direction only |
| Shipping Manifests | `manifestNumber`, `desc` | `QuoteFulfillmentTab.tsx:29-30` | `manifestNumber`, `asc` — direction only |
| Invoices | `invoiceNumber`, `desc` | `QuoteFulfillmentTab.tsx:33-34` | `invoiceNumber`, `asc` — direction only |
| RMAs | `rmaNumber`, `desc` | `QuoteReturnsTab.tsx:40-41` | `rmaNumber`, `asc` — direction only |
| Credit Memos | `memoNumber`, `desc` | `QuoteReturnsTab.tsx:44-45` | `memoNumber`, `asc` — direction only |

**Rationale**: This "ascending by own record identifier" convention matches the precedent already established by feature 031 (Purchase Order Line detail-page sub-tables), which is explicitly ascending — distinct from the descending convention used on landing pages (e.g. feature 032's Orders landing page). Detail-page sub-tables use ASC; landing pages use DESC. This spec's explicit "Sort Order Column Record ID = ASC" instruction confirms the detail-page convention applies here too.

## Decision: Sub-tab ordering is already correct — lock-in only

`QuoteFulfillmentTab.tsx:182-184` already lists sub-tabs as `salesOrders → shippingManifests → invoices` (labels "Sales Orders", "Shipping Manifests", "Invoices"), and `QuoteReturnsTab.tsx:30-33` already lists `rmas → creditMemo → rtvs → debitMemo` (labels "RMAs", "Credit Memos", ...) — RMAs already precedes Credit Memos. FR-005 locks these in as explicit, regression-protected requirements; no code change is needed for sub-tab ordering itself.

## Decision: New-column field-name assumptions, with graceful degradation

Several requested columns require Salesforce fields not currently mapped anywhere in this codebase:

- **Proposal # / Proposal Name** (Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos): assumed to follow the same `Proposal__c`/`Proposal_Name` naming convention already used for the equivalent fields on the Customer Order object (confirmed present in feature 032's audit of `app/orders/page.tsx`). No confirmation exists that these fields are populated on the Sales_Order__c/Shipping_Manifest__c/Invoice__c/RMA__c/Credit_Memo__c objects specifically.
- **Proposed Product** (Quote Lines): assumed to follow the `Proposed_Product_Name`/`Proposed_Product__c` convention established by feature 031's Purchase Order Line corrections (`data-model.md` row 5), which added this exact field pair for an analogous "Proposed Product" column.
- **Product Name hyperlink target** (Quote Lines): assumed to follow the `Product_Name__c` id-field convention also established by feature 031 (`data-model.md` row 6) for linking Product Name to `/products/{id}`.
- **Grouping** (Quote Lines): the request specifies API name `gtherp__Groupings__c` explicitly — no ambiguity.
- **Brand Name fix** (Quote Lines): the request specifies API name `gtherp__Brand_Name__c` explicitly — no ambiguity; this replaces the dead `brand` field reference.
- **Box Length / Box Width** (Shipping Manifests): the request specifies API names `gtherp__Case_Length__c`/`gtherp__Case_Width__c` explicitly — no ambiguity; these mirror the existing `Case_Net_Weight__c`/`Case_Gross_Weight__c`/`Box__c` fields already mapped for Box Net Weight/Box Gross Weight/Box Count.
- **Purchase Order #** (Invoices): assumed to follow the `Purchase_Order_Name`/`Purchase_Order__c` convention already used for the equivalent field on RMA/Credit Memo/Debit Memo mappings in this same `fetchTabData` function (e.g. `page.tsx:451-452` for RMA).
- **Sales Order #** (Credit Memos): the mapping already includes `salesOrder`/`salesOrderId` (`page.tsx:512-513`) — this column requires no new field mapping, only rendering it (it's currently mapped but never displayed).

All of the above degrade gracefully to "-"/plain text if the live org's field is absent or unpopulated, consistent with how feature 031 documented and accepted equivalent residual risk.

## Outstanding risk

Field-availability risk for Proposal #/Proposal Name on five objects, Proposed Product/Product Name id/Grouping on Quote Lines, Box Length/Width on Shipping Manifests, and Purchase Order # on Invoices — all listed above with a stated fallback. No blocking risk identified for launch.
