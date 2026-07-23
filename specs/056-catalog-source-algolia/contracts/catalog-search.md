# Contract: Browse Catalog / Quick-Add Search (Algolia)

**Direction**: Client (`ConfigureOrderClientPage.tsx`) → Algolia search index directly. No new Next.js API route.

**Existing precedent**: `app/products/ProductClientPage.tsx` (`algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_KEY)`, `index.search(query, opts)`).

## Index resolution (server → client prop)

`app/configure/page.tsx` (server component):

```
indexName = orgConfig?.algoliaIndexName
  || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME
  || "wovn_products_local"
```

Passed as a prop to `ConfigureOrderClientPage`, identical to how `app/products/page.tsx` passes `indexName` to `ProductClientPage`.

## Query call

One-shot, on mount only — mirrors exactly when the bulk Salesforce fetch used to run today (the `useEffect` keyed on `SF_ACCOUNT_ID`/`SF_CONTACT_ID`):

```
const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);
const index = client.initIndex(indexName);
const { hits } = await index.search('', { hitsPerPage: 1000 });
```

- Called once when the component mounts (or `indexName` changes), not per keystroke.
- `catQ` (Browse Catalog panel search box), `quickAddQ` (quick-add dropdown), and `fMfr`/`fFamily` filters all continue to be applied exactly as today: `useMemo`-derived client-side `.filter()` calls over the single in-memory `catalog` array this query populates. No behavior changes to `filteredCatalog`, `quickAddResults`, `mfrs`, or `fams`.
- `hitsPerPage: 1000` matches Algolia's per-request maximum and preserves parity with today's "load everything once" bulk-fetch pattern; catalogs approaching or exceeding this size are an existing, separately-tracked scale concern (specs 054/055), not something this feature changes.

## Response mapping

Each Algolia hit is mapped into the Catalog Search Record shape (see `data-model.md`):

| Catalog Search Record field | Algolia hit field (typical) |
|---|---|
| `id` | `objectID` |
| `sku` | `sku` |
| `name` | `name` |
| `desc` | `description` |
| `mfr` | `manufacturer` / `brand` |
| `family` | `productFamily` / `family` |
| `sell` | `price` |
| `avail` | `stock_quantity` / `product_availability` |

Exact attribute names are whatever the existing sync worker (`workers/algolia-sync-worker.js`, specs 051/052) already indexes — this contract does not require adding or renaming any indexed attribute.

## Error / empty states

- Search error (network/Algolia outage): Browse Catalog panel shows its existing empty-state messaging; does not throw an unhandled error.
- No results for a query: existing "no matches" rendering path (already present for the empty `filteredCatalog` case) is reused unchanged.
