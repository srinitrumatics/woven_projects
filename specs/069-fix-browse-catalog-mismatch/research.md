# Phase 0 Research: Fix Browse Catalog Showing Non-Salesforce Products

## R1: Why is Browse Catalog showing ~1000 unrelated products?

**Decision**: The root cause is index-resolution fallback, not a sync-worker data-write bug.

**Rationale**: `app/configure/page.tsx:5-6` resolves the index name as:
```
orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || ""
```
`getOrgConfig()` (`lib/org-config.ts`) looks up the organization by request host via `ilike` against `organizations.siteUrl`, and **throws** if no match is found or if `headers()` can't determine a host — `page.tsx` swallows that with `.catch(() => null)`. When that happens (or when an org row exists but has no `algoliaIndexName` set), the page falls back to `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`, which in this repo's `.env` is `wovn_products_local` — a local/seed index, confirmed to be the same fallback value used by `app/products/page.tsx`, `app/search/page.tsx`, and `app/api/algolia/route.ts`. `ConfigureOrderClientPage.tsx:101` then does `index.search('', { hitsPerPage: 1000 })` against whatever index it was handed, with no indication to the user that the index is wrong — hence "1000 products which is not belong to salesforce."

**Alternatives considered**:
- *Cross-org data leak in Algolia* (one org's synced products visible to another) — ruled out as primary cause: the fallback is to a *local/seed* index name, not another organization's real index, and the same fallback pattern exists unchanged on `app/products/page.tsx` which is not the page reported broken.
- *Sync worker writing wrong data* — ruled out: this bug is about which index is *queried*, not what was *written* to any index; the sync worker (`workers/algolia-sync-worker.js`) is out of scope per spec Assumptions.

## R2: What pattern should replace the fixed `hitsPerPage: 1000` fetch?

**Decision**: Adopt the same `react-instantsearch` `InstantSearch` + `Configure` + `useInfiniteHits` pattern already used in `app/products/ProductClientPage.tsx`, rather than inventing a new pagination mechanism.

**Rationale**: The constitution's Technology Stack Constraints section already mandates this pattern for "Catalog/card grid views." `ProductClientPage.tsx` demonstrates a working reference: `InstantSearch` wraps the panel, `Configure` sets a per-page `hitsPerPage`, `useInfiniteHits()` exposes `hits`/`isLastPage`/`showMore`, and an `IntersectionObserver`-driven sentinel calls `showMore()` on scroll. Reusing this keeps the fix consistent with the rest of the app and satisfies FR-006 (search/scroll must reach products beyond the initial load) without a bespoke implementation.

**Alternatives considered**:
- *Raise `hitsPerPage` to a larger fixed number* (e.g., 5000) — rejected: still an arbitrary ceiling, doesn't satisfy "no silent truncation," and Algolia caps a single query's `hitsPerPage` well below typical full-catalog sizes for larger orgs.
- *Manual `search-after`/offset pagination with the raw `algoliasearch` client* (as today, just extended) — rejected: duplicates behavior `react-instantsearch` already provides and that the rest of the app already standardizes on; higher long-term maintenance cost for no added benefit over reusing the existing hook.

## R3: Should displayed catalog products be re-verified against Salesforce at render time? (staleness tolerance)

**Decision (recommended default, pending final user confirmation via `/speckit-clarify`)**: No. Trust the last completed Algolia sync as the source for what the Browse Catalog *list* shows. Do not add a per-product live Salesforce check before rendering the list.

**Rationale**: `056-catalog-source-algolia` already established that the catalog list is intentionally Algolia-sourced, with Salesforce consulted only at add-time for qty/MOQ/price (FR-005, unchanged). Re-verifying every visible product against Salesforce on every list load would reintroduce the exact bulk-Salesforce-call cost that `056` removed, and duplicates the per-product Salesforce lookup that already happens when a product is actually added. Bounded staleness is an accepted tradeoff of index-based search everywhere else in the app (Products page has the same property).

**Alternatives considered**:
- *Live per-product verification on every catalog load* — rejected: reintroduces bulk Salesforce calls this feature line specifically moved away from; no evidence the org reporting this bug is experiencing a staleness problem (their problem is wrong-index, not stale-index).

**Note**: This item was mid-clarification (Question 1 of the `/speckit-clarify` session) when `/speckit-plan` was invoked. The above is the previously-stated recommended default, not a confirmed user answer — flagging here so it's visible before `/speckit-tasks`/implementation. If the user's actual intent differs, `research.md` and `FR-003`/Edge Cases in `spec.md` should be revisited.

## R4: What should the "empty or clearly-messaged state" (FR-002, FR-007) say/do?

**Decision**: Reuse the existing `TableEmptyState` component (already imported in `ConfigureOrderClientPage.tsx:8`) for both the "index couldn't be resolved" and "index resolved but has zero records" cases, with distinct copy:
- Index unresolved: a message indicating the catalog isn't configured for this organization (actionable: contact support/admin), rather than a generic "no results."
- Index resolved but empty (zero synced records): a message indicating no products have been synced yet, distinct from "no search results for your query."

**Rationale**: `TableEmptyState` is already the app's established empty-state primitive (used elsewhere in this same file for the Lines table), so no new UI component is needed — keeping scope minimal per Constitution Principle V. Distinguishing the two messages (unresolved vs. empty-but-valid) gives users/support actionable signal instead of a single ambiguous "no products" message, addressing the Edge Cases question in the spec without over-engineering a full diagnostics UI.

**Alternatives considered**:
- *Single generic empty message for both cases* — rejected: conflates "misconfiguration" with "nothing synced yet," which are different support paths.

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| Root cause of wrong products shown | Silent fallback to `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` (`wovn_products_local`) when org index can't be resolved |
| Pagination/search mechanism | `react-instantsearch` `useInfiniteHits`, matching `app/products/ProductClientPage.tsx` |
| Staleness tolerance | Trust synced index snapshot; no live per-product SF re-verification at render time (recommended default — confirm with user) |
| Empty/error state content | Reuse `TableEmptyState`, distinct copy for "unresolved index" vs. "zero synced records" |
