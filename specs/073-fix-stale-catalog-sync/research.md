# Phase 0 Research: Consistent Product Catalog Freshness Across Configure & Order Views

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature reuses existing dependencies, patterns, and infrastructure end-to-end. The research below documents the investigation that grounds the plan's decisions (why the three views currently diverge, and why the chosen fix is a trigger/error-handling change rather than a new fetching layer).

## Decision 1: Why Products stays fresh while Configure/Order Catalog go stale

**Decision**: Treat "why Products works" as the target behavior to match, not something to change.

**Rationale**: `app/products/ProductClientPage.tsx` uses `react-instantsearch`'s `InstantSearch` / `useInfiniteHits` against a module-level Algolia `searchClient`. Every keystroke, filter change, or `showMore()` call issues a brand-new query with a new cache key, so it always reflects the latest index state — not because of any special cache-busting, but because it never stops querying. There is no explicit revalidation mechanism to port over; the "freshness" is a side effect of continuous interaction-driven querying.

**Alternatives considered**:
- Migrate Quick Add and Order Product Catalog onto full `react-instantsearch` (like the Browse Catalog panel already is). Rejected as out of scope/too invasive: Quick Add and the order catalog have bespoke UX (draft persistence, selection state, brand-fallback enrichment, MOQ-aware quantity controls, admin-key `browseObjects()` for >1000 records) that would need to be rebuilt around InstantSearch's data model. The spec only requires *freshness parity*, not implementation parity.

## Decision 2: Refetch trigger for Configure's Quick Add

**Decision**: Re-run the existing `index.search('', { hitsPerPage: 1000 })` call (`ConfigureOrderClientPage.tsx:99-147`) whenever the Quick Add input transitions from closed to open (`quickAddOpen: false -> true`), in addition to the existing fetch-on-mount.

**Rationale**: `quickAddOpen` already exists as UI state (`ConfigureOrderClientPage.tsx:68`), toggled true on input click/focus/typing (`:663`) and false on selection or outside-click (`:258`, `:586`). This is a natural, already-present "the user is (re)engaging with Quick Add" signal — exactly the "opened or (re)activated" trigger FR-001 calls for, with no new state needed.

**Alternatives considered**:
- Poll on an interval while the panel is open. Rejected — spec Assumptions explicitly rule out continuous background polling as a requirement; it also risks refetching the full 1000-row catalog repeatedly while a user is mid-search for no benefit.
- Refetch on every keystroke in Quick Add. Rejected — Quick Add filters an already-fetched in-memory `catalog` array client-side; re-fetching per keystroke would change its performance characteristics and duplicate what the open-transition trigger already covers.

## Decision 3: Refetch trigger for the order Product Catalog tab

**Decision**: Re-run the existing `loadProducts()` fetch (`OrderClientPage.tsx:595-659`, hitting `/api/algolia/browse`) whenever `viewMode` transitions to `"catalog"` (`OrderClientPage.tsx:179`, tab button at `:1766`), in addition to the existing fetch-on-mount.

**Rationale**: `viewMode` is the existing tab-switch state; transitioning into `"catalog"` is precisely "the user opened the Product Catalog view" from User Story 2. `/api/algolia/browse` (`app/api/algolia/browse/route.ts`) already resolves `indexName` fresh per request via `getOrgConfig()` and is not cached — the endpoint itself is not the staleness source, only the client's failure to re-invoke it.

**Alternatives considered**:
- Re-fetch on every order-page mount only (current behavior). Rejected — this is the bug; a user can leave the order page open, a sync completes, and switching to the Catalog tab still shows the original snapshot with no way to see the update short of a full reload.
- Re-fetch on an interval regardless of tab. Rejected for the same reason as Decision 2 — no polling requirement, and it would fetch data for a tab the user isn't looking at.

## Decision 4: Failure handling (FR-005)

**Decision**: On a refetch failure, keep the last successfully loaded `catalog` / `catalogProducts` state as-is and surface a toast error via the already-imported `useToast` hook in both files, instead of the current behavior of resetting to `[]`.

**Rationale**: Both files already import and use `useToast` (`ConfigureOrderClientPage.tsx` imports it for other flows; `OrderClientPage.tsx:151` destructures `success`/`error: toastError`/etc.). Reusing this existing mechanism needs no new dependency. Today, both fetch functions' `catch` blocks call `setCatalog([])` / effectively drop data on error — that must change to a no-op on the state (leave prior array untouched) plus a `toastError(...)` call.

**Alternatives considered**:
- Add a dedicated inline error banner component. Rejected — `useToast` is already the app's established pattern for this kind of transient failure notification; introducing a new UI element would violate Constitution Principle V (Simplicity/YAGNI).

## Decision 5: Manual refresh control (FR-004)

**Decision**: Add a small icon-button "refresh" affordance next to Quick Add's search input and next to the Product Catalog tab's toolbar, both calling the same existing fetch function used by the open/tab-activate triggers.

**Rationale**: Covers the edge case where a user leaves Quick Add or the Catalog tab open/active for an extended period without a natural close/reopen or tab-switch cycle to trigger Decision 2/3's automatic refetch. No new fetching logic — it's the same function, just also wired to a click handler.

**Alternatives considered**:
- Rely solely on the open/tab-activate triggers and skip a manual control. Rejected — FR-004 explicitly requires a manual refresh path, and it's cheap to add given the fetch functions already exist and are reusable.
