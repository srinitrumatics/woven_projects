# Data Model: Line Status Indicator Parity

No database schema changes. All entities below are read-only, in-memory shapes derived from existing Salesforce-backed API responses already consumed by each page — nothing here is persisted to PostgreSQL (consistent with Constitution Principle I).

## Entities

### Order Line (`OrderLineItem` / mapped `product` in `app/orders/[id]/lines/[lineId]/page.tsx`)

| Field | Type | Notes |
|---|---|---|
| `Status__c` *(new)* | `string \| undefined` | Raw field added to the `OrderLineItem` interface; sourced from the existing `getOrderLinesFromSalesforce` response (see `research.md` §2 for the verification step this depends on). |
| `status` *(new, mapped)* | `string` | Derived as `item.Status__c \|\| "Draft"` when building the page's product/line object, mirroring the existing Quote Line mapping. |

Relationship: one Order Line belongs to exactly one Order; the Order's own `orderStatus` (already present) is a separate, independent value — an Order Line's `status` MUST NOT be conflated with or overwritten by the parent Order's status.

### Proposal Line (`ProposalProductItem` / mapped `ProductData` in `app/proposals/[id]/lines/[lineid]/page.tsx`)

| Field | Type | Notes |
|---|---|---|
| `Status_c` *(removed)* | `string` | Incorrectly-named field currently declared on `ProposalProductItem`; to be corrected to `Status__c`. |
| `Status__c` *(corrected name)* | `string \| undefined` | Replaces `Status_c` in the interface, matching the field name already used correctly for every other object in this file. |
| `status` *(mapped, fallback corrected)* | `string` | Changes from `item.Status_c \|\| ""` to `item.Status__c \|\| "Draft"`. |

No new data is fetched — this is purely a field-name and fallback-value correction on data already being retrieved.

### Quote Line (`QuoteProductItem` / mapped product in `app/quotes/[id]/lines/[lineid]/page.tsx`)

| Field | Type | Notes |
|---|---|---|
| `Status__c` | `string \| undefined` | Already declared and correctly mapped today — no change. |
| `status` | `string` | Already computed as `item.Status__c \|\| "Draft"` — no change. |

No data-layer change here at all; this page only needs the presentational `StatusBadge` added (see below).

### Status Indicator (`StatusBadge`, local per-file function)

| Aspect | Value |
|---|---|
| Input | A single `status: string` prop |
| Output | A `<span>` badge, colored per the status→color mapping in `research.md` §4 |
| States | Green (`Approved`/`Awarded`/`Paid`), Yellow (`Pending`), Blue (`Draft`), Red (`Cancelled`/`Closed`), Gray (any other/unrecognized value, including an empty string) |
| Placement | Rendered immediately adjacent to the existing "Line X of Y" `<span>`, inside the same flex row, near the top-left of the page header — not in the top-right action-button area |

This is a presentational-only construct; it holds no state of its own and triggers no side effects. Added as a local function (not imported) to `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx` and `app/quotes/[id]/lines/[lineid]/page.tsx`, matching the existing duplication convention documented in `research.md` §3. No change needed to the Proposal Line or Supplier Bill Line `StatusBadge` functions — they already match each other exactly.

## State / Lifecycle

Status is not transitioned or edited by this feature (per spec Assumptions — out of scope). Each line's `status` value is:
1. Fetched fresh whenever the page loads or the user navigates to a different line via the existing line-navigation controls.
2. Rendered read-only.
3. Not cached or persisted beyond the current page view.
