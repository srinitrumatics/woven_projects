# Phase 0 Research: Status-Badge Consolidation (Remaining Gaps)

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation that grounded the plan for each of the 5 finding groups, including two non-obvious design decisions (extending the shared component's vocabulary) that a naive "just import StatusBadge everywhere" pass would have gotten wrong.

## 1. Order Detail header (`OrderHeader.tsx`)

**Decision**: Replace the hand-rolled ternary chain (lines 83–102) with `<StatusBadge status={orderStatus} variant="pill" />`.

**Investigation**: The block colors Delivered/Draft/Approved/In Progress/Submitted/Canceled with its own hex choices, inconsistent with the shared component's mapping for the same values (e.g. here "Approved" is `bg-green-200 text-green-900`, a different shade than the shared component's green). `variant="pill"` is chosen to match `app/orders/page.tsx:926`'s existing `<StatusBadge status={...} variant="pill" />` for the exact same field (Order's own `status`) — the most directly comparable precedent (list view vs. detail-header view of the identical value), matching the "closest sibling wins" rule established in prior specs. (Order Line Detail's `LineHeader.tsx:149` uses the default/bordered variant for its own distinct line-level status — not the more relevant precedent here since it's a different granularity of record.)

**Alternatives considered**: Matching `LineHeader.tsx`'s bordered variant instead — rejected, since the List page is a closer precedent (same record, same field) than the Line Detail page (a child record).

## 2. Home / Program360 "Needs attention" panel

**Decision**: Replace the single render site (`app/home/page.tsx:366-367`, byte-identical in `app/program360/page.tsx`) — `<span className={item.pillClass}>{item.status}</span>` — with `<StatusBadge status={item.status} variant="compact" />`. Remove the now-unused per-item `pillClass` property from all 5 category definitions in the `needsAttention` array in both files.

**Investigation**: Each category (Orders in Draft, Proposals, Quotes, Invoices, Shipments) hardcodes a `pillClass` chosen per category — 3 of 5 are a fixed color regardless of the item's real `status` (Orders in Draft: always orange; Proposals: always blue; Invoices: always red), and 2 of 5 have only a binary ternary (Quotes: orange if `'Expiring'` else green; Shipments: red if `'Delayed'` else green) — none reflect the item's actual status value the way the rest of the app does. `variant="compact"` most closely matches the current shape (`px-2 py-0.5 rounded(-md) text-xs font-bold`). The separate `badgeClass` property (a different, unrelated per-category count-badge color for the section header, not tied to any individual record's status) is untouched — confirmed via grep it's used only at a different render site (`page.tsx:343`) for the category header's count circle, not the per-item status.

**Rationale**: This is the same "unconditional color regardless of real value" defect class already fixed in the previously-shipped Shipment Line Detail fix — applying the same resolution here (route through the shared component) is the established pattern.

**Alternatives considered**: Fixing each category's ternary to be "more correct" while keeping the local `pillClass` approach — rejected; this is exactly the kind of per-page hand-rolled duplicate logic specs 079-082 have been eliminating everywhere else.

## 3. Product Info Card & Add-to-Order Modal

**Decision**:
- `ProductInfoCard.tsx` (line 46): replace the decorative dot + unconditionally-green text (`<div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-50"></div><span className="text-xs font-bold text-green-600">{product.status}</span>`) with `<StatusBadge status={product.status} variant="compact" />` alone, dropping the decorative dot.
- `AddToOrderModal.tsx` (line 260): replace `<p className="text-xs font-bold text-amber-600 uppercase">{order.status}</p>` with `<StatusBadge status={order.status} variant="compact" />`.

**Investigation**: Both are confirmed unconditional — `product.status` can be `"Draft"` (per `app/products/[id]/page.tsx:181,187`), which renders green here regardless, when the shared convention colors "Draft" blue. No existing "status dot" convention was found elsewhere in the app to preserve alongside a badge (grepped for similar `rounded-full` + status-text pairings in Products/Inventory list views — none found), so the dot is dropped rather than invented a new dot-color mapping with no precedent.

**Alternatives considered**: Keeping the dot and giving it its own color logic mirroring the badge — rejected as unnecessary scope (no other part of the app pairs a colored dot with a status badge; the badge shape alone is sufficient and consistent with every other status display).

## 4. Certification Status — reconciling two conflicting local maps

**Decision**: Add `"valid"` as a recognized synonym in the shared `StatusBadge`'s existing green case group (`components/ui/StatusBadge.tsx`, alongside `"approved"`/`"active"`/etc.), then migrate both `EditProductTabs.tsx` (lines 604-608) and `ComplianceCertsTab.tsx` (lines 59-65) to `<StatusBadge status={cert.Certification_Status__c} variant="compact" />` (or `"pill"` — see note below), deleting both local ternary chains.

**Investigation**: The two locals disagree: `EditProductTabs.tsx` correctly distinguishes Valid (green) / Expired (red) / Pending (yellow) / other (gray); `ComplianceCertsTab.tsx` only distinguishes Valid (green, custom hex) / Pending (yellow) — it collapses **Expired and every unrecognized value into the same red bucket**, silently treating an unknown future status as if it were "Expired" (a real information-loss bug, not just a style mismatch). Checked whether simply switching both to the shared `StatusBadge` as-is would work: `components/ui/StatusBadge.tsx`'s switch already has `"expired"` in its orange group (line 59) — matches. But it has **no case for `"valid"`** at all, meaning a bare swap would silently regress "Valid" to gray everywhere in this module. A codebase-wide grep confirmed no other file anywhere pipes a literal `"Valid"` value through the shared `StatusBadge`, so adding this one case is a safe, contained addition with no regression risk elsewhere — consistent with how `080` added `"pending shipment"`/`"new"`/`"on hold"` to the same switch when a real, confirmed gap was found.

**Rationale**: This resolves the disagreement by converging both onto the one component that already gets 2 of 3 relevant values right (Expired, Pending) and needs exactly one new case (Valid) to get all 3 right — cheaper and more consistent than trying to make the two local implementations agree with each other while staying local.

**Alternatives considered**: Deduping to one new shared *local* function scoped to the Products module only (not touching the global `StatusBadge`) — rejected; the project's established trajectory (079-082) is convergence onto the one global component wherever the vocabulary is a subset of, or trivially compatible with, its existing cases, which this is.

## 5. Collection Status — reconciling four divergent treatments

**Decision**: Add `"past due"` as a recognized synonym in the shared `StatusBadge`'s existing red case group (alongside the already-present `"overdue"`, a direct semantic synonym), then migrate `app/invoices/page.tsx` (delete the local `CollectionStatusBadge` function, lines 663-681, and its one call site at line 617) and `app/invoices/[id]/components/InvoiceSummary.tsx` (lines 30-41 `SummaryStatusRow`'s binary variant logic, and its call site at line 100) and `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx` (line 148, currently plain `displayCell`) all onto `<StatusBadge status={collectionStatus} variant="..." />`.

**Investigation**: 4 locations currently disagree:
- `invoices/page.tsx`'s local `CollectionStatusBadge`: exact-string-match (case-sensitive) on `"Paid"`/`"Pending"`/`"Past Due"`, default gray.
- `InvoiceSummary.tsx`'s `SummaryStatusRow`: binary — red only for exactly `"Past Due"`, gray/neutral for literally everything else (including "Paid").
- `orders/[id]/components/FulfillmentTab.tsx:750` and `proposals/[id]/components/FulfillmentsTab.tsx:559`: already route through the shared `<StatusBadge>` — the established "correct" precedent per prior specs' convention, EXCEPT the shared component has no `"past due"` case today (only `"overdue"`), so these two "already migrated" call sites would in fact render `"Past Due"` as **gray**, not red — silently wrong for the single most important value of this field, just never noticed/reported.
- `QuoteInvoicesSubTab.tsx:148`: plain `displayCell`, no color at all.

Checked the real value domain: `app/invoices/mockData.ts` uses a much richer vocabulary than any implementation handles (`"On Track"`, `"Follow Up Required"`, `"Disputed"`, `"Escalated"`, `"Settled"`, etc. — 16+ distinct values). Several of these already coincidentally match existing shared-component cases (`"active"`→green, `"completed"`→green, `"settled"`→emerald, `"pending review"`→yellow), and the rest fall to the shared default gray — which is the correct, safe behavior for values with no established color meaning (neutral, not wrong), consistent with how every other consolidated field in this app handles its long tail of uncommon values.

**Rationale**: Adding `"past due"` as a one-line synonym is the smallest change that makes the two nominally-already-compliant call sites actually correct, and gives the two still-broken call sites a single correct target to converge on. A codebase-wide check (Research §4's method, repeated here) found no other literal `"Past Due"` usage anywhere that expects the current default-gray behavior, so this is a safe, contained addition.

**Variant choice**: `InvoiceSummary.tsx` currently renders this inside a label/value summary row (`SummaryStatusRow`), not a table cell — `variant="compact"` fits best there, matching the shape used by the two already-correct Fulfillment-tab precedents' closest analog. `invoices/page.tsx`'s list-row context and `QuoteInvoicesSubTab.tsx`'s table-cell context both get `variant="compact"`, matching `FulfillmentTab.tsx`'s existing `variant="compact"` for the identical field in the same conceptual position (a list/table row).

**Alternatives considered**: Using `RemittanceBadge` instead of `StatusBadge` for Collection Status, since `RemittanceBadge` already natively handles `"paid"`/`"pending"`/`"past due"` with zero component changes needed — a strong semantic fit. Rejected because 2 of 4 existing call sites (the ones prior specs already touched) established `StatusBadge` as the precedent for this exact field; switching those two away from `StatusBadge` now would be net-new churn to something not flagged as broken, contradicting the minimal-diff, precedent-following approach used throughout 079-083.

## 6. Remittance Status plain-text gaps

**Decision**: Wrap both gaps — `app/proposals/[id]/components/PurchasesTab.tsx:373` and `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx:128` (both currently `{displayCell(bill.remittanceStatus)}`) — with `<RemittanceBadge status={bill.remittanceStatus} />`, matching the established precedent at `app/supplier-bills/page.tsx:376`, `app/supplier-bills/[id]/page.tsx:314`, and `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx:237` (all three already use `RemittanceBadge` for the identical field). `RemittanceBadge` takes no `variant` prop (single fixed shape), so no variant decision is needed.

**Alternatives considered**: None — this field already has an unambiguous, uncontested precedent (`RemittanceBadge`, not the generic `StatusBadge`), unlike Collection Status above.

## 7. Tracking Status plain-text gaps

**Decision**: Wrap all six gaps with `<StatusBadge status={x.trackingStatus} variant="..." />`, choosing each file's variant by matching that **same file's own existing `StatusBadge` usage** for its other status column(s) — the closest possible precedent, per the "closest sibling wins" rule from spec `081`:

| File | Gap line | In-file precedent variant | Chosen variant |
|---|---|---|---|
| `app/purchase-orders/page.tsx` | 397 | `:341` uses default/bordered | default (no `variant` prop) |
| `app/purchase-orders/[id]/components/POLinesTable.tsx` | 183 | `:136` uses default/bordered | default (no `variant` prop) |
| `app/quotes/[id]/components/QuotePurchasesSubTab.tsx` | 139 | `:102` uses `variant="pill"` | `pill` |
| `app/proposals/[id]/components/PurchasesTab.tsx` | 240 | `:156`, `:306` use `variant="pill"` | `pill` |
| `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | 203 | `:166`, `:255` use `variant="compact"` | `compact` |
| `app/proposals/[id]/components/FulfillmentsTab.tsx` | 727 | `:173,319,480,559,644` all use `variant="pill"` | `pill` |

**Rationale**: Every one of these 6 files already imports `StatusBadge` and uses it correctly for at least one other status column — this is purely "finish wrapping the one column that was missed in each file," not a new design decision, so matching that same file's own established variant is unambiguous.
