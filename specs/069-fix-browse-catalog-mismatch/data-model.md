# Phase 1 Data Model: Fix Browse Catalog Showing Non-Salesforce Products

No new persisted entities, tables, or migrations are introduced by this feature. The entities below already exist; this document records the fields/invariants this feature depends on and clarifies where each one is enforced.

## Organization (existing — `db/schema.ts: organizations`)

Relevant fields only:

| Field | Type | Role in this feature |
|---|---|---|
| `siteUrl` | string | Looked up via `ilike` against the request host in `getOrgConfig()` to identify the organization |
| `algoliaIndexName` | string \| null | The **only** valid source for the Browse Catalog index name (FR-001). When null/missing, per FR-002 the panel MUST NOT fall back to a shared/default index. |

**Invariant enforced by this feature**: if `algoliaIndexName` is null/missing OR `getOrgConfig()` fails to resolve an organization at all, the resolved index name passed to the client component MUST be a sentinel that the client recognizes as "no valid index" (e.g., empty string), never `process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME`.

## Catalog Product Record (existing — Algolia index record, not a DB table)

Fields already read by `ConfigureOrderClientPage.tsx` (`objectID`, `sku`/`productcode`/`name`, `name`, `description`, `manufacturer`, `brand`/`brandName`, `family`/`category`, `groupingLabel`, `price`, `available_quantity`/`gtherp__available_quantity__c`/`stock_quantity`) are unchanged by this feature. No new fields are required.

**Invariant** (FR-003): every record returned by a search against the resolved organization index is, by construction of the existing sync worker, a record for a product in that organization's Salesforce catalog. This feature does not add new validation of that invariant — it only ensures the *correct* index is queried and that the full result set (not a 1000-record ceiling) is reachable via search/scroll (FR-006).

## Order Line (existing — client-side draft state, `localStorage` — unchanged)

No changes. Qty/MOQ/price continue to be populated from Salesforce at add-time (FR-005), independent of how the catalog list itself was loaded.

## State: Browse Catalog panel load state

New (client-side only, not persisted) states the panel must represent, per FR-002/FR-007 and Research R4:

| State | Trigger | Display |
|---|---|---|
| `loading` | Initial mount, index resolved, query in flight | Existing loading treatment (no change required) |
| `unresolved` | Index name passed from server is empty/sentinel (org lookup failed or `algoliaIndexName` unset) | `TableEmptyState` — "catalog not configured" copy (Research R4) |
| `empty` | Index resolved, query succeeds, zero total hits | `TableEmptyState` — "no products synced yet" copy (Research R4) |
| `results` | Index resolved, one or more hits | Existing catalog list rendering, now via `useInfiniteHits` |
