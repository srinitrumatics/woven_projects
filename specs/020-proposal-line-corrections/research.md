# Phase 0 Research: Proposal Line Page — Fulfillment & Returns Corrections

**Status**: Complete — full audit of `app/proposals/[id]/lines/[lineid]/page.tsx`, `LineFulfillmentsTab.tsx`, and `LineReturnsTab.tsx` against `spec.md`'s FR-010 through FR-015.

## 1. Shared type layer — important constraint

All fulfillment/returns line-item interfaces (`Invoice`, `ShippingManifest`, `SalesOrder`, `CustomerQuote`, `RMA`, `RTV`, `CreditMemo`, `DebitMemo`) are declared **once** in `app/proposals/[id]/types.ts` and imported by both this Line Detail page and the parent Proposal Detail page's `FulfillmentsTab.tsx`/`ReturnsTab.tsx`. Any field additions must be additive (new optional fields) so the parent page's usage is unaffected. All required additions in this feature are additive — no renames or removals of existing shared fields.

## 2. Data-mapping gaps found in `page.tsx` (beyond simple relabeling)

These are **data-layer** fixes required before the corresponding UI columns can show correct values — not just column reordering:

| Line type | Gap | Fix |
|---|---|---|
| Sales Order Line | `customerQuoteLineId` never populated in the mapping (lines ~158-177), even though `SalesOrder` type already declares it | Add `customerQuoteLineId: so.Customer_Quote_Line__c \|\| ''` (exact SF field name to confirm at implementation time) to the mapping, enabling the Customer Quote Line hyperlink (FR-011 #4) |
| Shipping Manifest Line | `boxLength`, `boxWidth`, `boxHeight` are declared on the shared `ShippingManifest` type (added by a prior feature for the parent page) but never populated in this page's fetch (lines ~134-157) | Add `boxLength: sm.Case_Length__c \|\| 0`, `boxWidth: sm.Case_Width__c \|\| 0`, `boxHeight: sm.Case_Height__c \|\| 0` to the mapping |
| Invoice Line | Only `invoiceQty` (from `Invoiced_Qty__c`) is mapped; FR-013 requires "Total Order Qty" specifically from `gtherp__Total_Order_Qty__c`, a distinct field | Add a new `totalOrderQty: item.gtherp__Total_Order_Qty__c \|\| 0` field to the mapping and type (do not repurpose `invoiceQty`) |
| Credit Memo Line | No Customer Quote Line relationship exists at all — neither `customerQuoteLineName`/`customerQuoteLineId` on the `CreditMemo` type nor in the mapping (lines ~331-352) | Add `customerQuoteLineName?: string; customerQuoteLineId?: string;` to the shared `CreditMemo` interface in `types.ts`, and populate both in the mapping — the only line type requiring a net-new relationship field |

## 3. Column-order/content corrections needed per sub-tab

Full current-vs-target diffs (condensed; exact line numbers will be re-verified at implementation time since edits shift them):

**Customer Quote Lines** (`LineFulfillmentsTab.tsx`, "quotes" section): first column ("Customer Quote Line") is currently plain text — must become a hyperlink (uses the line's own `id`, same pattern as other sticky-first-column hyperlinks elsewhere in the app). "Action" column is entirely missing — must be added at the end. Otherwise column order already close to spec.

**Sales Order Lines** ("sales" section): remove **Qty Picked** and **Back Order Qty** columns (not in FR-011's list). "Sales Order" column stays plain text (correct per spec — no hyperlink annotation). Customer Quote Line hyperlink already exists in the UI but is blocked by the missing `customerQuoteLineId` mapping (see §2).

**Invoice Lines** ("invoices" section): swap **Purchase Order Line** and **Customer Quote Line** column order (FR-013 wants Sales Order Line → Purchase Order Line → Customer Quote Line; current order has Customer Quote Line before Purchase Order Line). Rename/replace **"Invoice Qty"** column with **"Total Order Qty"** sourced from the new `totalOrderQty` field. Add missing **"Action"** column at the end. Make the first column ("Invoice Line") a hyperlink (currently plain text) — FR-013 #1 requires it.

**Shipping Manifest Lines** ("shipping" section): reorder so Box Count/Box Net Weight/Box Gross Weight (currently positioned right after Brand) move to their correct position after Qty Shipped, and insert Box Length/Box Width/Box Height between Box Count and Box Net Weight (matching FR-012's exact order: Box Count → Box Length → Box Width → Box Height → Box Net Weight → Box Gross Weight). Remove **Tracking Number, Estimated Delivery Date, Tracking Status, Actual Delivery Date** (not in FR-012's list — this is a Line-item table, not the parent Shipping Manifest header table, so these columns don't apply here). Add missing **"Action"** column at the end. Make the first column ("Shipping Manifest Line #") a hyperlink (currently plain text). Change "Sales Order Line" from a hyperlink to plain text (FR-012 #4 lists it without a hyperlink annotation, unlike Customer Quote Line which does get one).

**RMA Lines** (`LineReturnsTab.tsx`, "rma" section): change **Customer Quote Line** from plain text to a hyperlink (data already available via `customerQuoteLineId`, per the earlier audit — no mapping gap here). Remove **Tracking Number, Estimated Delivery Date, Tracking Status, Actual Delivery Date** (not in FR-014's list) while **keeping Goods Receipt Date** as the last column (already last today, so removing the four preceding columns achieves the correct final order automatically).

**Credit Memo Lines** ("credit" section): remove **Invoice Line** column entirely (not in FR-015's list). Add a new **Customer Quote Line** hyperlink column (requires the type + mapping addition from §2) positioned after Sales Order Line per FR-015 #5.

## 4. Sub-tab ordering

- **Fulfillment tab button order**: currently Customer Quotes Lines → Sales Orders Lines → **Invoices Lines → Shipping Manifests Lines**. FR-008 requires **Shipping Manifest Lines before Invoice Lines** — swap the last two buttons (identical fix pattern to feature 018's parent-page Fulfillment tab).
- **Returns tab button order**: already RMAs Lines → Credit Memos Lines → RTVs Lines → Debit Memos Lines, with RTV/Debit correctly hidden for restricted (Customer/NSO) account types. FR-009 requirements (RMA Lines, then Credit Memo Lines) are already satisfied positionally — no reorder needed here.

## 5. Default sort direction

Both `LineFulfillmentsTab.tsx` (`useSortableData` init, ~line 42) and `LineReturnsTab.tsx` (~line 51) currently initialize with `{ key: 'name', direction: 'desc' }`. FR-006 requires ascending — change both to `direction: 'asc'`. The sort key `'name'` already correctly maps to each line record's own Record ID/name field; only the direction needs to change (identical to the fix pattern in features 016/018).

## 6. Pagination

Already fully implemented in both files (`Pagination` component, `ITEMS_PER_PAGE = 10`, `useMemo`-sliced `paginatedData`) — FR-005 requires no new implementation, matching the spec's assumption.

## 7. Hyperlink URL conventions (confirmed against parent page + route inventory)

| Related record | Route pattern |
|---|---|
| Customer Quote | `/quotes/${id}` |
| Sales Order / Customer Order | `/orders/${id}` |
| Invoice | `/invoices/${id}` |
| Shipping Manifest | `/shipments/${id}` |
| Purchase Order (Line) | `/purchase-orders/${id}` |
| Proposal | `/proposals/${id}` |

No `/returns`, `/rma`, or `/credit-memo` route exists anywhere under `app/` — confirmed via `find`. The parent page's `ReturnsTab.tsx` renders RMA #/Credit Memo # (and RTV #/Debit Memo #) as plain text universally, even while other related-record columns in the same rows are hyperlinked. This fully confirms the spec's decision to leave RMA # and Credit Memo # as plain text in FR-014/FR-015 (no "(hyperlink to record page)" annotation on those two columns) — consistent with the codebase-wide convention that these object types have no detail page route.

## 8. Existing UI patterns to reuse (no new primitives needed)

`SortableHeader`, `useSortableData`, `useResizableColumns`, `Pagination`, `displayCell()` are already used consistently across both files — this feature only changes `label`/`field` props, column JSX ordering, resizable-width config keys, and a small number of additive data-mapping/type changes. No shared component or hook is touched.
