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

**Dependency not yet verified**: whether the Apex endpoint's response actually includes `gtherp__Image_URL__c` today has not been confirmed against a live payload (the field name came from the org owner directly, not from inspecting a response). If the Apex endpoint's field allowlist doesn't yet expose it, that's a Salesforce-side (Apex class) change outside this repository — coordinate with the org admin. Until confirmed, `mapSalesforceProductToLocal` will simply keep falling back to the placeholder image (no regression, just no visible fix) if the field is absent from the response.
