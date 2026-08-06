# Research: Explicit Product/Service Record-Type Classification in Summary Cards

## Decision 1: Confirmed classification values via live Salesforce metadata, not the user's phrasing

**Decision**: The eight valid classification values are `Product`, `Phantom`, `Bundle`, `Kit`, `Discounts`, `Digital`, `Make` (Products bucket) and `Services` (Services bucket) — queried directly from `SELECT Id, Name, DeveloperName, IsActive FROM RecordType WHERE SObjectType = 'Product2'` against the live org. This confirms and corrects the user's request, which used "discount" and "service" (singular) — the real values are `Discounts` and `Services` (both plural).

**Rationale**: This project's established practice (see `111`/`112` research) is to verify Salesforce-field-dependent claims live rather than trust either the user's or a prior spec's phrasing. Getting the plural/singular wrong here would make the new explicit check silently fail to match real data, reintroducing exactly the kind of bug this feature fixes.

**Alternatives considered**: Trusting the user's literal spelling — rejected; live verification takes precedence per established project practice, and the two corrections are load-bearing (a strict string-equality check against `"Service"` would never match the real value `"Services"`).

## Decision 2: Re-diagnosed the Proposal bug — it's a too-narrow match, not a broken field read

**Decision**: The actual bug in `ProposalSummary.tsx` is that its Products filter (`p.product_record_type === 'Product'`) only matches the single literal value `"Product"`, excluding the other six non-service classifications from the Products row entirely (they also never match the Services filter, so they vanish from both rows). This is the same class of bug already fixed elsewhere in `112`, not the "field is always blank" issue `112`'s completion report flagged.

**Rationale**: Re-reading `app/proposals/[id]/page.tsx`'s line-mapping (the code that builds the `proposedProducts` array `ProposalSummary` receives) shows it already reads `item.Product_Record_Type__c || item.product_record_type || item.RecordType?.Name || ''` — the correct, proper-case Salesforce field is already prioritized first. Live-testing a real proposal (`a1EQL0000056p6b2AA`, 2 lines, both classified `Digital`) confirms `product_record_type` on the mapped object holds the real value `"Digital"` by the time it reaches the component — but `ProposalSummary.tsx`'s filter only recognizes the literal string `"Product"`, so a `"Digital"` line matches neither the Products filter nor the Services filter and disappears from both, which is exactly what was observed (`(0) Products` / `(0) Services` on a proposal with 2 real lines). `112`'s earlier claim — that the raw Salesforce API response lacks a lowercase `product_record_type` field — was correct as far as it went, but incomplete: it didn't account for the page's own mapping code already bridging that gap before the value reaches the summary component.

**Alternatives considered**: None — this is a factual correction from re-reading the code, not a design choice.

## Decision 3: Introduce one shared classification helper, used identically by all six pages

**Decision**: Add a single small module (`lib/utils/product-record-type.ts`) exporting:
- `SERVICE_RECORD_TYPE = 'Services'`
- `KNOWN_PRODUCT_RECORD_TYPES = ['Product', 'Phantom', 'Bundle', 'Kit', 'Discounts', 'Digital', 'Make']` (documentation/reference — see Decision 4 for why this isn't what the runtime check uses)
- `isServiceRecordType(recordType: string | null | undefined): boolean` — returns `recordType === SERVICE_RECORD_TYPE`

Every one of the six Summary components/pages calls this same function instead of its own inline `=== 'Services'` / `!== 'Services'` / `=== 'Product'` comparison.

**Rationale**: Unlike `112` (where each page's surrounding data shape genuinely differed enough that inlining independently was the smaller diff, and a shared "line splitter" would have been a premature abstraction per Constitution Principle V), this feature's entire point — per spec FR-001/002/006 — is that all six pages must apply the *identical* rule. A single exported constant/function is not a premature abstraction here; it is the direct, simplest implementation of "the same rule everywhere," and it is the only way to guarantee a future correction (e.g., if a ninth record type is ever added) only has to change in one place instead of six.

**Alternatives considered**:
- *Repeat the same inline string comparison in all six files* — Rejected: this is exactly the status quo the feature is meant to replace; six independent copies of "the same rule" is the maintenance-drift risk the spec's Assumptions section calls out, and is how Proposal's copy silently diverged (`=== 'Product'` instead of the correct rule) in the first place.
- *A richer classification enum/type* — Rejected as disproportionate; a two-value bucket (service vs. everything else) with one exported reference list is all six requirements need.

## Decision 4: The runtime check is a negative match (`!== 'Services'`), not a positive allowlist match — this is what satisfies FR-003

**Decision**: `isServiceRecordType` is the only classification predicate actually used for bucketing. "Is this a product line?" is computed as `!isServiceRecordType(recordType)`, not as "is `recordType` one of the seven known product values?".

**Rationale**: Spec FR-003 requires that a line whose classification is *not* one of the eight known values still counts toward Products rather than vanishing from both rows (the same failure mode Decision 2 diagnosed for Proposal, just for a hypothetical future ninth value instead of today's six). A negative match against the one Services value automatically satisfies this — any current or future non-`"Services"` value, known or not, is a product line. `KNOWN_PRODUCT_RECORD_TYPES` is still exported (satisfying FR-002's intent to document exactly which values are expected) but is reference/documentation data, not a value the running code branches on.

**Alternatives considered**:
- *Literal allowlist match against the seven known values, with an explicit "else → Products" fallback branch* — Rejected as needlessly more code for an identical result: a negative match against one value already is that fallback, without a separate branch to maintain or forget.

## Decision 5: Per-page current-state inventory (informs `data-model.md`)

| Page | Current comparison site(s) | Property read | Change needed |
|---|---|---|---|
| Order (`OrderClientPage.tsx`) | 1 site (`serviceItems` filter, ~line 1147) | `product.productRecordType` (camelCase, mapped in `112`) | Wrap in `isServiceRecordType(...)` |
| Quote (`QuoteSummary.tsx`) | 2 sites (`serviceLines`/`productLines` filters, ~line 24-25) | `line.productRecordType` | Wrap both in `isServiceRecordType(...)` / `!isServiceRecordType(...)` |
| Invoice (`app/invoices/[id]/page.tsx`) | 4 sites (subtotal ×2 ~line 212-213, count ×2 ~line 373-374) | `l.productRecordType` | Wrap all 4 |
| Supplier Bill (`app/supplier-bills/[id]/page.tsx`) | 1 site (`serviceLines` filter, ~line 138) | `l.productRecordType` | Wrap in `isServiceRecordType(...)` |
| Purchase Order (`POSummary.tsx`) | 1 site (`serviceLines` filter, ~line 20) | `l.Product_Record_Type__c` (raw SF field name, never mapped to a camelCase property) | Wrap in `isServiceRecordType(...)` |
| Proposal (`ProposalSummary.tsx`) | 2 sites (`productItems` ~line 25 — **the actual bug**, `serviceItems` ~line 26) | `p.product_record_type` (snake_case, already correctly populated by the page's mapping — see Decision 2) | Fix `productItems` to `!isServiceRecordType(...)` (was `=== 'Product'`); change `serviceItems` to `isServiceRecordType(...)` for consistency |

No page's line-mapping code needs a *new* field added — all six already read/expose the correct classification value under some existing property name; only the comparison itself changes.

## Decision 6: Verification approach

**Decision**: `npx tsc --noEmit`, then live browser verification of the same six documents already used to verify `112` (so before/after figures can be compared directly), plus specifically re-testing Proposal `a1EQL0000056p6b2AA` (2 lines, both `Digital`) to confirm it now shows `(2) Products` instead of `(0)`.

**Rationale**: Reusing the same real documents from `112`'s verification gives a direct, concrete before/after comparison for the "no change expected" pages (spec FR-006/SC-003), not just a fresh spot-check.
