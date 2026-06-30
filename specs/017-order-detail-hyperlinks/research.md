# Research: Order & Quote Hyperlinks on Detail Pages

**Feature**: `specs/017-order-detail-hyperlinks`
**Date**: 2026-06-30

---

## Decision 1: Actual Scope of "Customer Quote" Hyperlinks

**Decision**: Customer Quote hyperlinks are **already fully implemented** across all relevant sub-tables via spec 016. No additional Customer Quote linking work is required.

**Rationale**: Spec 016 added `Customer_Quote_Id__c` ID fields and `canLinkQuotes`-guarded `<Link href="/quotes/{Id}">` cells to the following sub-tables in FulfillmentTab.tsx and ReturnsTab.tsx:
- Fulfillment tab: Sales Orders, Shipping Manifests, Invoices (Customer Quote # column)
- Returns tab: RMAs, Credit Memos (Customer Quote # column)

The Proposals and Customer Quotes sub-tables do not reference Customer Quotes as a cross-reference column (they ARE the proposals/quotes), so no gaps exist there.

**Alternatives considered**: Re-verifying by reading every sub-table render — confirmed, all Customer Quote cross-reference columns are hyperlinked.

---

## Decision 2: Actual Scope of "Customer Order" Hyperlinks

**Decision**: Customer Order (`Customer_Order_Name`) appears as plain text with **no hyperlink** in exactly two sub-tables: **Debit Memos** and **RTV** (both in ReturnsTab.tsx). These are the only gaps.

**Rationale**: The FulfillmentTab sub-tables (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices) had their "Customer Order" column **removed** in spec 016 per the spec's column requirements. The Debit Memos and RTV sub-tables were not in scope for spec 016 (they remain unchanged for non-Customer/NSO accounts), so they still show `Customer_Order_Name` as plain text. Neither the `DebitMemo` nor `RTV` TypeScript interfaces define a `Customer_Order_Id__c` field, preventing link construction.

**Alternatives considered**: Re-adding Customer Order columns to Fulfillment sub-tables — rejected because spec 016 intentionally removed them per the column spec, and doing so would reintroduce columns removed by design. Scope confirmed as Debit Memos + RTV only.

---

## Decision 3: Order Line Details Page

**Decision**: The Order Line Details page (`/orders/[id]/lines/[lineId]`) contains **no Customer Order or Customer Quote references** in any component. No changes are needed to that page.

**Rationale**: The page and all six of its sub-components (LineHeader, ProductCarousel, OrderLineNotes, ProductInfo, OrderDetailsTable, LineTaxesTab, LineNavigation) focus purely on the individual order line item: product name, SKU, pricing, quantity, taxes, notes, and navigation. None display Customer Order Name or Customer Quote Name fields.

**Alternatives considered**: None — this is a factual finding from reading all component files.

---

## Decision 4: Customer Order Route

**Decision**: Customer Order records should link to `/orders/{Customer_Order_Id__c}`, consistent with the portal's main Orders route.

**Rationale**: The Order Details page is at `/orders/[id]`. The `Customer_Order__c` Salesforce object corresponds to the Customer Order records displayed in the Orders list page. Linking to `/orders/{Id}` navigates to the correct Order Details page for that record.

**Alternatives considered**: A separate `/customer-orders/[id]` route — no such route exists in the codebase; `/orders/[id]` is the correct target.

---

## Decision 5: Permission Guard for Customer Order Links

**Decision**: Introduce a `canLinkOrders` flag in ReturnsTab.tsx following the exact same pattern as `canLinkQuotes` and `canLinkProposals`: `isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid'`.

**Rationale**: All existing `canLink*` flags use the same account-type logic. Customer Order records are accessible to all account types that can view orders (Customer, NSO, Hybrid). No new permission type is required.

**Alternatives considered**: Reusing `canLinkQuotes` — semantically wrong (different entity type). Creating a new DB permission entry — unnecessary complexity; the pattern is already established via account type checks.

---

## Decision 6: API Field Availability

**Decision**: `Customer_Order_Id__c` must be verified as returned by the Salesforce Returns API endpoint for Debit Memos and RTV records. If absent, the implementation renders plain text (null guard via `displayCell()` pattern).

**Rationale**: The Salesforce `gtherp/generic/tab` endpoint returns these records. The `Customer_Order_Name` field is confirmed present (currently rendered). Whether the companion `Customer_Order_Id__c` field is returned depends on the API query — this is acceptable risk, as the null guard prevents broken links.

**Alternatives considered**: Adding a new API field via Apex changes — out of scope per constitution Principle V (no Salesforce changes). The frontend simply renders a link when the ID field is present, plain text when absent — this is the existing `displayCell()` / `canLink*` pattern.

---

## Revised Feature Scope Summary

| Target | Customer Quote Links | Customer Order Links |
|--------|---------------------|---------------------|
| FulfillmentTab — Proposals | N/A (no CQ reference) | N/A (CO column removed) |
| FulfillmentTab — Customer Quotes | N/A (IS the CQ) | N/A (CO column removed) |
| FulfillmentTab — Sales Orders | ✅ Done (spec 016) | N/A (CO column removed) |
| FulfillmentTab — Shipping Manifests | ✅ Done (spec 016) | N/A (CO column removed) |
| FulfillmentTab — Invoices | ✅ Done (spec 016) | N/A (CO column removed) |
| ReturnsTab — RMAs | ✅ Done (spec 016) | N/A (CO not displayed) |
| ReturnsTab — Credit Memos | ✅ Done (spec 016) | N/A (CO not displayed) |
| ReturnsTab — **Debit Memos** | N/A (no CQ reference) | **TODO: add link** |
| ReturnsTab — **RTV** | N/A (no CQ reference) | **TODO: add link** |
| Order Line Details page | None present | None present |
