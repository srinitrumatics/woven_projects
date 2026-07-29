# Contract: `GET /api/products/brands`

Existing endpoint (`app/api/products/brands/route.ts`); this feature changes its response
semantics only, not its URL, method, or query parameters.

## Request

`GET /api/products/brands?ids=<comma-separated sfid list>`

- `ids` (required): comma-separated Salesforce product ids. Chunked by callers into batches
  (existing client behavior in `ConfigureOrderClientPage.tsx` batches at 100 ids/request).

## Response

`200 OK` — JSON object mapping requested id → brand value, with one entry per id that has a
`product2` row (per the state model in `data-model.md`):

```json
{
  "<sfid-with-brand>": "Acme Tools",
  "<sfid-with-no-brand>": ""
}
```

- Key present, non-empty string value → **Synced, has brand**.
- Key present, empty string value → **Synced, no brand** (row exists, column is `NULL`).
  Callers MUST treat this as final and stop requesting that id again.
- Key entirely absent → **Not yet synced** (no `product2` row for that `sfid`). Callers MAY
  retry this id on a later attempt (e.g. after an admin-triggered Load run), but per FR-007
  MUST NOT retry it more than once within the same client session/page lifecycle.

This is a behavior change from the current implementation, which only adds an id to the
response when `row.brand` is truthy (`if (row.sfid && row.brand)`), making "no brand" and
"not found" indistinguishable to callers.

`500` — unchanged: `{}` with a `500` status on any server-side error (Salesforce/org-config
or database failure), same as today.

## Compatibility

No breaking change for existing callers: they already treat a missing key as "no brand
info available" and stop displaying/using it. The only observable difference is that ids
which are "synced, no brand" now appear in the payload with an empty-string value instead of
being omitted — existing callers already fall back to a "no brand" display for missing keys,
so this is additive, not breaking.
