# Research: Consistent, MOQ-Enforced Quantity Input Boxes

## Decision 1: No shared component; harmonize inline in each of the three files

- **Decision**: Apply one canonical `className` string and one canonical floor-on-blur pattern
  independently inside `MyOrderTable.tsx`, `ProductCatalog.tsx`, and
  `ConfigureOrderClientPage.tsx`. Do not extract a shared `QtyInput` component.
- **Rationale**: Feature 053 (this repo's prior MOQ-stepper feature) already considered and
  rejected extracting a shared stepper/input component for these exact same call sites, on the
  grounds that the implementations are small enough that a shared component would add more
  indirection than it removes, per Constitution Principle V. That reasoning still holds: after this
  feature, all three inputs are ~10-15 lines of near-identical JSX reading from already-local
  variables (`product`/`l`, `moq`, `orderQty`) — sharing a component would require prop-drilling
  each surface's differently-named state and handlers for no behavioral benefit.
- **Alternatives considered**: Extracting `components/QtyInput.tsx` used by all three. Rejected —
  out of scope per Principle V and the existing precedent from feature 053.

## Decision 2: The canonical `className`

- **Decision**: Standardize all three inputs on:
  `"w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"`
- **Rationale**: `MyOrderTable.tsx:164` and `ProductCatalog.tsx:227` are already ~95% identical
  (`w-16`, `px-1 py-0.5`, same border/rounded/bg/focus classes) — they differ only in whether
  `text-sm` is stated explicitly and in class ordering. Merging them into one exact string (keeping
  `text-sm` explicit so the input's font size doesn't depend on an ambient table font class)
  requires a one-line change to each. `ConfigureOrderClientPage.tsx:831`
  (`"w-14 text-center text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"`)
  differs more: narrower width (`w-14` vs `w-16`), no explicit horizontal/vertical padding (relies
  on the browser's native `<input type="number">` default box model), a lighter border shade
  (`border-gray-200` vs `border-gray-300`), a thinner focus ring (`ring-1` vs `ring-2`, and no
  `focus:border-transparent`), and an extra `font-medium`. Adopting the two-already-matching boxes'
  style as the canonical one (rather than inventing a fourth variant) is the smallest change that
  satisfies "same in style and size" (FR-001).
- **Alternatives considered**: Standardizing on the Configure Order page's narrower `w-14` style
  instead. Rejected — two of the three inputs already agree on `w-16`, so conforming the one
  outlier is smaller-diff than changing two already-matching implementations.

## Decision 3: Floor-on-blur, not floor-on-keystroke

- **Decision**: Add an `onBlur` handler to `MyOrderTable.tsx`'s and `ProductCatalog.tsx`'s quantity
  inputs that, if the current value is below the product's MOQ (or blank), corrects it to the MOQ.
  `ConfigureOrderClientPage.tsx` already has this shape (`commitOrderQty`, called `onBlur`) — its
  existing floor value (`Math.max(1, ...)`, i.e., floor at 1 case) is what changes to
  `Math.max(resolveMoq(l), ...)` (floor at MOQ units).
- **Rationale**: `ProductCatalog.tsx`'s `handleCatalogQuantityChange` in `app/orders/[id]/page.tsx`
  has an explicit comment anticipating exactly this: *"Ensure quantity respects MOQ steps and
  minimum... allow typing freely, validation happens on blur or we can force steps"* — the
  intended design already assumed blur-time correction, it was simply never implemented.
  `MyOrderTable.tsx`'s `handleQuantityChange` only blocks negative values, with no MOQ awareness at
  all today. Correcting on blur (not on every keystroke) avoids fighting the user mid-type (e.g.,
  typing "1" then "10" toward a target of "100" must not get force-corrected to MOQ after the first
  keystroke), matching FR-007 and the same "normalize lazily, not eagerly" precedent already used
  for the Configure Order page's own quantity input in feature 053.
- **Alternatives considered**: Clamping on every keystroke (`onChange`). Rejected — would make it
  impossible to type any multi-digit target quantity that starts below MOQ, directly violating
  FR-007.

## Decision 4: Redefining the Configure Order page's quantity — the three required follow-on fixes

- **Decision**: Once the Configure Order page's `orderQty` field means "actual order units"
  instead of "count of MOQ-sized cases" (per the resolved clarification, User Story 2 scenario 4,
  and User Story 4), three dependent calculations must be corrected in the same file:
  1. **Totals** (`calcTotals`, line ~171, and the per-line `totalPrice`, line ~794): remove the
     extra `* resolveMoq(...)` factor — price is now `unitPrice × orderQty` directly, not
     `unitPrice × orderQty × MOQ`.
  2. **"Total Qty" column** (header at line ~749, cell at line ~846, and the group-row subtotal
     calc at line ~767 which also multiplies by MOQ): remove the column and its now-redundant
     `totalQty` variable entirely, since it would be numerically identical to the redefined
     `orderQty`.
  3. **Salesforce submission** (`handleCreateOrder`, line ~497): change
     `Order_Qty__c: safeOrderQty(l) * resolveMoq(l)` to `Order_Qty__c: safeOrderQty(l) /
     resolveMoq(l)`, and add `MOQ__c: resolveMoq(l)` (currently absent from this payload entirely).
- **Rationale**: These are not optional polish — leaving any of the three unfixed would either
  inflate displayed prices by a factor of MOQ, show a column that duplicates another column
  verbatim, or submit a Salesforce order-line quantity that is MOQ² times too large (since
  `handleCreateOrder` already multiplied by MOQ once under the old model; under the new model
  `safeOrderQty(l)` is already the raw total, so multiplying again would double-apply MOQ). Item 3
  additionally brings this page's independent order-creation path in line with the `Order Qty ÷
  MOQ` Salesforce field convention already established for the Order Detail page's submission flow
  in feature 057 (`app/orders/[id]/page.tsx`'s `handleSubmitOrder`/`handleClone`) — the two
  order-creation paths currently disagree about what `Order_Qty__c` means, and this fix resolves
  that disagreement in favor of the already-shipped, spec'd convention.
- **Alternatives considered**: Keeping the "Total Qty" column but redefining it to show something
  else (e.g., re-purposing it for a future need). Rejected — no such need was requested; an unused,
  repurposed column would be speculative per Principle V. Leaving `Order_Qty__c` as
  `safeOrderQty(l)` unmultiplied but omitting `MOQ__c`. Rejected — would still disagree with the
  Order Detail page's convention and leave Salesforce unable to reconstruct the displayed quantity
  on reload (same reconstruction logic feature 057 relies on: `displayed = Order_Qty__c × MOQ__c`).

## Decision 5: Stepper step size and floor on the Configure Order page

- **Decision**: `bumpQty` (line ~247) changes from `Math.max(1, safeOrderQty(l) + direction)` (step
  ±1 case, floor 1 case) to stepping and flooring by the line's own resolved MOQ:
  `const moq = resolveMoq(l); return { ...l, orderQty: Math.max(moq, safeOrderQty(l) + direction *
  moq), dirty: true }`. The `atFloor` check (line ~795, `orderQty <= 1`) changes to `orderQty <=
  lineMoq`.
- **Rationale**: This is the direct mechanical consequence of Decision 4 — once `orderQty` means
  raw units, "one step" must mean "one MOQ" (matching the already-correct step behavior on the
  other two surfaces) rather than "one case," and the floor must be the MOQ value rather than the
  literal number 1. `l` already carries its own `moq` field (set at line creation), so
  `resolveMoq(l)` requires no additional data fetch.
- **Alternatives considered**: None meaningful — this follows directly and unambiguously from
  Decision 4; there is no reasonable alternative once the field's meaning changes.

## Decision 6: Default value at line creation

- **Decision**: `makeLine` (line ~192) and `addProductFromCatalogAt` (line ~379) change
  `orderQty: 1` to `orderQty: p.moq` / `orderQty: enriched.moq` respectively (both already resolve
  MOQ via `resolveMoq`/existing fallback chains before this point in the same functions).
- **Rationale**: Directly required by FR-002 (default to MOQ) now that the Configure Order page is
  in scope. This matches the default-to-MOQ behavior the other two surfaces already have when a
  line is first created.
- **Alternatives considered**: None — this is the literal requirement.

## Open questions

None — the one scope ambiguity from `/speckit-specify` was resolved via the Clarifications session
(Option C, full three-surface scope), and every follow-on consequence of that choice was traced to
a specific, already-identified line range in `app/configure/ConfigureOrderClientPage.tsx` by direct
code reading, not left uncertain.
