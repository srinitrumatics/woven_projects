# Contract: Product Detail Photo Data

## Interface: `Product.images` (client-side)

Defined in `lib/products-service.ts:23`. **No shape change** — already `images: string[]`.

- Consumers: `app/products/[id]/components/ProductGallery.tsx` (`images` prop, unchanged).
- Producer: `mapSalesforceProductToLocal` (`lib/products-service.ts`) — now reads and parses `sfProduct.gtherp__Image_URL__c` via the `parsePhotoUrls()` helper, instead of the previous hardcoded single-placeholder array.

**Contract**:
- MUST always return at least one entry.
- When the product has no confirmed real photo, MUST return `["/assets/product-placeholder.png"]` (existing placeholder path) — never an empty array, never a broken/unresolvable URL.
- When the product has one or more real photos, MUST return them in display order with the primary/first photo at index 0.

## Interface: `getProductDetailsFromSalesforce` response (Apex REST passthrough)

Defined in `lib/product-salesforce-service.ts:63`. Endpoint: `{instanceUrl}/services/apexrest/gtherp/product/details`.

**Contract (unchanged call shape)**:
- Request: `GET` with `accountId`, `contactId`, `productId`, `tabName` query params — no change.
- Response: JSON object containing product fields as returned by the Apex endpoint today, **plus** `gtherp__Image_URL__c` (confirmed field name — see `research.md` §3).
- This feature does not add a new endpoint or change the request contract — it only starts reading one additional field from the same existing response.

**Resolved (2026-08-11)**: confirmed against a live payload by calling the endpoint directly with a product known to have a real photo. The field IS present in the response, but the Apex endpoint strips the `gtherp__` namespace prefix from every custom field it returns (same as `Product_Availability__c`, `Available_To_Sell__c`, etc.) — so it comes back as `Image_URL__c`, not `gtherp__Image_URL__c`. No Apex/Salesforce-side change was needed. `mapSalesforceProductToLocal` (`lib/products-service.ts`) now reads `sfProduct.gtherp__Image_URL__c ?? sfProduct.Image_URL__c` to handle both the raw-REST shape (bulk load path) and the Apex-response shape (detail page path).
