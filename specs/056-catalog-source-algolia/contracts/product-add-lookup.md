# Contract: Add-Time Product Lookup (Salesforce)

**Direction**: Client (`ConfigureOrderClientPage.tsx`) → existing Next.js API route → Salesforce. No new route or service function — this documents usage of what already exists.

**Endpoint**: `GET /api/salesforce/product-details?accountId={SF_ACCOUNT_ID}&contactId={SF_CONTACT_ID}&productId={id}&tabName=product`

(`app/api/salesforce/product-details/route.ts` → `lib/product-salesforce-service.ts#getProductDetailsFromSalesforce`, both unchanged.)

## When it's called

Triggered by either add path on the Configure Order page:

- `addCat(id)` — user clicks the "+" control on a Browse Catalog row.
- Drag-and-drop drop handler (`execDrop`, catalog-item source) — user drags a catalog row onto the Lines table.

Both paths currently call `catalog.find(x => x.id === id)` synchronously and then `quickAddProduct(p)`. Under this feature, both paths instead:

1. Look up `id` in the (now Algolia-sourced) `catalog` state only to confirm the item exists in the browse list (for UI purposes — e.g. which row was dragged).
2. Call this endpoint with that `id` as `productId`.
3. On success, build the Order Line from the endpoint's response (not from the Algolia record) and call `quickAddProduct`/the existing line-insert logic.
4. On failure/empty response, show a toast error (`useToast().error`) and do not create a line.

## Request

```
GET /api/salesforce/product-details
  ?accountId=<SF_ACCOUNT_ID>
  &contactId=<SF_CONTACT_ID>
  &productId=<catalog item's id>
  &tabName=product
```

All four params are required by the existing route (`accountId`/`contactId`/`productId` return `400` if missing — unchanged behavior).

## Response (existing shape, passthrough from Salesforce)

```json
{
  "data": [
    {
      "Id": "01t...",
      "Name": "...",
      "MOQ__c": 25,
      "Available_To_Sell__c": 100,
      "List_Price__c": 12.5,
      "...": "..."
    }
  ]
}
```

(Exact envelope matches whatever `getProductDetailsFromSalesforce` already returns — this feature does not change the service or route; it only adds a new caller.)

## Fields consumed for the new Order Line

| Order Line field | Source field in response |
|---|---|
| `moq` (via `resolveMoq`) | `MOQ__c` (fallback `moq`, then `1`, unchanged fallback rule from spec 053) |
| `sell` | `List_Price__c` / `Unit_Price__c` / `listPrice` / `unitPrice` |
| `avail`-derived display, if used on the line | `Available_To_Sell__c` / `availableQty` |
| `qty` initial value | Existing default (e.g. `moq`), same as today — this endpoint supplies the MOQ that default is based on |

## Error handling

| Condition | Client behavior |
|---|---|
| `400`/`500` response, or `{ error: ... }` body | Toast error via existing `useToast().error`; no line created (FR-007). |
| Empty/no matching product in response (deleted/deactivated) | Same as above — treated as "cannot be resolved." |
| Request pending | The row/drag target shows a brief loading state; add controls for that specific product are disabled until it resolves, so double-adds during the lookup are not possible. |
