# Data Model: Shared Status Badge Component

No database, API, or data-fetching changes. This feature only changes how an already-fetched status string is rendered — every field/status value below is a display concern, not a data model in the traditional sense.

## `StatusBadge` component (`components/ui/StatusBadge.tsx`, extended)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `status` | `string` | yes | Matched case-insensitively against the merged 53-status list below. Any unrecognized value (including empty string) falls back to the existing gray default style. |
| `variant` | `'pill' \| 'bordered' \| 'compact'` | no, default `'bordered'` | Controls only the outer badge shape/sizing — never affects color. `'bordered'` preserves the existing component's current unparameterized look (zero change for its 10 existing consumers). `'pill'` and `'compact'` are new, matching shapes already in use across the 34 files being migrated (see `research.md` §4). |

`RemittanceBadge`, exported from the same file, is unrelated and untouched by this feature.

## Merged status → color table (53 total: 21 already-live + 32 net-new)

Grouped by resolved color. Statuses marked **(existing)** were already handled by `components/ui/StatusBadge.tsx` before this feature and are unchanged unless noted under "Conflicts resolved" below. All others are net-new additions.

| Color | Statuses |
|---|---|
| green | acknowledged (existing), active (existing), applied, approved (existing), awarded (existing), completed (existing), delivered, lead, paid (existing), posted, received (existing), shipped, yes (existing) |
| yellow | in progress, issued (existing), packed, partial (existing), partial shipment, pending (existing), pending approval (existing), pending review, picked |
| blue | accepted, allocated, converted, draft (existing), in stock (existing), in transit, inprogress, open, out for delivery, submitted |
| red | canceled, cancelled (existing), closed (existing), exception, exception only (existing), failed (existing), inactive (existing — color changed, see below), no (existing), overdue, partial rejected, rejected |
| orange | conditional (existing), expired |
| purple | sent, under review |
| indigo | negotiation, viewed |
| emerald | quote ready, settled |
| amber | quote requested |
| sky | proposal sent |

## Conflicts resolved (per `spec.md` FR-005 and `research.md` §2)

These are the specific statuses whose color changes on at least one page as a direct, documented result of this consolidation — every other status above keeps the color it already had everywhere it appeared.

| Status | New color | Pages that change |
|---|---|---|
| Draft | blue | `proposals/page.tsx`, `proposals/[id]/components/PurchasesTab.tsx` (was gray); `shipments/page.tsx`, `shipments/[id]/components/ShipmentLinesTab.tsx`, `proposals/[id]/components/ProductsTab.tsx` (was yellow) |
| Cancelled | red | `invoices/page.tsx`, `invoices/[id]/lines/[lineid]/page.tsx`, `invoices/[id]/components/InvoiceHeader.tsx` (was orange) |
| Approved | green | `invoices/page.tsx`, `invoices/[id]/lines/[lineid]/page.tsx`, `invoices/[id]/components/InvoiceHeader.tsx` (was emerald — minor shade shift) |
| Closed | red | `quotes/[id]/components/{QuoteCreditMemoSubTab,QuoteInvoicesSubTab,QuoteRMASubTab,QuoteSalesOrdersSubTab,QuoteShippingManifestsSubTab}.tsx` (was gray); `proposals/[id]/components/OrdersTab.tsx` (was blue) |
| Shipped | green | `quotes/[id]/components/{QuoteCreditMemoSubTab,QuoteInvoicesSubTab,QuoteRMASubTab,QuoteSalesOrdersSubTab,QuoteShippingManifestsSubTab}.tsx` (was blue) |
| Awarded | green | `proposals/page.tsx`, `proposals/[id]/components/FulfillmentsTab.tsx`, `proposals/[id]/components/ReturnsTab.tsx` (was rose) |
| Submitted | blue | `orders/page.tsx` (was yellow) |
| Acknowledged | green | `proposals/[id]/components/PurchasesTab.tsx` (was blue) — tie broken by consistency with "Approved" |
| Inactive | red | `admin/authorize-locations/page.tsx`, `admin/authorize-locations/[id]/delivery-windows/page.tsx` (was gray) |
| Partial | yellow | `invoices/page.tsx`, `invoices/[id]/lines/[lineid]/page.tsx`, `invoices/[id]/components/InvoiceHeader.tsx` (was blue) |

10 conflicts total (the original 8 from `spec.md` plus 2 more found during planning once the already-existing shared component's mappings were discovered — see `research.md` §2). `proposals/[id]/components/ProductsTab.tsx` recognizes only Active/Inactive/Draft; its Active/Inactive already matched the resolution, but during implementation its Draft was found to be yellow (not blue as originally documented here) — corrected and added to the Draft row above; this doesn't change the blue resolution since blue's majority is overwhelming (24 vs 3 yellow vs 2 gray).

## Per-file migration notes (special cases only; the other ~24 files are a straightforward remove-local-function + import + optional `variant="pill"`)

| File | Special handling |
|---|---|
| `app/admin/authorize-locations/[id]/delivery-windows/page.tsx` | Local `StatusBadge` takes `{ active: boolean }`. Call site converts: `status={active ? "Active" : "Inactive"}`, `variant="pill"`. |
| `app/proposals/[id]/components/ProductsTab.tsx` | Keep its own `if (!status) return <span className="text-gray-400">-</span>;` guard before calling the shared component with `variant="compact"`. Its local `colorMap` (Active/Inactive/Draft) is removed entirely — all 3 already covered by the merged table. |
| `app/shipments/page.tsx` | Local fallback is `status || "N/A"` — call site becomes `status={status || "N/A"}` when invoking the shared component (`variant="pill"`), not a change to the shared component itself. |
| `app/invoices/[id]/components/InvoiceHeader.tsx` | Also exports a local `getStatusStyles` helper used only by its own `StatusBadge` — both are removed together; nothing else imports `getStatusStyles` (verify during implementation). |
| `app/supplier-bills/[id]/components/Badges.tsx` | Exports its own `StatusBadge`; confirmed unused externally (`research.md` §7) — safe to remove entirely, no importer updates needed elsewhere. |
