# Research: Order Detail Page — MOQ, Field Mapping & Contact Corrections

## Decision 1: Where to compute the Total Order Qty ÷ MOQ conversion

- **Decision**: Compute `Order_Qty__c = product.orderQty / product.moq` and always include
  `MOQ__c: product.moq` inline in the `orderLines.map(...)` payload-construction blocks already
  present in `handleSubmitOrder` (`app/orders/[id]/page.tsx:1380-1389`) and `handleClone`
  (`app/orders/[id]/page.tsx:1480-1489`). Do not add a server-side transform.
- **Rationale**: `updateOrderFromSalesforce`/`cloneOrderFromSalesforce`
  (`lib/salesforce-service.ts:397-467`) `JSON.stringify(orderData)` and PATCH it straight to
  `{instanceUrl}/services/apexrest/gtherp/orders` with no field remapping — confirmed by reading
  both functions. The Apex REST endpoint receives exactly what the client sends. Since both
  submission call sites already build their own `orderLines.map(...)` block independently (they
  are not deduped today), the conversion must be applied in both places, matching the existing
  code structure rather than introducing a new shared payload-builder function that neither call
  site currently uses.
- **Alternatives considered**: Adding a transform inside `updateOrderFromSalesforce` /
  `cloneOrderFromSalesforce` in `lib/salesforce-service.ts`. Rejected — those functions are
  intentionally generic passthroughs used by other callers' shapes too (they just relay whatever
  `orderData` they're given); coupling them to this page's specific `Order_Qty__c`/`MOQ__c`
  semantics would violate Principle V (no speculative generalization) and risk affecting any other
  future caller of the same generic functions.

## Decision 2: Reversing the conversion when a saved order reloads

- **Decision**: In the `fetchOrder` effect's order-lines mapping block
  (`app/orders/[id]/page.tsx:921-940`), set `orderQty: (item.Order_Qty__c || 0) * moq` (where `moq`
  is the same resolved MOQ used for that line — see Decision 4), instead of the current
  `orderQty: item.Order_Qty__c` passthrough.
- **Rationale**: FR-003 requires that reopening a saved order shows the same Total Order Qty the
  user last set. Since Decision 1 changes what `Order_Qty__c` stores going forward (number of MOQ
  multiples, not raw units), the read path must apply the inverse multiplication so old and newly
  saved orders both display correctly. This mirrors the existing pattern in the same block, which
  already derives `subtotal: item.Total_Price__c` and `moq: item.MOQ__c || 1` from the raw line
  record.
- **Alternatives considered**: Storing both the raw unit total and the MOQ-multiple count as
  separate Salesforce fields so no client-side inverse math is needed on load. Rejected — this
  would require a new Salesforce field, which is out of scope per the spec's Assumptions (no new
  Salesforce schema changes) and the ticket's explicit formula (`Total Order Qty / MOQ = Order
  Qty`) already defines a single derived field, not two.

## Decision 3: Fixing the Avail chip and Brand field-name mapping

- **Decision**: Replace the hardcoded `availableQty: 999` (line 932) with a fallback chain:
  `item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? 0`. Replace
  `item.Product_Brand_Name__c` (line 928) with `item.gtherp__Brand_Name__c ?? item.Brand_Name__c ??
  item.Product_Brand_Name__c ?? ""`. Apply the same fallback chains to the catalog-products mapping
  (lines 610-613) for consistency, even though `brand`/`availableQty` there already read closer
  field-name guesses.
- **Rationale**: `lib/product-sync-service.ts` (the Algolia product-sync path, a working,
  already-shipped mapping from the same Salesforce org) confirms the real field names are
  `gtherp__Available_To_Sell__c` and `gtherp__Brand_Name__c`, each with a documented unprefixed
  fallback (`Available_To_Sell__c`, `Brand_Name__c`) for cases where the namespace is stripped by
  the response serializer. This page's own product-catalog mapping already partly follows this
  convention for `availableQty` (`item.Available_To_Sell__c || item.availableQty || 0`) but the
  saved-order-lines mapping never reads it at all (hardcoded 999), and Brand uses an entirely
  different, unconfirmed field name (`Product_Brand_Name__c`) in both places. Reusing the
  already-verified fallback chain is the smallest, most consistent fix and requires no access to
  or changes in the Salesforce org itself.
- **Alternatives considered**: Requesting a fixed/renamed field from the Apex REST endpoint's
  response shape. Rejected as out of scope — this repo does not control the Apex endpoint's
  response serialization, and the existing fallback-chain convention already handles this class of
  problem elsewhere in the codebase without any backend change.

## Decision 4: MOQ default when missing/invalid (shared by Decisions 1-3)

- **Decision**: Reuse the existing fallback already present at both product-mapping sites
  (`item.MOQ__c || item.moq || 1` at line 613; `item.MOQ__c || 1` at line 933) as the single
  source of each line's resolved MOQ for the Order Qty conversion (Decisions 1-2). No new
  MOQ-resolution helper is introduced.
- **Rationale**: Both existing fallbacks already coerce a missing/falsy MOQ to `1`, which is
  sufficient for this feature (unlike the Configure Order feature, 053, this ticket does not ask
  for negative/non-numeric MOQ guarding — no such case was reported, and introducing one here would
  be a speculative addition beyond the ticket's scope, per Principle V).
- **Alternatives considered**: Introducing a shared `resolveMoq` helper (as done in feature 053 for
  `app/configure/page.tsx`). Rejected for this feature — the existing `||` fallback already covers
  every case this ticket describes, and this page's helpers are deliberately kept inline per
  Decision 1's rationale.

## Decision 5: Total Order Qty stepper parity between My Order and Add Products

- **Decision**: Confirmed by direct comparison that `MyOrderTable.tsx`'s stepper
  (`Math.max(product.orderQty - moq, 0)` / `product.orderQty + moq`) and `ProductCatalog.tsx`'s
  stepper (`Math.max(currentQty - moq, 0)` / `currentQty + moq`) already use identical step and
  floor logic today. The reported "Total Order Qty is not incrementing to MOQ" symptom is
  therefore attributed to Decision 2's baseline bug: a reloaded line's starting `orderQty` was the
  raw, unconverted `Order_Qty__c` value (potentially far larger or smaller than any real MOQ
  multiple), which made subsequent MOQ-sized steps look wrong relative to the displayed number
  even though the step size itself was correct. No changes to the increment/decrement math in
  either component are made under this decision — FR-005/FR-006 exist to lock in this already-
  correct parity as an explicit regression guard, consistent with how feature 033's User Story 7
  locked in already-correct cross-table behaviors rather than re-implementing them.
- **Rationale**: Changing working stepper math that isn't actually broken would risk a regression
  for no benefit; the actual defect is upstream (Decision 2), and fixing it there resolves the
  reported symptom without touching `ProductCatalog.tsx`.
- **Alternatives considered**: Rewriting both steppers to share a new common helper. Rejected —
  out of scope per Principle V; the two implementations are already behaviorally identical, so
  there is no bug to fix in the stepping logic itself, only in the value it starts from.

## Decision 6: Contact consolidation approach

- **Decision**: Remove the read-only "Contact Name" `<input>` block (`ShipToContact.tsx:67-80`)
  entirely. Keep the existing "Select Contact" `<select>` as the sole control. No changes to
  `formData.locationContact` itself, `handleContactSelect`, or any code that reads
  `formData.locationContact` (validation in `handleSubmitOrder`, `PDFTemplate.tsx`,
  `Bill_to_Contact_Name` derivation) — the field continues to be set by `handleContactSelect` when
  a contact is chosen from the dropdown; only its redundant, read-only visual duplicate is removed.
- **Rationale**: `formData.locationContact` is read in multiple places beyond this one UI block
  (submit validation, PDF template, billing-contact copy), so it must remain in state exactly as
  populated today. The ticket only asks to remove the *duplicative UI*, not the underlying data
  flow — "Select Contact" already fully drives `locationContact` via `handleContactSelect`
  (`page.tsx:718-733`), so no new data-binding is needed.
- **Alternatives considered**: Making "Contact Name" the single editable control and removing the
  dropdown instead. Rejected — the ticket explicitly asks for a dropdown "similar to Ship to
  Location," and a free-text name field would allow entering a contact that doesn't exist in
  Salesforce, breaking the existing `shipToContactId` validation in `handleSubmitOrder`
  (`page.tsx:1344-1350`), which requires a real Contact ID.

## Decision 7: Recall confirmation via Toast

- **Decision**: Replace the `window.confirm("Are you sure you want to recall this order and set it
  back to Draft?")` block (`page.tsx:1863`) with the same `confirmToast(message, onConfirm)`
  pattern already used by `handleRemoveProduct` (`page.tsx:1126`) and `handleClone`
  (`page.tsx:1446`), both of which use the `useToast()` hook already imported and destructured at
  the top of this file (`page.tsx:29,145`).
- **Rationale**: `confirmToast` is already the established in-app confirmation pattern on this
  exact page for two other state-changing actions; reusing it for Recall is the smallest possible
  change and guarantees visual/behavioral consistency without introducing a new confirmation
  component.
- **Alternatives considered**: Building a dedicated modal for Recall. Rejected — unnecessary given
  an existing, working, already-imported pattern on the same page satisfies the requirement.

## Open questions

None — all six corrections have a concrete, code-grounded fix location and no unresolved
Salesforce-org-side unknowns; the spec's Assumptions section covers the one interpretive
judgment call (Order Qty representing MOQ multiples, not raw units).
