# Data Model: Configure Order Catalog Sourced from Algolia

No database schema changes. This feature only changes where two existing, in-memory client-side entities are populated from. Field names below reflect what `app/configure/page.tsx` already expects internally (per spec Key Entities); the Algolia record's raw attribute names are whatever the existing sync pipeline (specs 051/052) indexes today and are mapped to these at read-time, the same way the current Salesforce response is mapped today (`app/configure/page.tsx` lines 70-81).

## Catalog Search Record (Algolia-sourced)

Used only to render and search the Browse Catalog panel and the quick-add dropdown. Never used to populate an order line's qty/MOQ directly.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Salesforce product ID (`objectID` in the Algolia record) — the join key used for the add-time Salesforce lookup (Decision 3). |
| `sku` | string | Displayed in the catalog list and used in quick-add text matching. |
| `name` | string | Product display name; primary search field. |
| `desc` | string | Optional short description. |
| `mfr` | string | Manufacturer name — drives the existing `fMfr` filter dropdown. |
| `family` | string | Product family — drives the existing `fFamily` filter dropdown. |
| `groupingLabel` | string (optional) | Preserved for parity with today's mapping; not required for search. |
| `sell` | number | Display-only list price shown in the catalog row — **not** used as the order line's price of record. |
| `avail` | number | Display-only availability indicator shown in the catalog row. |

Explicitly **excluded** from this entity: `moq`. The search index is not treated as authoritative for MOQ (FR-008); no MOQ field is read from the Algolia record.

## Order Line (unchanged shape, changed provenance)

Same shape already used by the Lines table (`lines` state, `makeLine`, `bumpQty`, etc.) — this feature does not add or remove fields, only changes where `qty`/`moq`-relevant values are sourced from at the moment a line is created.

| Field | Type | Notes |
|---|---|---|
| `id` | number | Client-generated sequence ID (`nextId`), unchanged. |
| `productId` | string | The Catalog Search Record's `id`, used to key the add-time Salesforce lookup and later MOQ-step calculations. |
| `qty` | number | Populated from the Salesforce per-product lookup response at add-time (Decision 3), not from the Algolia record. |
| `moq` resolution | — | `resolveMoq()` continues to operate on the Salesforce-sourced value attached to/looked-up-for the line's product, unchanged from spec 053. |
| *(all other existing fields: `sku`, `name`, `sell`, `grp*`, `dirty`, `sel`, etc.)* | — | Unchanged; still populated at add-time, but the underlying product fields feeding them now come from the per-product Salesforce lookup rather than the removed bulk fetch. |

## Product (Salesforce) — add-time lookup response

The response shape already returned by `getProductDetailsFromSalesforce` / `GET /api/salesforce/product-details` (existing, unchanged endpoint). Relevant fields consumed by this feature:

| Field | Notes |
|---|---|
| `MOQ__c` / `moq` | Authoritative MOQ for the line, feeds `resolveMoq()`. |
| `Available_To_Sell__c` / `availableQty` | Authoritative availability. |
| `List_Price__c` / `Unit_Price__c` / `listPrice`/`unitPrice` | Authoritative price for the line — supersedes the catalog record's display-only `sell`. |

If the lookup returns no matching product (deleted/deactivated/not found), no Order Line is created (FR-007) and an error is surfaced via the existing `useToast` error path.

## Relationships

```
Catalog Search Record (Algolia) --id (product id)--> Product (Salesforce) --populates--> Order Line
        │                                                                                    ▲
        └─ used only for browse/search rendering ──────────────────────────────────────────┘
                                                        (add action triggers the Salesforce lookup,
                                                         never the reverse)
```

## Validation rules (from spec Functional Requirements)

- FR-007: An add action (either "+" or drag-and-drop) MUST resolve the per-product Salesforce lookup successfully before an Order Line is created; a failed/empty lookup MUST NOT create a line.
- FR-008: `qty`/`moq`/price fields on an Order Line MUST always originate from the Salesforce lookup response, never from the Catalog Search Record.
