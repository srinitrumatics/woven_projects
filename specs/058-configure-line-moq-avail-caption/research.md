# Research: Configure Order Lines — MOQ/Available-to-Sell Caption Under Order Qty

## Decision 1: Keep the change inline in `ConfigureOrderClientPage.tsx`; no shared component

- **Decision**: Add the caption's markup directly inside the existing Order Qty `<td>` in
  `app/configure/ConfigureOrderClientPage.tsx`, and fix the two line-creation call sites in the
  same file. Do not extract a shared `QtyMoqAvailCaption` component.
- **Rationale**: This mirrors the precedent already established by feature 053 (this same page's
  MOQ-stepper feature), which found two other inline qty-caption implementations elsewhere in the
  codebase (`MyOrderTable.tsx`, `ProductCatalog.tsx`) and deliberately chose not to unify them into
  a shared component, per Constitution Principle V (simplicity, no premature abstraction). The
  caption here is a two-line JSX addition reading from data already computed in this same render
  scope (`lineMoq`, `l.avail`) — there is no meaningful duplication to eliminate yet, and forcing a
  shared component now would touch three files' rendering for a feature that only asks for the
  Configure Order page.
- **Alternatives considered**: Extracting a shared caption component used by both
  `ConfigureOrderClientPage.tsx` and `MyOrderTable.tsx`. Rejected as out of scope — valuable future
  cleanup, but the ticket only asks for the Configure Order page, and both existing captions are
  simple enough (one JSX line each) that sharing a component would add more indirection than it
  removes.

## Decision 2: The real gap is that `avail` is silently dropped when a line is created

- **Decision**: Add `avail: enriched.avail` (or `avail: p.avail` where `p` is already the enriched
  product) to the line-object literal in both `makeLine()` (line ~188-193, used by
  `addProductFromCatalog` for quick-add and catalog-panel "+ " add) and inline in
  `addProductFromCatalogAt()`'s own line-object literal (line ~377-380, used by drag-and-drop
  insertion). Both call sites already compute an `enriched` object that includes
  `avail: details.avail ?? prod.avail` (from `fetchProductDetails`'s Salesforce-sourced
  `Available_To_Sell__c ?? availableQty`), but neither call site's final line object actually spreads
  or copies that field — each builds its line as an explicit field list that omits `avail`.
- **Rationale**: Without this fix, every newly added line would render "Avail: undefined" (or
  require a defensive `?? 0` that masks a real, always-undefined value) — the caption would be
  present but never actually informative for new lines, silently failing FR-001/FR-004. This is
  the one non-cosmetic code fix this feature requires; everything else is markup.
- **Alternatives considered**: Reading `avail` from the separate `catalog` state (the Algolia-backed
  browse list) by looking up the line's `productId` at render time instead of storing it on the
  line. Rejected — the catalog list is Algolia-search-derived and explicitly documented in this
  file as "never authoritative for order-line fields" (see the comment above
  `fetchProductDetails`), whereas `enriched.avail` already comes from the authoritative
  Salesforce-backed `fetchProductDetails` call. Storing it on the line (as MOQ and sell price
  already are) keeps a single, consistent, authoritative source per line and survives the
  localStorage draft round-trip for free.

## Decision 3: Caption format matches the Order Detail page exactly, not this page's own catalog-panel convention

- **Decision**: Render the caption as `MOQ: {lineMoq} / Avail: {l.avail ?? 0}` — a plain, unstyled
  two-value string — matching `MyOrderTable.tsx:178`'s exact convention
  (`MOQ: {product.moq || 1} / Avail: {product.availableQty}`), not this page's own "Browse Catalog"
  panel convention of specially rendering a negative avail as "Unlimited" and zero as "0 avail"
  with colored badge styling (`ConfigureOrderClientPage.tsx` lines 895-897, `av.text`/`av.cls`).
- **Rationale**: The feature request explicitly says "just like my order tab in order details
  page," naming that page's format as the reference, not this page's own existing catalog-panel
  style. Introducing the catalog panel's negative-means-unlimited interpretation here would be a
  new, unrequested behavior for this specific caption and would diverge from the literal reference
  the user gave.
- **Alternatives considered**: Reusing the catalog panel's `av.text`/`av.cls` badge logic for
  visual consistency within this same page. Rejected — out of scope per the explicit reference to
  the Order Detail page's plainer format; would also introduce a semantic (negative = unlimited)
  that the Order Detail page's own caption does not have.

## Decision 4: MOQ default and Avail default

- **Decision**: Reuse the existing `resolveMoq(l)` helper (already computed as `lineMoq` at line
  ~791 for the existing MOQ column) for the caption's MOQ value — no change needed there. For Avail,
  use `l.avail ?? 0` at the point of rendering, so a genuinely missing value (e.g., a line created
  before this feature shipped, loaded from an old localStorage draft) degrades to 0 rather than
  rendering `undefined`.
- **Rationale**: `resolveMoq` already defaults an invalid/missing MOQ to 1 (FR-003) and is the
  existing source of truth for this line's MOQ column — reusing it guarantees the caption and the
  column can never disagree (SC-004). `?? 0` for avail is the minimal guard needed to handle
  pre-existing drafts/lines that predate this feature's `avail`-carrying fix (Decision 2), matching
  the fallback-to-0 convention already used for missing available-to-sell values elsewhere in this
  codebase (e.g., the Order Detail page's own product-mapping fallback chains).
- **Alternatives considered**: Adding a new `resolveAvail()` helper for symmetry with `resolveMoq`.
  Rejected as unnecessary — a single inline `?? 0` at one render call site does not warrant a named
  helper function, per Principle V.

## Open questions

None — the spec's Assumptions section already resolves the one interpretive question (caption
format follows the Order Detail page, not this page's own catalog-panel styling), and the
underlying data-availability gap (Decision 2) was found by direct code reading, not left uncertain.
