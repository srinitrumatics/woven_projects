# Research: Browser Memory Usage Report for Product Loading

## Decision 1: How to measure "browser memory usage" without instrumenting the app

- **Decision**: Use `puppeteer-core`'s `page.metrics()` (backed by Chrome DevTools Protocol's `Performance.getMetrics`) to read `JSHeapUsedSize` at each checkpoint, driving the already-running app in headless Chrome. No code in the app is touched.
- **Rationale**: The spec (FR-005/FR-006) requires this to be observation-only with zero app changes. `performance.memory` (the in-page JS API) would require injecting a script or opening DevTools manually; `page.metrics()` reads the same underlying Chrome counters from *outside* the page, via the browser automation layer already used and documented for this repo (`puppeteer-core` + system `google-chrome`, cookie-injected session — the exact toolchain proven out in feature `053-configure-qty-moq-control`'s verification pass). No new dependency is added to the shipped app; `puppeteer-core` is installed to a scratch directory only, for the duration of this investigation.
- **Alternatives considered**:
  - Chrome DevTools' Memory panel (manual heap snapshot) — accurate, but entirely manual/undocumented-in-code, harder to repeat identically for both pages and all three checkpoints, and not scriptable for the "keep loading until ~1,000/~2,000" step.
  - `performance.memory` via `page.evaluate()` — functionally similar to `page.metrics()` (both surface JS heap size), but `page.metrics()` is the more standard puppeteer-native call and avoids relying on a non-standard, Chrome-only in-page API that Chrome could deprecate; either would work, `page.metrics()` was chosen for consistency with existing project tooling patterns.
  - Node process memory (`process.memoryUsage()`) — wrong target entirely; that measures the Node/Puppeteer *driver* process, not the Chrome tab rendering the page.

## Decision 2: How to reach ~1,000 and ~2,000 loaded products on the Products Catalog page

- **Decision**: Repeatedly trigger the existing `IntersectionObserver`-driven `showMore()` call (`app/products/ProductClientPage.tsx`) by scrolling the sentinel element into view in a loop, waiting for each Algolia page (`hitsPerPage=9`) to resolve, until the on-page hit count crosses each checkpoint.
- **Rationale**: This exercises the page exactly as a real user's continued scrolling would — no shortcut or simulated data path is needed, since the page already paginates via Algolia. Reaching ~1,000 hits means roughly 112 "show more" triggers (1000/9 ≈ 111.1); ~2,000 means roughly 223. Both are mechanical to script by scrolling-and-waiting in a loop.
- **Alternatives considered**: Directly calling `showMore()` in-page via `page.evaluate()` (bypassing the scroll/IntersectionObserver mechanism). Rejected because it wouldn't reflect what a real user's browser actually experiences (no scroll-triggered rendering), which matters for a memory investigation whose point is to describe real usage.

## Decision 3: How to reach ~1,000 and ~2,000 loaded products on the Order Details "Add Products" tab

- **Decision**: Because this tab fetches the organization's *entire* catalog in a single request (`app/orders/[id]/page.tsx` line ~588, via `/api/salesforce/orders?action=products`) rather than progressively, there is no in-page "checkpoint" to trigger mid-load — the tab is either not opened (baseline) or opened and fully loaded (one post-load measurement). To still produce comparable ~1,000 and ~2,000 data points, the measurement script intercepts and truncates the network response to exactly 1,000 and 2,000 product records (matching the same request-interception technique already proven out in `053-configure-qty-moq-control`'s verification session) for two separate opens of the tab, in addition to one open against the account's real (untruncated) catalog for a real-world reference point.
- **Rationale**: The spec's Edge Cases explicitly anticipate this — "a page that loads all products at once may only yield a single post-load measurement" — and its Assumptions explicitly permit "a controlled test setup that simulates a larger catalog" as long as the document states which was used. Truncating the response in the measurement script (never in application code) keeps this fully observation-only while still producing genuinely comparable ~1,000/~2,000 checkpoints across both pages.
- **Alternatives considered**: Only measuring against whatever the real test account's catalog size happens to be (no interception). Rejected as insufficient — the real test account catalog observed in prior sessions (8,000 products) doesn't naturally offer a clean ~1,000 or ~2,000 checkpoint, and this tab's all-at-once fetch means the real catalog size is the *only* number reachable without interception, which wouldn't satisfy FR-002's requirement for measurements at both checkpoints.

## Decision 4: Baseline definition

- **Decision**: For each page, "baseline" is measured immediately after the page (or tab) has finished its initial render but before any additional products beyond its first automatic load are shown — i.e., after the first Algolia page (9 hits) for the Catalog page, and before opening the "Add Products" tab at all for the Order Details page (since opening it *is* the all-at-once load).
- **Rationale**: A true "zero products, nothing rendered yet" state isn't meaningfully reachable on the Catalog page (Algolia's `Configure hitsPerPage={9}` loads immediately on mount), so the closest honest baseline is "page just opened, first page of results shown." For the Add Products tab, since opening it triggers the full fetch, the only pre-load baseline is simply before that tab is selected.
- **Alternatives considered**: Treating "baseline" as a blank/unloaded DOM state for both pages. Rejected as not representative of any real, observable moment for the Catalog page given its load-on-mount behavior; the spec's Edge Cases already anticipate exactly this kind of per-page difference being called out rather than forced into an artificial uniform definition.

## Open questions

None — the spec (`spec.md`) resolved all ambiguity via documented Assumptions during `/speckit-specify`; no `[NEEDS CLARIFICATION]` markers remain.
