# Research: Configure Order Catalog Sourced from Algolia

## Decision 1 — Where the Browse Catalog list gets its data

**Decision**: Replace the one-shot bulk Salesforce fetch (today's `useEffect` on mount) with a one-shot Algolia query — `index.search('', { hitsPerPage: <same order of magnitude as today's bulk fetch> })` — called once on mount using the manual `algoliasearch` client, the same low-level pattern already present in `app/products/ProductClientPage.tsx` (`logUnfilteredData`). The result populates the existing `catalog` state array, and **all existing local filtering stays exactly as-is**: `filteredCatalog` (driven by `catQ`/`fMfr`/`fFamily`) and `quickAddResults` (driven by `quickAddQ`) continue to be `useMemo`s that filter the in-memory `catalog` array — no per-keystroke Algolia calls, no `InstantSearch`/`useInfiniteHits` widget stack.

**Rationale**: `catalog` today is one full, page-load-time snapshot that both the Browse Catalog panel and the quick-add dropdown independently filter client-side. Querying Algolia per keystroke on `catQ` would leave `catalog` scoped to whatever `catQ` currently is, which breaks `quickAddResults` — a *different* search box (`quickAddQ`) filtering the *same* `catalog` array — the moment the two search boxes disagree. Keeping the fetch one-shot and broad preserves the current architecture byte-for-byte (FR-002: panel doesn't change in position/layout/purpose; User Story 3: flow unchanged) while still satisfying FR-001 (the list's data now originates from Algolia, not Salesforce). This also sidesteps introducing `InstantSearch` machinery this page doesn't otherwise need, per Constitution Principle V.

**Alternatives considered**:
- *Debounced `index.search()` call on every `catQ`/`quickAddQ` change*: rejected — as above, breaks the single shared `catalog` array two independent search boxes both rely on; would require splitting `catalog` into two parallel query-scoped lists, a materially bigger change than this feature's stated scope ("continue flow as before, no change in flow").
- *Wrap the panel in `<InstantSearch>` with `useSearchBox`/`useRefinementList`*: rejected — would require restructuring the panel's markup and state management for no added capability the spec requires.
- *Proxy the Algolia query through a new Next.js API route*: rejected — the Products page already queries Algolia directly from the client with `NEXT_PUBLIC_ALGOLIA_APP_ID`/`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` (a search-only key, safe for client exposure); adding a server proxy route would duplicate an existing, already-accepted pattern for no security or architectural benefit.
- *Live per-keystroke Algolia query, matching the main Products page's search feel exactly*: deferred — out of scope for this data-source-swap feature; the spec's Assumptions note the search index is not yet proven at the scale where one-shot loading breaks down (that risk is already tracked separately in specs 054/055).

## Decision 2 — Resolving which Algolia index to query

**Decision**: Convert `app/configure/page.tsx` into a server component that resolves `indexName` via `getOrgConfig()` (falling back to `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` / `"wovn_products_local"`), then passes it as a prop into a new client component, exactly mirroring `app/products/page.tsx` → `ProductClientPage.tsx`.

**Rationale**: This is the only existing, constitution-aligned pattern in the codebase for getting an org-scoped Algolia index name into a client component (Principle IV — org scoping must happen server-side, not from a client-supplied value). Reusing it means zero new conventions.

**Alternatives considered**:
- *Add a client-callable API route that returns the org's index name*: rejected — would duplicate `getOrgConfig()` behind an extra network hop for a value the server can just as easily hand down as a prop, as it already does for Products.
- *Hardcode the index name*: rejected — breaks multi-tenant isolation (Principle IV) the moment a second organization with a different index is onboarded.

## Decision 3 — Where qty/MOQ come from at add-time

**Decision**: When a product is added via "+" or drag-and-drop, call the existing single-product endpoint `GET /api/salesforce/product-details?accountId&contactId&productId` (backed by `getProductDetailsFromSalesforce`) to fetch that product's current MOQ/quantity/pricing fields from Salesforce, and use the result to populate the new order line. Remove the bulk `GET /api/salesforce/orders?action=products` catalog fetch from page load entirely — it is no longer needed for either the catalog list (now Algolia) or for MOQ (now resolved per-add).

**Rationale**: This satisfies FR-003/FR-004 ("keyed to the specific product added") and the edge case in User Story 2 (must reflect current Salesforce data, not a value that could be stale relative to the search index) more directly than keeping a bulk-fetched, page-load-time snapshot around as a lookup table. It also naturally satisfies FR-007: if `getProductDetailsFromSalesforce` returns nothing for a given product ID (deleted/deactivated/not found), the add action can be rejected with a clear error instead of creating a line with fabricated values. This endpoint and service function already exist and are already used elsewhere (`lib/product-sync-service.ts`) for per-product Salesforce detail lookups, so no new backend code is required.

**Alternatives considered**:
- *Keep the bulk Salesforce catalog fetch on page load as a "facts" map, keyed by product ID, and look up MOQ from it at add-time*: rejected as the primary path — it reintroduces the very bulk-load-time Salesforce dependency this feature is removing from the catalog list, and reintroduces the staleness risk the spec's edge cases call out for long-lived sessions. (The bulk endpoint remains available/unchanged for any other caller; this feature simply stops calling it from Configure Order.)
- *Store MOQ in the Algolia record*: rejected — the existing Algolia sync pipeline (specs 051/052) does not map `MOQ__c` into indexed records today, and adding it would mean trusting a periodically-synced value for an order-affecting field, which FR-008 explicitly disallows treating as authoritative.

## Decision 4 — Handling the add-time Salesforce lookup failing or being slow

**Decision**: While the per-product lookup is in flight, the newly-created line shows a loading state (no qty/MOQ values rendered yet, add controls on that line disabled); on success it populates normally; on failure/not-found it surfaces a toast error (reusing the existing `useToast` hook already wired into this page) and does not add the line at all.

**Rationale**: Matches FR-007 (no line with missing/fabricated data) and the edge cases around slow/unavailable lookups and deleted/deactivated products, while reusing an interaction pattern (toast errors) already established on this page for other failure cases.

**Alternatives considered**:
- *Add the line immediately with placeholder qty=1/MOQ=1 and reconcile once the lookup resolves*: rejected — creates a window where the user could act on (and submit an order with) fabricated values, which FR-008 forbids.

## Open questions

None — the one material ambiguity in the original request (where qty/MOQ should surface after an add action) was resolved with the user during `/speckit-specify` and is captured in `spec.md`'s Assumptions section.
