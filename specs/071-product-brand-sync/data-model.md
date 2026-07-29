# Phase 1 Data Model: Product Brand Name Sync from Salesforce

No new tables or columns are introduced. This documents the existing entities this feature
reads and writes, and the three-state model that resolves FR-004.

## Entity: Product (`"<org-schema>".product2`, existing)

Per-organization Postgres mirror of Salesforce `Product2`, keyed by `sfid`. Only the field
relevant to this feature is detailed; all other columns are out of scope and unchanged.

| Field                     | Type            | Notes                                                                 |
|----------------------------|-----------------|------------------------------------------------------------------------|
| `sfid`                     | string (PK)     | Salesforce `Product2.Id`. Existing.                                    |
| `gtherp__brand_name__c`    | string, nullable| The synced brand display name. See state model below.                 |

This column is managed via raw SQL in `lib/product-load-service.ts` and
`lib/product-sync-service.ts` (added defensively with `ALTER TABLE ... ADD COLUMN IF NOT
EXISTS`); it is intentionally not part of the typed Drizzle schema in
`db/salesforce-schema.ts`, consistent with how the rest of `product2`'s Salesforce
custom-field columns are already handled.

### Brand state model (resolves FR-004)

A product's brand exists in exactly one of three states, derived from two facts: whether a
`product2` row exists for its `sfid`, and if so, whether `gtherp__brand_name__c` is `NULL`.

| State               | `product2` row exists? | `gtherp__brand_name__c` | Meaning                                                        | UI treatment                          |
|---------------------|:-----------------------:|:------------------------:|------------------------------------------------------------------|----------------------------------------|
| Not yet synced      | No                       | n/a                       | Product has never been loaded (e.g. only present in Algolia).    | Retry on next Load/single-product sync.|
| Synced, no brand    | Yes                      | `NULL`                    | Salesforce record checked; no brand lookup assigned.              | Show explicit "no brand" indicator; do not re-request. |
| Synced, has brand   | Yes                      | non-null string           | Salesforce record checked; brand name resolved.                   | Display the brand name.                |

**Validation rule**: Both sync paths (`lib/product-load-service.ts`,
`lib/product-sync-service.ts`) MUST write `NULL`, never `''`, when a product has no brand
assigned (Decision 2 in `research.md`). This is the only behavior change to existing write
paths.

## Conceptual entity: Brand (Salesforce-only, not persisted separately)

Brand is a Salesforce lookup from `Product2` (`gtherp__Brand_Name__c`) to a separate brand
record, whose `Name` field is the only attribute this feature needs. The app never stores a
standalone `Brand` table — the resolved name is denormalized directly onto the `Product`
row above, matching how `manufacturer_name__c` (a parallel lookup) is already handled.

## Relationships

- `Product 1 -- 0..1 Brand` (via the resolved `gtherp__brand_name__c` string; no foreign key,
  since Brand is not a local entity).
