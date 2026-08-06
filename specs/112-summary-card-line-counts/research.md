# Research: Fix Products/Services Line Counts in Detail Page Summary Cards

## Investigation method

Rather than trust the spec's initial assumption (written before live verification), every claim below was checked against the live Salesforce-backed dev server: logged in as a real portal user, called each page's actual Apex REST endpoint (`action=view`, `action=orderlines`, `action=quotelines`, `action=lines`), and inspected the raw JSON for the exact field names and values each summary card would need. This follows the same live-verification discipline used for prior Salesforce-field-dependent fixes on this project (see `specs/111-rename-brand-field/research.md`).

## Decision 1: Every broken page's line items expose `Product_Record_Type__c` — use the same per-line filter everywhere

**Decision**: Fix all four broken pages (Order, Quote, Invoice, Supplier Bill) with the exact same pattern already proven correct on Purchase Order and Proposal: read each line's `Product_Record_Type__c`, treat `=== 'Services'` as a service line and everything else as a product line, then derive both rows from that per-line split — never from a document-level rollup field.

**Rationale**: Live API calls confirmed `Product_Record_Type__c` is present on every one of the four broken line types, with the same values observed as on the two correct reference types:

| Line type | Endpoint called | Field confirmed present | Sample values seen |
|---|---|---|---|
| Customer Order Line | `action=orderlines` | `Product_Record_Type__c` | `Digital`, `Bundle` |
| Customer Quote Line | `action=quotelines` | `Product_Record_Type__c` | `Digital` |
| Invoice Line | `action=lines` | `Product_Record_Type__c` | `Digital` |
| Supplier Bill Line | `action=lines&tabName=Products` | `Product_Record_Type__c` | `Digital` |
| Purchase Order Line (reference) | `action=lines&tabName=Products` | `Product_Record_Type__c` | `Digital` |

No line in the sampled test data happened to carry the literal value `'Services'`, so a real non-zero Services count could not be visually confirmed end-to-end in the browser during this research pass — but the field is unambiguously present with the same shape as the two already-correct pages, and the already-shipped, user-confirmed-correct `POSummary.tsx`/`ProposalSummary.tsx` code is the authority for the exact comparison string (`=== 'Services'`). `data-model.md` documents where to re-verify with a real service line once one exists in the org's data.

**Alternatives considered**:
- *Trust the document-level rollup fields the current (broken) code reads for Quote and Supplier Bill (`Total_Services_Lines__c`, `Total_Service_Lines__c`, `Total_Services_Amount__c`, `Total_Product_Lines__c`, `Total_Service_Lines__c`)* — Rejected after live-checking: **every one of these fields is `undefined` in the actual API response** for both Quote (`action=view`) and Supplier Bill (`action=view&tabName=Supplier_Bill`). The current code's `|| 0` fallback chains mean these already silently evaluate to zero in production today — Quote's and Supplier Bill's Services numbers are not merely "sometimes wrong," they are effectively as non-functional as Invoice's hardcoded `0`, just arrived at less visibly. Continuing to read these fields, even after "fixing" the fallback logic around them, would still produce wrong output because the fields themselves don't exist on this org's records. This changes the original spec's assumption (written before this research) that Quote/Supplier Bill's Services numbers were already reliable — they were not.
- *Add a new Salesforce rollup field for products-only line count/amount on each object* — Rejected: out of scope (this is a frontend-observable data-mapping bug, not a missing SF configuration — the per-line field already exists and the two reference pages already prove it's sufficient) and would require a Salesforce schema change this project's frontend-only fix does not need.

## Decision 2: Derive Products by subtraction from the line array's own total, not by filtering for a specific "Product" label

**Decision**: Products count/subtotal = (all lines) minus (lines where `Product_Record_Type__c === 'Services'`) — not "lines where `Product_Record_Type__c === 'Product'`".

**Rationale**: The live data shows `Product_Record_Type__c` takes multiple non-service values (`Digital`, `Bundle`, and presumably others such as physical `Hardware`) — it is not a strict two-value enum. `POSummary.tsx`, the confirmed-correct reference, already uses exactly this subtraction approach (`productLinesCount = po.totalLines - serviceCount`), which correctly buckets every non-service category into "Products" regardless of how many such categories exist. Filtering for a literal `'Product'` string instead would silently drop `Digital`/`Bundle`/etc. lines from both rows, undercounting Products without incrementing Services — a new, different bug.

**Alternatives considered**:
- *Filter for an explicit `'Product'` value the way `ProposalSummary.tsx` does (`product_record_type === 'Product'`)* — Rejected as the general pattern: Proposal's own field appears to only ever take two values in practice for that object, but nothing here confirms `Product_Record_Type__c` on the other four line types is similarly binary. Subtraction is strictly safer and matches the majority reference implementation (PO).

## Decision 3: Where to compute the split, per page

**Decision**: Compute the Products/Services split as close to the existing "correct" pattern's location as possible on each page, to minimize the diff and keep the logic co-located with the data it depends on:

- **Order**: `OrderClientPage.tsx` already maps each line into a `Product`-shaped object (`orderProducts`) before computing `productsSubtotal`/`productsCount` for `OrderTotal.tsx`. Add `productRecordType: item.Product_Record_Type__c || ""` to that per-line mapping, then compute `servicesCount`/`servicesSubtotal` alongside the existing `productsSubtotal` computation (same file, same pattern as today, just split in two). `OrderTotal.tsx` needs a new Services row and two new props (`serviceCount`, `servicesSubtotal`), mirroring its existing Products row exactly.
- **Quote**: `QuoteSummary.tsx` already receives the full `lines: QuoteLine[]` array as a prop (via `QuoteDetails.tsx`) and is self-contained, matching `POSummary.tsx`'s pattern exactly. Add `productRecordType: item.Product_Record_Type__c || ""` to the `QuoteLine` mapping in `app/quotes/[id]/page.tsx`, add the field to the `QuoteLine` type, then do the filter/subtract inside `QuoteSummary.tsx` itself — no prop-shape change needed beyond the new field on each line object.
- **Invoice**: Unlike Quote, `InvoiceSummary.tsx` receives already-computed `productCount`/`serviceCount`/`productsSubtotal`/`servicesSubtotal` as props (threaded through `InvoiceDetails.tsx`) rather than the raw lines array. Keep that shape (smaller diff, no prop-drilling change) but fix the values at the source: add `productRecordType: line.Product_Record_Type__c || ""` to the line mapping in `app/invoices/[id]/page.tsx`, then compute the real split there instead of `invoice.lines.length` / hardcoded `0`, and pass the corrected numbers down unchanged in shape.
- **Supplier Bill**: `SupplierBillSummary.tsx` receives a single `bill` object with pre-computed `productLineCount`/`serviceLineCount`/`productsSubtotal`/`servicesSubtotal` fields, sourced today from the unreliable document-level rollups. `app/supplier-bills/[id]/page.tsx` already performs a *second* fetch for the lines themselves (`action=lines&tabName=Products`) immediately after building the `bill` object. Move the product/service split computation to run after that second fetch resolves (once real `Supplier_Bill_Line__c` records with `Product_Record_Type__c` are available), and update the `bill` state with the corrected `productLineCount`/`serviceLineCount`/`productsSubtotal`/`servicesSubtotal` at that point — again, no prop-shape change to `SupplierBillSummary.tsx` itself.

**Rationale**: Each choice keeps the existing component boundary and prop shape intact wherever a page already has direct access to the raw lines at the point the number is needed (Quote), and otherwise fixes the computation at its existing source location and leaves the presentational component untouched (Order's `productsSubtotal`, Invoice's props, Supplier Bill's `bill` fields) — this is the smallest correct diff per Constitution Principle V (Simplicity), and avoids introducing a new shared "line splitter" utility that no other page in this codebase currently uses (each of the two reference pages inlines its own filter/subtract logic; consistency with that established convention is preferred over a premature abstraction).

**Alternatives considered**:
- *Extract a shared `splitProductServiceLines(lines)` helper used by all six pages* — Rejected per Constitution Principle V (YAGNI / no premature abstraction): the two correct reference implementations already each inline this logic independently with no shared helper, so introducing one now would be inconsistent with the established pattern and out of proportion to a 4-line calculation repeated ~4 times.

## Decision 4: Verification approach

**Decision**: Verify with `npx tsc --noEmit`, then live-verify each of the four fixed pages against real Salesforce data logged in as a real portal user, following the same headless-browser-with-cookie-injection technique used for prior fixes on this project. Since no line with `Product_Record_Type__c === 'Services'` was found in the currently-synced test data during research, live verification will additionally confirm the zero-service-lines case (Products = full total, Services = 0) end-to-end, and confirm via direct API inspection that the arithmetic (`Products + Services = Total`) holds for whatever real data exists at verification time.

**Rationale**: Consistent with this project's established practice (`CLAUDE.md`, prior specs) of manual browser verification in the absence of an automated UI test suite.
