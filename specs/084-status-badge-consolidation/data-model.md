# Data Model: Status-Badge Consolidation (Remaining Gaps)

No database, API, or data-fetching changes. This feature only changes how already-fetched status strings are rendered, plus two small additions to the shared component's recognized-value vocabulary (see below). All fields below are read-only display values already flowing through existing service/API layers.

## Key Entities (from `spec.md`)

- **Order.status** (`Status__c`): displayed at `OrderHeader.tsx` (User Story 1) using the same generic vocabulary already handled by `StatusBadge`. No new component cases needed.
- **Home/Program360 dashboard record**: `item.status` (`Status__c` on the underlying Order/Proposal/Quote/Invoice/Shipment) — same generic vocabulary, no new component cases needed.
- **Product.status**: displayed at `ProductInfoCard.tsx` and `AddToOrderModal.tsx` (order status, a different but overlapping vocabulary) — no new component cases needed (both use values already in `StatusBadge`'s existing cases, e.g. "Draft").
- **Certification.Certification_Status__c** (Valid/Expired/Pending/other): requires **one new case** in `StatusBadge` — `"valid"` added to the existing green group.
- **Invoice.collectionStatus** (`Collection_Status__c`): requires **one new case** in `StatusBadge` — `"past due"` added to the existing red group (alongside `"overdue"`).
- **SupplierBill.remittanceStatus** (`Remittance_Status__c`): uses the existing `RemittanceBadge` component — no changes to that component; only two new call sites.
- **Shipment/PO/Quote/Proposal Purchase.trackingStatus** (`Tracking_Status__c`): uses the existing `StatusBadge` — no new cases needed (six new call sites only).

## Shared component changes

`components/ui/StatusBadge.tsx`'s `StatusBadge` function gains exactly 2 new `case` labels (no new groups, no changed existing behavior for any currently-recognized value):

```ts
// green group (existing) gains:
case "valid":
// red group (existing) gains:
case "past due":
```

`RemittanceBadge` is unchanged — it already handles every value this feature needs (`"paid"`, `"pending"`, `"past due"`, `"unpaid"`, `"not payable"`).

## Per-file fix notes

| File | Change | Variant | Notes |
|---|---|---|---|
| `app/orders/[id]/components/OrderHeader.tsx` | Replace hand-rolled ternary (~lines 83-102) with `<StatusBadge>` | `pill` | Matches `app/orders/page.tsx:926`'s treatment of the same field. |
| `app/home/page.tsx` | Replace `<span className={item.pillClass}>` (~366-367) with `<StatusBadge>`; remove `pillClass` from all 5 category objects | `compact` | `badgeClass` (a different, category-level property) is untouched. |
| `app/program360/page.tsx` | Byte-identical fix, same line positions | `compact` | Confirmed byte-identical to Home at the relevant ranges. |
| `app/products/[id]/components/ProductInfoCard.tsx` | Replace dot + green text (line ~46) with `<StatusBadge>` alone | `compact` | Decorative dot dropped — no established dot-color precedent exists elsewhere to preserve. |
| `app/products/[id]/components/AddToOrderModal.tsx` | Replace amber text (line ~260) with `<StatusBadge>` | `compact` | |
| `components/ui/StatusBadge.tsx` | Add `case "valid":` to green group | — | Enables the two Certification fixes below. |
| `app/products/[id]/components/EditProductTabs.tsx` | Replace ternary (~604-608) with `<StatusBadge>` | `compact` | |
| `app/products/[id]/components/ComplianceCertsTab.tsx` | Replace ternary (~59-65) with `<StatusBadge>` | `compact` | Fixes the "Expired collapsed into default red" bug. |
| `components/ui/StatusBadge.tsx` | Add `case "past due":` to red group | — | Enables all 3 Collection Status fixes below. |
| `app/invoices/page.tsx` | Delete local `CollectionStatusBadge` function (~663-681); replace call site (~617) with `<StatusBadge>` | `compact` | |
| `app/invoices/[id]/components/InvoiceSummary.tsx` | Replace `SummaryStatusRow`'s binary variant logic for this field (~100) with `<StatusBadge>` | `compact` | The generic `variant` prop on `SummaryStatusRow` itself is unrelated (danger/success/neutral text coloring for other rows) — only the Collection Status row changes. |
| `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx` | Wrap plain text (~148) with `<StatusBadge>` | `compact` | |
| `app/proposals/[id]/components/PurchasesTab.tsx` | Wrap remittance (~373) with `<RemittanceBadge>`; wrap tracking (~240) with `<StatusBadge>` | pill (tracking) | Two independent fixes in the same file. |
| `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx` | Wrap remittance (~128) with `<RemittanceBadge>` | — | |
| `app/purchase-orders/page.tsx` | Wrap tracking (~397) with `<StatusBadge>` | default/bordered | |
| `app/purchase-orders/[id]/components/POLinesTable.tsx` | Wrap tracking (~183) with `<StatusBadge>` | default/bordered | |
| `app/quotes/[id]/components/QuotePurchasesSubTab.tsx` | Wrap tracking (~139) with `<StatusBadge>` | pill | |
| `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | Wrap tracking (~203) with `<StatusBadge>` | compact | |
| `app/proposals/[id]/components/FulfillmentsTab.tsx` | Wrap tracking (~727) with `<StatusBadge>` | pill | |

## Explicitly unchanged (out of scope, confirmed genuinely distinct vocabularies)

| File | Field | Why excluded |
|---|---|---|
| `app/products/[id]/components/AuthorizedSuppliersTab.tsx` | `Relationship_Status__c` (Strategic/Key) | A classification, not a lifecycle status; no existing shared-badge precedent for this vocabulary. |
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx` | Sync-run status (running/completed/failed) | A background-job state, not a business-record status; no existing shared-badge precedent. |
