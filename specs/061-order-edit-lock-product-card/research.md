# Research: Order Detail — Draft-Only Editing & Product Information Card Fields

## Decision 1: The edit lock is centralized — only two gates need to change per page

**Decision**: On the Order Detail page, every editable child component (`BillingInfo`, `ShippingInfo`,
`OrderNotes`, `ShipToContact`, `DeliveryOptions`, `OrderTotal`, `FilesTab`, `ProductCatalog`,
`MyOrderTable`) already receives a single `isEditing` boolean prop from `app/orders/[id]/page.tsx`
and has no independent status check of its own. The *only* code path that can set
`isEditing` to `true` is the `onEditToggle` callback (`page.tsx` lines 1577-1580) wired to the
Edit/Cancel button rendered by `OrderHeader.tsx` (line 61, currently shown whenever
`orderStatus !== "Approved"`). The same shape exists on the Order Line Detail page: `LineHeader.tsx`
(line 61, currently shown whenever `orderStatus` is not in `["Approved", "Delivered", "Canceled"]`)
is the only path to `setIsEditing(true)` in `app/orders/[id]/lines/[lineId]/page.tsx` (confirmed:
`grep setIsEditing` finds exactly one call site on each page besides the initial `useState`).

**Rationale**: Because every editable field/control already funnels through this single
`isEditing` flag, the fix does not require touching `MyOrderTable.tsx`, `ProductCatalog.tsx`,
`BillingInfo.tsx`, `ShippingInfo.tsx`, `OrderNotes.tsx`, `ShipToContact.tsx`,
`DeliveryOptions.tsx`, `OrderTotal.tsx`, `FilesTab.tsx`, `OrderDetailsTable.tsx`, or
`OrderLineNotes.tsx` at all — changing the two Edit-button visibility conditions
(`OrderHeader.tsx`, `LineHeader.tsx`) from their current status-exclusion lists to a single
`orderStatus === "Draft"` allow-rule is sufficient to satisfy FR-001 through FR-004, per
Constitution Principle V (Simplicity — fix the root gate, not every consumer).

**Alternatives considered**: Adding a status check inside each of the ~10 child components
individually. Rejected — redundant given the centralized `isEditing` flag, higher blast radius,
and against the "don't change any design" constraint (touching that many files increases risk of
incidental layout drift).

## Decision 2: Exiting edit mode automatically requires one new effect per page

**Decision**: Add a `useEffect(() => { if (orderStatus !== "Draft") setIsEditing(false); },
[orderStatus])` in `app/orders/[id]/page.tsx`. `handleSubmitOrder` (page.tsx line 1310) already
calls `setOrderStatus(isDraft ? "Draft" : "Submitted")` at line 1416 when a Submit (not Save
Draft) completes, followed by a `window.location.reload()` five seconds later (line 1433) — the
effect closes the five-second window during which the page would otherwise still render editable
fields for an order whose status just became "Submitted". The Order Line Detail page does not
need this effect: its `orderStatus` is fetched once on load and never changed by any action taken
on that page itself (`grep setOrderStatus` finds only the initial fetch assignment at line 166),
so there is no in-page transition away from Draft for it to react to — its `handleSave` (line 251)
already calls `setIsEditing(false)` on its own success path, and entering edit mode is blocked at
the source once `LineHeader.tsx`'s condition changes (Decision 1).

**Rationale**: An effect that reacts to `orderStatus` is simpler and more robust than manually
calling `setIsEditing(false)` at every place `orderStatus` might change (only one such place exists
today, but an effect makes the invariant declarative and satisfies FR-005 generally rather than
for one specific call site).

**Alternatives considered**: Calling `setIsEditing(false)` directly inside `handleSubmitOrder`
alongside its `setOrderStatus` call. Rejected in favor of the effect — functionally equivalent
today, but the effect keeps the invariant ("never editable outside Draft") enforced independent of
which code path changes `orderStatus`, consistent with Constitution Principle V's preference for
guarding the root state rather than each site that could mutate it.

## Decision 3: Brand field for the order-line Product Information card

**Decision**: Map `brand: item.Product_Brand_Name__c || "-"` in
`app/orders/[id]/lines/[lineId]/page.tsx`'s `mappedProducts` construction, matching the exact
convention already used identically nine times in the sibling `app/proposals/[id]/lines/[lineid]/page.tsx`
(e.g. lines 128, 150, 177, 197, 236, 261, 310, 337, 358: `brand: item.Product_Brand_Name__c ||
"-"`) for the same kind of line-level record.

**Rationale**: Unlike the Product Details page (feature 060), which reads from a different Apex
REST endpoint (`gtherp/product/details`) whose field-name shape needed a wide, uncertain fallback
chain, this is a Customer Order Line record read via `gtherp/orderlines` — the same *family* of
line-level endpoint the Proposal Line page already reads from with a single, proven field name.
Reusing that exact expression is the lowest-risk choice; it is already declared on `ProductInfo`'s
prop interface (`brand: string`, line 11) but was never populated, confirming this is a pre-existing
mapping gap rather than a new field being introduced.

**Alternatives considered**: Reusing the wider `gtherp__Brand_Name__r?.Name ?? gtherp__Brand_Name__c
?? Brand_Name__c ?? Product_Brand_Name__c ?? "—"` chain from feature 060. Rejected — that chain was
built for a different, unrelated Apex endpoint with unconfirmed field names; this endpoint's sibling
page already proves `Product_Brand_Name__c` alone is the correct, populated field for order/proposal
line records, so a narrower expression is both simpler and better evidenced here.

## Decision 4: Grouping field — "Grouping" means `Grouping__c`, not `Product_Grouping__c`

**Decision**: Display the "Grouping" field sourced from the existing `grouping` value already
mapped in `ProductData` (`item.Grouping__c || ""`, `page.tsx` line 188) — not `productGrouping`
(`item.Product_Grouping__c`).

**Rationale**: Both `app/quotes/[id]/lines/[lineid]/page.tsx` (line 493) and
`app/proposals/[id]/lines/[lineid]/page.tsx` (lines 846-859) already render two visually distinct,
separately labeled fields side by side: one labeled exactly "Grouping" bound to `product.grouping`
(`Grouping__c`), and one labeled "Product Grouping" bound to `product.productGrouping`
(`Product_Grouping__c`). Since the user's request lists the field as "Grouping" (not "Product
Grouping"), the established app-wide convention unambiguously points to `grouping`/`Grouping__c`.

**Alternatives considered**: Using `productGrouping`/`Product_Grouping__c`, or displaying both.
Rejected — the spec asks for exactly one "Grouping" field, and the sibling Quotes/Proposals pages'
side-by-side, differently-labeled precedent removes any real ambiguity about which one "Grouping"
means.

## Decision 5: MOQ, Lead-Time (Wks), and Shipping Dimensions — reuse existing field names, add to the mapping

**Decision**: Add `leadTimeWks: item.Lead_Time_Wks__c` and `shippingDimensions:
item.Shipping_Dimensions__c || ""` to the `OrderLineItem`/`ProductData` interfaces and mapping in
`app/orders/[id]/lines/[lineId]/page.tsx`; MOQ is already mapped (`moq: item.MOQ__c || 1`,
existing) and just needs to be passed to `ProductInfo`, which doesn't currently receive it.

**Rationale**: `Lead_Time_Wks__c` is a proven, already-denormalized field on a sibling line-level
record: `app/purchase-orders/[id]/lines/[lineid]/page.tsx` line 68 maps `leadTimeWks:
item.Lead_Time_Wks__c` directly off its own line item, confirming this Product2 attribute is
already copied onto at least one other line-record type by the Apex layer. `Shipping_Dimensions__c`
has no existing line-level precedent anywhere in this app (only `lib/products-service.ts`'s
Product2-level catalog mapping uses it) — this is a genuine, flagged unknown. Reusing the same
field name is still the reasonable first attempt, consistent with how Brand's field name was
resolved in features 057/060: map it, and if the `gtherp/orderlines` endpoint doesn't actually
return it, the field will show the same placeholder (FR-011) it would show for any other
unpopulated value, with no error and no broken layout — a live/staging check of the actual API
response during implementation (`quickstart.md`) will confirm whether real data appears or the
placeholder path is exercised.

**Alternatives considered**: Leaving Shipping Dimensions out of scope pending backend confirmation.
Rejected — the spec explicitly requires the field, and FR-011's placeholder requirement already
covers the case where the underlying data isn't yet populated; there is no reason to block the
client-side mapping on a guarantee that isn't obtainable from this repo (Salesforce Apex is out of
this repo's control, same constraint noted in feature 060's plan).

## Decision 6: "Taxable" reuses the existing Yes/No convention, only the label changes

**Decision**: Keep `isTaxable: item.IsTaxable__c === true ? "Yes" : "No"` (existing expression,
unchanged) and only rename the `ProductInfo.tsx` label from "IsTaxable" to "Taxable".

**Rationale**: FR-010 asks for a clear Yes/No value, which the existing expression already
produces; no data-mapping change is needed, only the on-screen label (per FR-012's "don't change
design" constraint, which this reads as label-text changes being in scope while visual/layout
structure is not).
