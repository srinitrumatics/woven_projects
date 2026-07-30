# Data Model: Consistent Product Catalog Freshness Across Configure & Order Views

No schema, database, or new persisted-entity changes are introduced by this feature. It changes *when* existing client-side fetches run and *how* their failures are handled — the shapes below already exist in the codebase today and are documented here only to make the affected state explicit for implementation.

## Existing entities (unchanged shape)

### Catalog Entry (Configure / Quick Add)

Source: `ConfigureOrderClientPage.tsx` `catalog` state, populated from `index.search('', { hitsPerPage: 1000 })` hits.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Algolia `objectID` |
| `sku` | `string` | Falls back to `productcode`/`name` |
| `name` | `string` | |
| `desc` | `string` | |
| `mfr` | `string` | Manufacturer |
| `brand` | `string` | Resolved via fallback `/api/products/brands` lookup when missing from the hit |
| `family` | `string` | |
| `groupingLabel` | `string` | |
| `sell` | `number` | Price |
| `avail` | `number` | Available quantity |

No fields are added or removed. This fix changes when `setCatalog(...)` is called (on open-transition and manual refresh, in addition to mount) and what happens to this state on fetch failure (preserved, not cleared).

### Product (Order Detail Product Catalog)

Source: `app/orders/types.ts` `Product` type, populated in `OrderClientPage.tsx` from `/api/algolia/browse`, passed to `ProductCatalog.tsx` as `paginatedCatalogProducts`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `name` | `string` | |
| `description` | `string` | |
| `productFamily` | `string` | |
| `productGrouping` | `string` | |
| `sku` | `string` | |
| `manufacturer` | `string` | |
| `brand` | `string` | |
| `availableQty` | `number` | |
| `moq` | `number` | |
| `listPrice` / `unitPrice` | `number` | |
| `orderQty` / `subtotal` | `number` | Order-local, not from Algolia |

No fields are added or removed. This fix changes when `setCatalogProducts(...)` is called (on `viewMode` transitioning to `"catalog"` and manual refresh, in addition to mount) and what happens to this state on fetch failure (preserved, not cleared).

## New/changed local UI state

| Component | State | Change |
|---|---|---|
| `ConfigureOrderClientPage.tsx` | `quickAddOpen` (existing) | Now also used as an effect dependency/trigger to re-run the catalog fetch on `false -> true` transitions. |
| `ConfigureOrderClientPage.tsx` | *(new)* `catalogRefreshing` or reuse of existing loading pattern | Lightweight in-flight flag for the manual refresh button's disabled/spinner state. |
| `OrderClientPage.tsx` | `viewMode` (existing) | Now also used as an effect dependency/trigger to re-run `loadProducts()` on transitions into `"catalog"`. |
| `OrderClientPage.tsx` | `productsLoading` (existing) | Reused as-is for the manual refresh button's disabled/spinner state — no new flag needed. |

## Relationships

```text
Algolia Index (org-scoped, per getOrgConfig())
        │
        ├── ProductClientPage.tsx        (live query per interaction — reference behavior, unchanged)
        ├── ConfigureOrderClientPage.tsx (Quick Add: fetch on mount + on open-transition + on manual refresh)
        └── OrderClientPage.tsx          (Catalog tab: fetch on mount + on tab-activate + on manual refresh)
                    │
                    └── ProductCatalog.tsx (presentational — renders whatever catalogProducts currently holds)
```
