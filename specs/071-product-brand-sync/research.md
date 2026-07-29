# Phase 0 Research: Product Brand Name Sync from Salesforce

All unknowns were resolved by reading the existing sync code paths directly; no
[NEEDS CLARIFICATION] markers remain in the plan's Technical Context.

## Decision 1: Reuse the existing "Load" run as the backfill mechanism

**Decision**: User Story 3 (backfill existing products missing brand data) is satisfied by
re-running the existing full product Load (`lib/product-load-service.ts`, triggered via
`POST /api/admin/organizations/{orgId}/sync/load`), not a new one-off script.

**Rationale**: The Load query already selects `gtherp__Brand_Name__r.Name` from Salesforce
and upserts it into `product2.gtherp__brand_name__c` for every active product (see
`fetchAllProducts`/`toRow`/`buildUpsertQuery` in `lib/product-load-service.ts`). Because it's
a full re-sync keyed on `sfid` with `ON CONFLICT ... DO UPDATE`, simply re-running it for an
org backfills brand name for every previously-synced-without-brand row, with existing run
tracking (`product_sync_runs`), status polling, and a verification script
(`npm run test:product-sync`, `lib/product-sync-test.ts`) already in place.

**Alternatives considered**: A dedicated "backfill brand only" script — rejected as duplicate
logic against an existing, already-tested full-sync path, for no added benefit.

## Decision 2: Standardize "no brand assigned" on `NULL`, not `''`

**Decision**: Both sync paths must write `NULL` (not empty string) to
`product2.gtherp__brand_name__c` when a Salesforce product has no brand assigned.

**Rationale**: The two existing sync paths currently disagree:
- `lib/product-load-service.ts` (`toRow`): `p.gtherp__Brand_Name__r?.Name || ''` → writes `''`.
- `lib/product-sync-service.ts`: `resolveLookupName(...) ?? ... ?? null` → writes `NULL`.

This inconsistency is exactly what makes FR-004 ("distinguish not-yet-synced from
genuinely-no-brand") unreliable today: a row with `''` and a row with `NULL` both mean "no
brand", but `app/api/products/brands/route.ts` only special-cases falsy values generically
(`if (row.sfid && row.brand)`), so callers can't tell "checked, no brand" apart from "id not
found in product2 at all" (never synced). Standardizing on `NULL` for "checked, no brand" and
treating "no `product2` row for this `sfid`" as "not yet synced" gives every consumer a single,
unambiguous three-state signal from data that already exists — no new column required.

**Alternatives considered**: Standardize on `''` instead — rejected; `NULL` is the more
idiomatic "value is absent" representation in Postgres and is already what the real-time
single-product path (`product-sync-service.ts`) uses, so it's the smaller change.

## Decision 3: No schema migration needed

**Decision**: `gtherp__brand_name__c` already exists on `product2` in every org schema
(added defensively via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in
`lib/product-load-service.ts:182`, and already read/written by both sync paths and by
`app/api/products/brands/route.ts`). This feature changes what values are written/read, not
the schema shape. Note the column is managed via raw SQL, not the Drizzle schema
(`db/salesforce-schema.ts` has no `gtherp__brand_name__c` field) — this is consistent with
how the rest of `product2`'s Salesforce-custom-field columns are already handled outside
Drizzle, and this feature does not change that pattern.

## Decision 4: Client-side retry loop is already resolved

**Decision**: No further server-side change is needed to satisfy FR-007 (no unbounded
repeated lookups). The root cause — `BrowseCatalogPanel`'s `fetchMissingBrands` effect in
`app/configure/ConfigureOrderClientPage.tsx` depending on the same `brandsMap` state it
updated, causing an infinite refetch loop for ids the backend could never resolve — was
already fixed earlier by tracking attempted ids in a `ref` instead. `/api/products/brands`
remains a simple stateless per-request lookup; per Decision 2, once it can distinguish
"checked, no brand" from "not found", the client's existing one-attempt-per-id behavior is
sufficient without additional server-side throttling.

## Constitution alignment

Principle I ("PostgreSQL stores only platform-managed data... MUST NOT write business
objects") is already exceptioned for the `product2` mirror table by
`specs/051-product-algolia-sync-split/`, which predates this feature and exists to power
Algolia search/sync. This feature makes no new exception and adds no new PostgreSQL business
storage — it only corrects what is written into a column that mirror table already has.
