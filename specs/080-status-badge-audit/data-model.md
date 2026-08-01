# Data Model: Status Badge Compliance Audit

No database, API, or data-fetching changes. This feature only changes how already-fetched status strings are rendered — every field/status value below is a display concern, not a data model in the traditional sense.

## Key Entities (from `spec.md`)

- **Tab/Table Component**: A page or sub-component under `app/` that renders a record's (or line's) status as a colored badge, pill, or span. 14 are migrated in this feature (see below); 3 are confirmed intentional exceptions; 1 has dead status-color code removed.
- **Status Badge Implementation**: The specific function or inline logic responsible for mapping a status string to a color class. After this feature, every Tab/Table Component in scope uses exactly one implementation: `components/ui/StatusBadge.tsx`'s exported `StatusBadge` (or, for the one duplicate found, its exported `RemittanceBadge`).
- **Status Vocabulary**: The set of distinct status strings an implementation recognizes. `components/ui/StatusBadge.tsx`'s generic vocabulary grows from the 53 statuses `079` established to 56 (3 net-new: `pending shipment`, `new`, `on hold`). The distinct payment/collection vocabulary (`RemittanceBadge` and its two confirmed-separate cousins) is unchanged.

## `components/ui/StatusBadge.tsx` (extended)

No prop or API changes — `status` and `variant` remain exactly as `079` left them. Only the internal status→color switch gains 3 new `case` entries.

## Merged status → color table (56 total: 53 from `079` + 3 net-new)

Only the changed groups are shown; the other 7 groups (red, purple, indigo, emerald, amber, sky) from `079-shared-status-badge/data-model.md` are unchanged by this feature.

| Color | Statuses |
|---|---|
| green | *(unchanged from `079`)* |
| yellow | in progress, issued, packed, partial, partial shipment, pending, pending approval, pending review, picked, submitted, **pending shipment (new)** |
| blue | accepted, allocated, converted, draft, in stock, in transit, inprogress, open, out for delivery, **new (new)** |
| orange | conditional, expired, **on hold (new)** |

Note: `submitted` is confirmed live in the yellow group (verified directly against `components/ui/StatusBadge.tsx` during Phase 2 implementation — see correction below), not blue as `079`'s own `data-model.md` had documented. That document and the shipped code diverged at some point; the live code is authoritative.

## Conflicts resolved in this feature (per `spec.md` FR-005, `research.md` §3)

Every other status keeps the color it already had everywhere it appeared — these are the only colors changing as a direct result of this feature.

| Status | Color (unchanged from `079`) | File(s) changing to match |
|---|---|---|
| draft | blue | `FulfillmentTab.tsx`, `ReturnsTab.tsx` (orders, was yellow); `LineReturnsTab.tsx` ×5 blocks, `ProposalHeader.tsx` (was gray) |
| shipped | green | `FulfillmentTab.tsx` (was blue) |
| in progress | yellow | `FulfillmentTab.tsx` (was blue) |
| allocated | blue | `FulfillmentTab.tsx` (was green) |
| open | blue | `FulfillmentTab.tsx` (was yellow) |
| acknowledged | green | `POHeader.tsx` (was blue) |

**Correction**: `submitted` was originally listed here too (`ReturnsTab.tsx` orders, "was yellow" → blue), copied from `079`'s own documented resolution. Verified against the actual live `components/ui/StatusBadge.tsx` during Phase 2 and found `submitted` is already yellow there — `ReturnsTab.tsx` already matches. No conflict, no change needed for that status; removed from this table. `ReturnsTab.tsx` (orders) still needs its `draft` conflict resolved.

7 status-instances change color across 6 files (one file, `FulfillmentTab.tsx`, has 5 of them). This is smaller in status-count than `079`'s 10 conflicts but touches files `079` never reached (order-level tabs and a PO header).

## Under-coverage fixed as a side effect (not a "conflict" — see `research.md` §5)

These files only explicitly handled a handful of statuses; every other status they receive today falls through to one default color. Migrating gives each its correct, specific color automatically:

| File | Statuses explicitly handled today | Falls through to |
|---|---|---|
| `LineReturnsTab.tsx` (×5 blocks) | Draft, Approved | gray (happens to match shared default) |
| `InvoiceCredits.tsx` | Posted | blue (shared default is gray — this changes) |
| `InvoiceLineItems.tsx` | Paid, Settled, Approved | blue (shared default is gray — this changes) |
| `ProposalHeader.tsx` | Draft, Pending, Approved, Rejected | blue (shared default is gray — this changes) |
| `QuoteHeader.tsx` | Draft, Pending, Approved, Rejected | blue (shared default is gray — this changes) |

## Per-file migration notes

| File | Variant | Notes |
|---|---|---|
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | bordered | Zero conflicts — pure remove-local-function + import. |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | bordered | Same. |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | bordered | Same. |
| `app/orders/[id]/components/FulfillmentTab.tsx` | compact | Local `statusBadge` is called 7× in this file (Proposals/Quotes/Sales Orders/Shipping Manifests/Invoices sub-tables, plus 2 conditional calls for tracking/collection status) — every call site keeps passing whatever status string it already does; only the rendering function changes. 5 statuses recolor (see table above). |
| `app/orders/[id]/components/ReturnsTab.tsx` | compact | Local `statusBadge` called 4× (RMA/Credit Memo/Debit Memo/RTV sub-tables). 2 statuses recolor. |
| `app/proposals/[id]/components/ProposalHeader.tsx` | pill | Top-level Proposal detail page header badge — the highest-visibility file in this set. 1 conflict (draft) + under-coverage fix. |
| `app/purchase-orders/[id]/components/POHeader.tsx` | bordered | Top-level PO detail page header badge. 1 conflict (acknowledged). |
| `app/quotes/[id]/components/QuoteHeader.tsx` | pill | Top-level Quote detail page header badge. No hue conflicts (its "Draft" is a darker blue shade, same hue family) + under-coverage fix. |
| `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` | compact | 5 near-identical duplicated blocks (RMA, RTV, Credit Memo, Debit Memo, generic item sub-tables) — all 5 migrate to the same shared component call. 1 conflict (draft) + under-coverage fix. |
| `app/proposals/[id]/components/ProjectsTab.tsx` | bordered | Introduces 2 net-new statuses (`new`, `on hold`) to the shared component; its `In Progress`/`Completed` already match existing shared colors exactly. |
| `app/invoices/[id]/components/InvoiceCredits.tsx` | compact | Under-coverage fix only, no hue conflict. |
| `app/invoices/[id]/components/InvoiceLineItems.tsx` | compact | Under-coverage fix only, no hue conflict. |
| `app/shipments/[id]/components/ShipmentHeader.tsx` | pill | Introduces 1 net-new status (`pending shipment`) to the shared component. Distinct from `app/shipments/[id]/lines/[lineid]/page.tsx`'s status div, which `078`/`079` already migrated — this is the shipment's own top-level header, never previously touched. |
| `app/supplier-bills/page.tsx` | n/a | Removes a local `function RemittanceBadge` that duplicates the shared file's own export byte-for-byte in vocabulary/color — becomes `import { RemittanceBadge } from "@/components/ui/StatusBadge"`. Zero conflict, zero visual change. |
| `app/proposals/[id]/components/ProposalDetails.tsx` | n/a — deletion | `getStatusColor` (lines 26–44) has zero callers anywhere in the file. Delete the function; nothing else changes. |

## Confirmed exceptions (unchanged in this feature)

| File | Vocabulary |
|---|---|
| `components/ui/StatusBadge.tsx`'s `RemittanceBadge` export | Paid / Partially Paid / Unpaid / Not Payable / Past Due / Pending |
| `app/invoices/page.tsx`'s `CollectionStatusBadge` | Paid / Pending / Past Due |
| `app/invoices/[id]/components/InvoicePayments.tsx`'s `getStatusColor` | Substring-matched payment/transaction processing states |

## Spot-checks resolved (Phase 3 / US1, 2026-08-01)

All three files flagged in planning were opened and every `status === '...'` match in each was traced. All three are confirmed **unrelated to status-badge rendering** — no migration needed, audit closed for these files.

| File | Matches found | Resolution |
|---|---|---|
| `app/invoices/page.tsx` | `.filter(inv => inv.status === "Overdue")`, `.filter(inv => inv.status === "Paid" \|\| inv.status === "Settled")` | Stat-card summary counts (e.g. "Overdue invoices" tile), not badge rendering. Confirmed unrelated. |
| `app/orders/page.tsx` | `.filter(o => o.status === "Draft")`, `.filter(o => o.status === "Pending" \|\| o.status === "Submitted")`, `.filter(o => o.status === "Success" \|\| o.status === "Approved" \|\| o.status === "Delivered")`, `order.status === "Draft" &&` (conditional render gate) | Same pattern — stat-card counts plus one action-visibility gate (not a color/badge decision). Confirmed unrelated. |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | `const isLineEditable = line.status === "Draft" \|\| line.status === "Approved"` | Boolean gate controlling whether the Edit button shows, not a badge. Confirmed unrelated. |

The audit inventory is now closed: 14 files confirmed needing migration, 1 file's dead code confirmed for deletion, 3 files confirmed as an intentional distinct vocabulary, and these 3 confirmed as false positives. Nothing remains unclassified.
