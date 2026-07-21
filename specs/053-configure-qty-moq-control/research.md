# Research: Configure Order Quantity Control by MOQ

## Decision 1: Reuse vs. extract a shared quantity stepper component

- **Decision**: Implement the increase/decrease controls inline in `app/configure/page.tsx`, as small local helper functions plus JSX in the Qty `<td>`. Do not extract a new shared `components/QtyStepper.tsx` in this feature.
- **Rationale**: A codebase search found two existing inline qty-stepper implementations — `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx` and `app/orders/[id]/components/ProductCatalog.tsx` — each duplicated locally rather than sharing a component. Following the existing single-file page convention (Constitution Principle V: simplicity, no premature abstraction) keeps this change scoped to the one page named in the feature request. Extracting a shared component would touch three files' behavior for a feature that only asks for the Configure Order page, increasing review surface and risk of regressing the two existing order-detail flows.
- **Alternatives considered**: Extracting `components/QtyStepper.tsx` and refactoring all three call sites to use it. Rejected for this feature: valuable future cleanup, but out of scope per Constitution Principle V and the spec's Assumptions ("no new backend or Salesforce API changes... only the quantity value and how it is edited are in scope").

## Decision 2: Floor behavior diverges intentionally from existing precedent

- **Decision**: The decrease control floors at the product's MOQ (not 0), and is disabled once the floor is reached, per FR-003 and the Edge Cases section of the spec.
- **Rationale**: The two existing stepper implementations (`OrderDetailsTable.tsx`, `ProductCatalog.tsx`) both clamp with `Math.max(0, qty - moq)`, i.e. they floor at 0, not at MOQ, and neither uses a `disabled` attribute on the decrement button. The feature spec for this page explicitly requires a MOQ floor (a line can never go below its MOQ) and calls for the control to stop working or be visibly disabled at that floor. This is a deliberate, spec-driven divergence for the Configure Order page — it is not a bug relative to the other two pages, which have their own (different) requirements and are out of scope here.
- **Alternatives considered**: Matching the other pages' floor-at-0 clamp for visual/behavioral consistency across the app. Rejected because it would silently violate FR-003 and let a line's quantity read a value below MOQ, which the spec explicitly disallows for this page.

## Decision 3: Visual style of the increase/decrease buttons

- **Decision**: Use the larger `w-8 h-8` icon-button style (border, shadow-sm, hover background) matching `OrderDetailsTable.tsx`'s stepper, rather than the more compact `w-6 h-6` catalog-row style from `ProductCatalog.tsx`.
- **Rationale**: The Configure Order lines table already uses similarly sized `w-6 h-6`/`w-5 h-5` controls for expand/collapse and remove-row actions in dense rows, but the Qty column has its own dedicated cell with room for a taller control; the `OrderDetailsTable.tsx` style is used in an analogous "line item quantity" context (order lines) rather than a catalog browsing list, making it the closer precedent for this exact use case.
- **Alternatives considered**: The catalog-row compact style — rejected as that pattern is used for browsing/adding rows, not for editing an existing committed order line's quantity.

## Decision 4: Normalizing non-MOQ-aligned quantities from old drafts (FR-010)

- **Decision**: On the next increase or decrease action for a line whose stored `qty` is not `MOQ, 2×MOQ, 3×MOQ, ...`-aligned (e.g. a quantity saved to `localStorage` under a previous MOQ value or before this feature existed), compute the nearest MOQ-aligned quantity at or above the MOQ floor (`Math.max(moq, Math.round(qty / moq) * moq)`), then apply the requested step from that normalized value.
- **Rationale**: The existing `gth-configured-draft` localStorage draft can hold lines created before this feature (arbitrary qty) or after a product's MOQ changes in Salesforce between sessions. FR-010 requires the system not to leave the line stuck in an invalid state; normalizing on next interaction (rather than eagerly rewriting all drafts on load) keeps the change minimal and avoids surprising the user with a silent quantity change before they take any action.
- **Alternatives considered**: Eagerly normalizing all lines' quantities when the draft loads on mount. Rejected as a larger behavioral change (silently altering displayed quantities without user action) than the spec calls for; normalizing lazily on first interaction satisfies FR-010 with a smaller, more predictable blast radius.

## Decision 5: MOQ default when missing/invalid (FR-004)

- **Decision**: Reuse the existing fallback already present in the catalog-mapping code (`app/configure/page.tsx:72`: `moq: p.MOQ__c || p.moq || 1`), and additionally guard against non-numeric or non-positive values by coercing any `moq <= 0` or `NaN` to `1` wherever MOQ is read for stepping/flooring logic.
- **Rationale**: The catalog mapping already defaults falsy MOQ to `1`, covering `undefined`/`0`/`null`/`""`. The spec's edge case additionally calls out negative or non-numeric MOQ, which the existing `||` fallback would not catch (e.g. `-5` or `"abc"` are truthy). A small `resolveMoq(product)` helper closes this gap for the new stepping logic without changing the existing catalog-mapping line.
- **Alternatives considered**: Validating/sanitizing MOQ at the Salesforce data-fetch boundary instead of at point-of-use. Rejected as broader in scope than this feature (would touch the shared products-fetch code path used elsewhere) and unnecessary — a local guard where MOQ is consumed for stepping is sufficient and keeps the change contained to this page.

## Open questions

None — all clarifications needed were resolved during `/speckit-specify` (see `spec.md`'s FR-012 resolution: quantity increases are not capped by available-to-sell stock).
