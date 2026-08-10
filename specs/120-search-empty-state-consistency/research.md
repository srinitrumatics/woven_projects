# Phase 0 Research: Consistent, Generic "No Search Results" Message on Landing Pages

## Current state (baseline inventory)

The shared component: `TableEmptyState({ message = "No records found", description })` in `components/ui/DataTable.tsx:40-49`. It renders `message` (bold) and, if provided, `description` (smaller) beneath it. No caller today relies on the default — every landing page passes its own strings.

| Page | file:line | Branch condition today | "Search/filter empty" message | "Genuinely empty" message (if distinct) |
|---|---|---|---|---|
| Orders | `app/orders/page.tsx:882-887` | `searchQuery \|\| activeTab !== "All"` | title: `"No orders found"`; desc: `"Try adjusting your filters"` | desc: `"Get started by creating your first order"` |
| Invoices | `app/invoices/page.tsx:488-491` | `searchQuery \|\| activeTab !== "All"` | title: `"No invoices found"`; desc: `"Try adjusting your filters"` | desc: `"No invoices available"` |
| Quotes | `app/quotes/page.tsx:465-470` | `searchQuery \|\| activeTab !== "All"` | title: `"No quotes found"`; desc: `"Try adjusting your filters"` | desc: `"Get started by creating your first quote"` |
| Shipments | `app/shipments/page.tsx:463-466` | `searchQuery \|\| activeTab !== "All"` | title: `"No shipments found"`; desc: `"Try adjusting your filters"` | desc: `"No shipping manifests available"` |
| Proposals | `app/proposals/page.tsx:514-519` | `searchQuery \|\| activeTab !== "All"` | title: `"No proposals found"`; desc: `"Try adjusting your filters"` | desc: `"Get started by creating your first proposal"` |
| Purchase Orders | `app/purchase-orders/page.tsx:296-299` | `searchQuery` **only** — does not check `activeTab` | title: `"No Purchase Orders Found"`; desc: `` `We couldn't find any results matching "${searchQuery}". Try a different search term.` `` **(echoes search term)** | desc: `"There are currently no purchase orders in the system."` |
| Supplier Bills | `app/supplier-bills/page.tsx:275-278` | `searchQuery` **only** — does not check `activeTab` | title: `"No Supplier Bills Found"`; desc: same echoing template as Purchase Orders **(echoes search term)** | desc: `"There are currently no supplier bills in the system."` |
| Inventory | `app/inventory/page.tsx:591-594` | none — single case always | title: `"No inventory items found"`; desc: `"Try adjusting your filters or search query to find what you're looking for."` | *(none — same message shown even when the dataset is genuinely empty)* |
| Products (ListView) | `app/products/ProductClientPage.tsx:661-663` | none — single case always | title: `"No products found."`; no description | *(none)* |
| Products (CardView) | `app/products/ProductClientPage.tsx:540-543` | none — single case always, and **does not use `TableEmptyState` at all** (bespoke inline `<div>`) | `"No products found matching your criteria."` | *(none)* |

Both `purchase-orders` and `supplier-bills` declare `activeTab` state and filter by it (`purchase-orders/page.tsx:170-171`, `supplier-bills/page.tsx:144-151`), but their empty-state condition never checks it — a pre-existing inconsistency (filtering by tab alone to zero rows currently shows the "genuinely empty" message, not the search/filter-empty one) that this feature's FR-004 requires fixing as part of the same pass, since it's the same branch being touched anyway.

## Decision: shared constants, not a new component

**Decision**: Add two exported `const` string values (`SEARCH_EMPTY_MESSAGE`, `SEARCH_EMPTY_DESCRIPTION`) inside `components/ui/DataTable.tsx`, immediately above or below `TableEmptyState`, and import them at each of the nine call sites.

**Rationale**: `TableEmptyState` already takes `message`/`description` as plain props — no new component behavior is needed, only a single shared source of truth for the two strings so every page can't drift again. Placing the constants in the same file as the component they describe keeps them discoverable without adding a new file (Constitution Principle V).

**Alternatives considered**:
- *Give `TableEmptyState` a new `variant="search-empty"` prop that renders fixed text internally.* Rejected — over-engineering for two strings; every call site would still need to pass the variant, no less code than passing the constants directly, and it couples display text to the component's own API instead of leaving it as caller-supplied content (matching every other current caller).
- *Define the constants in a new `lib/constants` file.* Rejected — no such shared UI-text constants file exists in the codebase today, and creating one for two strings used only by `TableEmptyState` callers doesn't reduce file-touch count versus co-locating with the component itself.

## Decision: exact copy

**Decision**: `SEARCH_EMPTY_MESSAGE = "No matching records found"`, `SEARCH_EMPTY_DESCRIPTION = "Try adjusting your search or filters."`

**Rationale**: Generic (names no entity type, satisfies spec FR-002), contains no template interpolation of any kind (satisfies FR-003), and is close in tone to the existing default (`"No records found"`) and to the "Try adjusting your filters" wording already used on five of the nine pages today — minimizing the perceived change for users already familiar with that phrase.

## Decision: Purchase Orders / Supplier Bills condition widening

**Decision**: Change both pages' ternary condition from `searchQuery ? ... : ...` to `(searchQuery || activeTab !== "All") ? ... : ...`, matching the other seven pages.

**Rationale**: Spec FR-004 requires the unified message whenever "a search term is active, a filter/tab is active, or both." Without this widening, a tab-only filter that matches zero rows on these two pages would keep showing the "genuinely empty system" message, which is both inconsistent with the other seven pages and factually wrong (the system isn't empty — the filter just matched nothing).

## Decision: Products page (both views)

**Decision**: Give `ProductClientPage.tsx`'s `ListView` the same `message={SEARCH_EMPTY_MESSAGE} description={SEARCH_EMPTY_DESCRIPTION}` props (unconditionally — it has no onboarding-distinct message to preserve). Replace `CardView`'s bespoke inline `<div>` entirely with a `<TableEmptyState>` call using the same two constants, wrapped in the same `col-span-full` grid cell so it still spans the card grid correctly.

**Rationale**: Spec FR-006 explicitly calls this page out. Since Products never had a "genuinely empty catalog" vs. "search matched nothing" distinction to begin with (unlike Orders/Invoices/etc.), there's no existing onboarding text to preserve — the fix is a straight replacement, and reusing `TableEmptyState` in CardView removes the one landing-page empty state that didn't use the shared component at all.

## Open questions

None — all unknowns from the Technical Context are resolved above; no `NEEDS CLARIFICATION` markers remain.
