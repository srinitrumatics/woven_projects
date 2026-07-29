# Contract: `page.tsx` → `ConfigureOrderClientPage` index name prop

This is the internal server-component-to-client-component contract this feature must preserve/fix. There is no external HTTP API surface for this feature (no new route under `app/api/`).

## Producer: `app/configure/page.tsx`

```ts
const orgConfig = await getOrgConfig().catch(() => null);
const indexName = orgConfig?.algoliaIndexName || ""; // no env-var fallback (FR-002)
return <ConfigureOrderClientPage indexName={indexName} />;
```

**Contract**:
- `indexName` is the organization's real Algolia index name, resolved solely from `organizations.algoliaIndexName` via `getOrgConfig()`.
- `indexName` MUST be `""` (empty string) — never `process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME` or any other non-org-specific value — whenever `getOrgConfig()` throws or `algoliaIndexName` is null/undefined/empty.

## Consumer: `app/configure/ConfigureOrderClientPage.tsx`

**Contract**:
- Receives `indexName: string` as today.
- If `indexName === ""`: MUST render the `unresolved` empty state (data-model.md) and MUST NOT issue any Algolia search call.
- If `indexName !== ""`: MUST use it as the `react-instantsearch` `InstantSearch` `indexName` prop (or equivalent `useMemo(() => searchClient.initIndex(indexName), [indexName])` reference used by the underlying hooks), replacing the current raw `index.search('', { hitsPerPage: 1000 })` one-shot call.
- MUST expose search (existing `searchQ`/`catQ` behavior) and incremental loading (`useInfiniteHits().showMore()`) so any real catalog product is reachable regardless of total catalog size (FR-006).
- Zero-hit results (index resolved, query succeeded, no records) MUST render the `empty` state (data-model.md), distinct from the `unresolved` state.

## Unchanged surfaces (explicitly out of contract for this feature)

- Add-to-order actions ("+" click, drag-and-drop) — same handlers, same resulting line shape (FR-004).
- Per-product Salesforce lookup for qty/MOQ/price at add-time (`unwrapProductDetails` and the effect that calls it) — unchanged (FR-005).
- `localStorage` draft persistence (`gth-configured-draft`) — unchanged.
