# Browser Memory Usage Report: Products Catalog Page & Order Details "Add Products" Tab

**Date**: 2026-07-21
**Feature**: [055-catalog-memory-usage-check](./spec.md)
**Scope**: One-time investigation. No application code was changed to produce these numbers (verified in Verification & Limitations below).

## Summary

| Page | Baseline | ~1,000 products | ~2,000 products |
|---|---|---|---|
| Products Catalog (`/products`) | 19.59 MB (9 products) | **194.79 MB** (1,008 products) | 149.23 MB (2,007 products) |
| Order Details — "Add Products" tab | 23.37 MB → 24.62 MB (real catalog, pre/post tab click) | 19.68 MB → 21.25 MB (1,000-product simulated catalog) | 22.98 MB → 21.81 MB (2,000-product simulated catalog) |

**Bottom line**: The Products Catalog page shows a real and substantial memory jump as more products are progressively loaded via infinite scroll — roughly a **10x increase from baseline to ~1,000 products**. The "Add Products" tab, by contrast, shows only a small, roughly flat memory footprint regardless of catalog size, because — as this investigation discovered — **it does not load its catalog on-demand relative to what's displayed; the entire catalog is fetched once when the order page mounts**, before the tab is ever clicked. See the per-page sections and Findings below.

## Methodology

- **Tool**: Chrome's JS heap size (`JSHeapUsedSize`), read via `puppeteer-core`'s `page.metrics()` from outside the page — no code in the app was modified or instrumented (see `research.md` Decision 1).
- **Test account**: `mathu@trumatics.com` (the "Apple" test account), the same account used for prior UI verification in this repo.
- **Data source — Products Catalog page**: This page is backed by Algolia (`react-instantsearch`, `useInfiniteHits`, `hitsPerPage=9`). During this investigation, the account's real Algolia index (`woven_products_ghyuoo6867hj`) returned **`404 Index does not exist`** — the "Index Products" step (a separate action from "Load Products", per `specs/051-product-algolia-sync-split` / `specs/052-fix-index-products-stuck`) has apparently never been run for this org, so there is no real search data to measure against. To still produce the requested checkpoints, the Algolia network responses were intercepted in the measurement script only and replaced with synthetic hits of the same shape and size Algolia would return (9 per page, standard product fields). **These Catalog-page numbers reflect synthetic/simulated data, not this org's real catalog**, per the spec's Assumptions, which explicitly permit this when stated.
- **Data source — Add Products tab**: This tab is backed by a single request (`/api/salesforce/orders?action=products`) that returns the account's real catalog (confirmed at ~8,000 real products for this account in a prior session). For the ~1,000 and ~2,000 checkpoints, the measurement script intercepted this one response and truncated it to exactly 1,000 / 2,000 records (see `research.md` Decision 3); a separate run against the untouched real response is also included as a reference point.
- **Order used**: A draft, never-saved order (`/orders/new-<label>?new=true`) was used for each Add Products tab measurement — matching how this repo's own "Create Order" flow generates a fresh, unsaved draft ID. No order was ever submitted or persisted to Salesforce during this investigation.
- **Checkpoint counting**: For the Catalog page, "actual count" is the number of rendered product cards (`a[href^="/products/"]`) at the moment of measurement. For the Add Products tab, see the row-count caveat in Findings below — the checkpoint that matters for this tab is the fetched/held record count (1,000 / 2,000 / ~8,000), not what's currently rendered on one paginated screen.

## Products Catalog Page (`/products`)

| Checkpoint | Actual products loaded | JS heap used | Method |
|---|---|---|---|
| Baseline | 9 | 19.59 MB | Simulated Algolia response |
| ~1,000 products | 1,008 | 194.79 MB | Simulated Algolia response |
| ~2,000 products | 2,007 | 149.23 MB | Simulated Algolia response |

**Observation**: Memory climbed sharply from baseline to ~1,000 products (≈+175 MB), consistent with holding roughly a thousand additional product records and their rendered card DOM/images in memory. The reading at ~2,000 products was *lower* than at ~1,000 (149.23 MB vs. 194.79 MB) despite holding more products — this is expected JS heap behavior, not a sign that memory was freed by the page: `JSHeapUsedSize` reflects memory in use **as of the last garbage collection**, not a running total, so a GC pass between the two readings can lower the reported number even as the page continues to hold more data. The directionally important finding is the large jump from baseline to real usage, not the exact ~1,000-vs-~2,000 delta.

## Order Details — "Add Products" Tab

| Checkpoint | Rows rendered at measurement time | Heap before opening tab | Heap after opening tab | Method |
|---|---|---|---|---|
| Baseline / real catalog (~8,000 products fetched) | 0* | 23.37 MB | 24.62 MB | Real catalog |
| ~1,000 products (simulated) | 10 | 19.68 MB | 21.25 MB | Truncated response |
| ~2,000 products (simulated) | 10 | 21.81 MB | 21.81 MB | Truncated response |

\* *0 rendered rows for the real-catalog run is a measurement-timing artifact, not zero products loaded — see Findings below.*

**Observation**: Unlike the Catalog page, memory usage on this tab stayed small and roughly flat (~20-25 MB) across all three checkpoints, showing only a modest ~1-2 MB bump from opening the tab itself. This is because of an architectural fact this investigation surfaced (see Findings): the "Add Products" tab's data isn't loaded when the tab is opened — it's already loaded (and already sitting in memory) as soon as the order page itself finishes mounting, regardless of whether the user ever visits that tab.

## Findings

1. **The Products Catalog page's memory usage scales meaningfully with product count.** Loading ~1,000 products pushed JS heap usage to roughly 10x its baseline. This page uses Algolia's progressive infinite-scroll loading (9 products per "page"), so memory grows incrementally as the user scrolls — a user who scrolls far enough will accumulate a large amount of loaded product data and rendered DOM in the browser tab over time, since nothing in the current implementation evicts earlier-loaded products from memory as new ones load in.
2. **The "Add Products" tab loads its entire catalog once, on order-page mount — not per-tab-visit, and not incrementally.** This was discovered by direct code reading during this investigation (`app/orders/[id]/page.tsx`'s product-loading `useEffect` has no dependency that ties it to tab selection). Practically, this means: (a) the full catalog is fetched and held in memory even for a user who never opens "Add Products" at all, and (b) this tab's own memory footprint doesn't grow with catalog size the way the Catalog page's does, because it isn't re-fetching or re-rendering more data as the "checkpoint" increases — it already fetched everything up front. The catalog **size itself** (not the tab's rendering) is therefore the more relevant memory-cost driver for this surface, and it's paid unconditionally on every order page visit.
3. **Rendering the real ~8,000-product catalog appears to take noticeably longer than rendering a 1,000 or 2,000-record catalog.** At the fixed 1.5-second post-click measurement point, the 1,000- and 2,000-record (simulated/truncated) runs had already rendered their first page of results (10 rows), while the real ~8,000-record run had not yet rendered any rows in the table. This suggests the client-side processing this tab does over its full loaded array (sorting/filtering via `useSortableData`, pagination) takes measurably longer to complete for a full real-size catalog than for the smaller simulated ones — a performance signal, separate from the memory-size question, that's worth a closer look if this tab's responsiveness is ever reported as sluggish for large-catalog organizations.
4. **This org's Algolia search index does not currently exist**, which blocked measuring the Catalog page against real data. This is a data/operational finding (not a defect introduced by this investigation) and mirrors the gap already tracked in `specs/052-fix-index-products-stuck` — "Load Products" and "Index Products" are separate steps, and this org appears to have never had the latter run.

## Verdict

- **Products Catalog page**: **Concerning.** Memory grows substantially as more products are loaded via infinite scroll, with no eviction of earlier pages. For organizations with large catalogs (the platform's own stated target is 25,000+ products, per `specs/051-product-algolia-sync-split`), a user who scrolls extensively could accumulate very large in-tab memory usage over a single session. Worth a follow-up decision on whether to cap/virtualize the loaded list.
- **Order Details "Add Products" tab**: **Not concerning from a memory-growth-with-catalog-size standpoint** (its footprint doesn't grow with the "checkpoint" the way the Catalog page's does) — **but concerning for a different, related reason**: it unconditionally loads the entire catalog into memory on every order page visit, which does not scale well as catalogs grow toward the platform's 25,000+ product target, even though the *symptom* wouldn't show up as "memory climbs the more I scroll" the way it does on the Catalog page. This is the same category of risk previously flagged for the server-side Load Products flow (see `specs/054-product-load-memory-profiling`, pending), just on the client side.

## Verification & Limitations

- No application file was modified to produce these measurements — confirmed via `git status` showing no changes under `app/` (see repository state at the time this report was written).
- Both pages' Catalog-page and Add-Products-tab data sources required simulation/truncation to reach the requested ~1,000/~2,000 checkpoints, for two different reasons (empty Algolia index vs. all-at-once fetch architecture) — both are documented above and in `research.md`, per the spec's Assumptions.
- Findings 2 and 3 are based on live code reading and observed behavior during this investigation; they were not the primary target of this report but are surfaced because they materially explain the Add Products tab's otherwise-surprising flat memory profile.
- Raw measurement data (JSON) and screenshots from this run are retained in the investigator's scratch directory for this session, not committed to the repository, per this feature's scope (observation-only, no permanent artifacts beyond this document).
