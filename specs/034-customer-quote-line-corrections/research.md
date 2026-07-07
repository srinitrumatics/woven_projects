# Phase 0 Research: Customer Quote Line Page — Fulfillment & Returns Corrections

## Context

The feature spec (FR-001 through FR-028) prescribes exact column lists, hyperlink rules, default sort, and cross-cutting layout/pagination requirements for five line-level tables. Direct code inspection confirmed this page has never been corrected — greenfield, unlike feature 032 (which found no gap) but similar in shape to feature 033/031 (genuine corrections).

## Data flow (shared across all five tables)

Both parent tab containers fetch from the same endpoint pattern: `GET /api/salesforce/quotes?...&action={fulfillment|returns}&objectName=Customer_Quote_Line__c`, proxied via `lib/quote-service.ts`. Field-mapping happens client-side inside each parent's `useEffect` (`QuoteLineFulfillmentsTab.tsx:103-207` for Sales Order Lines/Invoice Lines/Shipping Manifest Lines; `QuoteLineReturnsTab.tsx:125-251` for RMA Lines/Credit Memo Lines and the out-of-scope RTV/Debit Memo Lines). The five sub-tab components themselves are purely presentational — they receive already-mapped `data`, `sortConfig`, `requestSort`, `widths`, and `handleResize` as props and contain no fetch/mapping logic of their own.

## Decision: Six confirmed defects, not just missing columns

| # | Defect | Location | FR |
|---|--------|----------|----|
| 1 | "Brand" column always renders blank — `brand: undefined` is hardcoded in all five `.map()` blocks, no fallback field attempted at all (worse than 031/033's version, which at least read a wrong/unpopulated field) | `QuoteLineFulfillmentsTab.tsx:129,159,184`, `QuoteLineReturnsTab.tsx:155,179,204,229` | FR-007 |
| 2 | Shipping Manifest Lines: the row's own record ("Shipping Manifest Line", col 1) is plain text while the parent "Shipping Manifest" (col 3) is hyperlinked — the link is on the wrong column | `QuoteLineShippingManifestLinesSubTab.tsx:82` (unlinked) vs `:112-118` (linked) | FR-013, FR-014 |
| 3 | Invoice Lines: the row's own record ("Invoice Line", col 1) is plain text while the parent "Invoice" (col 3, to be relabeled "Invoice #") is hyperlinked — per the request both should end up linked, so this is a partial version of defect #2 | `QuoteLineInvoiceLinesSubTab.tsx:79` (unlinked) vs `:105-111` (linked) | FR-019 |
| 4 | Invoice Lines' "Invoice Qty" column reads `Invoiced_Qty__c`; the request's "Total Order Qty" column (with explicit API name `gtherp__Total_Order_Qty__c`) requires a different field entirely — not just a relabel | `QuoteLineFulfillmentsTab.tsx:161` (`invoiceQty: item.Invoiced_Qty__c \|\| 0`) | FR-021 |
| 5 | Default sort is a no-op on all five tables — both parent tabs call `useSortableData<any>(activeData, { key: 'name', direction: 'desc' })`, but no row interface has a `name` field (all use `lineName`); the comparator always returns 0 | `QuoteLineFulfillmentsTab.tsx:215`, `QuoteLineReturnsTab.tsx:260` | FR-004 |
| 6 | Fulfillment sub-tab order is Sales Order Lines → Invoice Lines → Shipping Manifest Lines; the request specifies Sales Order Lines → Shipping Manifest Lines → Invoice Lines (Invoice Lines and Shipping Manifest Lines are swapped) | `QuoteLineFulfillmentsTab.tsx:260-264` | FR-005 |

**Rationale**: These are genuine, verifiable defects (not just missing columns), each with an exact file/line location and a clear before/after. Fixing them is the primary value of Stories 1-3 and 7; the remaining stories (4, 5) are column-list corrections without an underlying logic bug.

## Decision: Headers currently wrap/truncate everywhere — a real fix, not a lock-in

Unlike features 032/033 (where the no-wrap header requirement was mostly already met), **no `SortableHeader` call on any of the five tables passes `truncate={false}`** — confirmed by grep across all five sub-tab files. `components/ui/SortableHeader.tsx` defaults `truncate` to `true`, so every header on this page currently truncates/wraps. FR-001 is therefore a genuine correction requiring `truncate={false}` to be added to every `SortableHeader` call across all five tables (approximately 83 header instances today, changing to 84 across the corrected column counts).

## Decision: Sticky column and pagination are already correct — lock-in only

All five tables already have: a sticky first column (`className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"` on the header, matching sticky classes on the body `<td>`), and a working `Pagination` component at `ITEMS_PER_PAGE = 10`. FR-002/FR-003 lock these in as explicit, regression-protected requirements.

## Decision: Returns sub-tab order is already correct — lock-in only

`QuoteLineReturnsTab.tsx:307-311` already lists sub-tabs as RMAs (label "RMAs Lines") → Credit Memos (label "Credit Memos Lines") → RTVs → Debit Memos — RMA Lines already precedes Credit Memo Lines, matching the requested order. FR-005's Returns-tab clause locks this in; no code change needed for Returns sub-tab order itself.

## Decision: New-column field-name assumptions, with graceful degradation

- **Customer Quote Line hyperlink**: the id (`customerQuoteLineId`) is already fetched and mapped on all five tables but never used for linking. No distinct parent-quote id (`Customer_Quote__c`) is captured on any of these five line objects. Since this entire page is already scoped to a specific quote (route `app/quotes/[id]/lines/[lineid]/page.tsx`), and a Sales Order Line/Shipping Manifest Line/Invoice Line/RMA Line/Credit Memo Line's "Customer Quote Line" reference for a given quote line will, in the overwhelming majority of cases, belong to the same parent quote as the page being viewed, the link target is assumed to be `/quotes/{outerQuoteId}/lines/{customerQuoteLineId}` — reusing the outer page's own `id` route param, not a newly-fetched field. If `customerQuoteLineId` is absent, the column renders as plain text/"-".
- **Proposed Product**: assumed to follow the `Proposed_Product_Name`/`Proposed_Product__c` field-naming convention established by feature 031 for the equivalent column, linking to `/products/{id}`.
- **Brand Name fix**: the request specifies API name `gtherp__Brand_Name__c` explicitly for all five tables — no ambiguity; replaces the hardcoded `undefined`.
- **Box Length/Width/Height** (Shipping Manifest Lines): the request specifies API names `gtherp__Case_Length__c`/`gtherp__Case_Width__c`/`gtherp__Case_Height__c` explicitly — no ambiguity; these mirror the existing `Case_Net_Weight__c`/`Case_Gross_Weight__c`/`Box__c` fields already mapped for Box Net Weight/Box Gross Weight/Box Count.
- **Total Order Qty fix** (Invoice Lines): the request specifies API name `gtherp__Total_Order_Qty__c` explicitly — no ambiguity; replaces the current `Invoiced_Qty__c` mapping.
- **Shipping Manifest Line # / Invoice Line hyperlink targets**: confirmed via direct route inspection that `app/shipments/[id]/lines/[lineid]/` and `app/invoices/[id]/lines/[lineid]/` both already exist in this codebase — the requested hyperlinks are immediately buildable using each row's own `id` plus the already-fetched parent `manifestId`/`invoiceId`.

All of the above degrade gracefully to "-"/plain text if the live org's field is absent or unpopulated, consistent with how feature 031 documented and accepted equivalent residual risk.

## Outstanding risk

Field-availability risk for Proposed Product (all five tables) and Box Length/Width/Height (Shipping Manifest Lines) — listed above with a stated fallback. No blocking risk identified for launch.
