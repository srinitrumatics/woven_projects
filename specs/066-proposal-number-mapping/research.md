# Phase 0 Research: Proposal # Columns Show the Proposal Number, Not the Name

No `NEEDS CLARIFICATION` markers were left in the Technical Context — the codebase itself already contains the correct reference implementation, so research consisted of confirming that pattern and cataloguing every place that deviates from it.

## Decision: The correct field is Salesforce's `Proposal_Number__c`

**Rationale**: `app/proposals/page.tsx:73` and `app/proposals/[id]/page.tsx:330` already implement the desired behavior:
```ts
proposalNumber: item.Proposal_Number__c || item.Name || 'N/A'
```
`app/home/page.tsx:230` and `app/program360/page.tsx:230` independently confirm the same field name (`Proposal_Number__c`) is the correct, existing Salesforce field for the human-facing proposal identifier in `PRP-YY-MM-NNNNNN` format (e.g. `PRP-26-04-000494`). This is the field the user is asking to see under every "Proposal #" column.

**Alternatives considered**: None — the field already exists and is already correctly used elsewhere in this codebase; introducing a different field or a new derived value was never in scope.

## Decision: Two distinct root causes produce the same symptom, and both must be fixed

Grepping the codebase for `Proposal_Number` and `proposalName`/`proposal_name` across `app/**` surfaced two separate failure patterns:

1. **Field never fetched/mapped at all** — the page's data-mapping code only ever pulls `Proposal_Name` (or `Proposal__r?.Name`) into a `proposalName`/`proposal_name` field, and the "Proposal #" column is bound to that same value. No `Proposal_Number__c` reference exists anywhere in the file.
   - Confirmed in: `app/quotes/page.tsx`, `app/quotes/[id]/page.tsx` (and its five sub-tab components), `app/invoices/[id]/page.tsx` + `InvoiceCredits.tsx`, `app/proposals/[id]/page.tsx`'s sub-tab child-record mapping (`ReturnsTab.tsx`, `FulfillmentsTab.tsx`), `app/orders/page.tsx`.

2. **Field referenced under an incomplete name** — the mapping code does reference something named `Proposal_Number`, but without the Salesforce custom-field suffix `__c`. Since Salesforce custom fields are always suffixed, `item.Proposal_Number` resolves to `undefined` on the raw SOQL result, and the existing `|| Proposal_Name` fallback silently masks the bug by always falling through to the Name.
   - Confirmed in: `app/purchase-orders/page.tsx:74`, `PODebitMemoTable.tsx`, `PORTVTable.tsx`, `POSupplierBillsTable.tsx`, `app/supplier-bills/page.tsx` + `SupplierBillDebitsTab.tsx`, `app/shipments/page.tsx`, `app/invoices/page.tsx`.

**Rationale for treating both as one fix**: Both produce the identical user-visible symptom (Proposal # column duplicates Proposal Name) and both are resolved the same way — ensure `Proposal_Number__c` is selected in the underlying SOQL/query layer and referenced by its full, correct name in the mapping, with `|| Name` (or the page's existing equivalent fallback field) preserved as the last resort.

**Alternatives considered**: Treating the "wrong field name" cases as lower priority since they at least attempt to reference a number field. Rejected — the user's report describes the symptom (duplication), not the mechanism, and both mechanisms need the same correction to satisfy FR-001–FR-003.

## Decision: Preserve the existing `|| Name` fallback convention

**Rationale**: `app/proposals/page.tsx` already falls back to `Name` when `Proposal_Number__c` is blank (a known, acceptable Salesforce data-completeness gap per FR-006/SC edge cases). Reusing this exact convention everywhere keeps behavior consistent app-wide and avoids introducing a new "blank" state that doesn't exist today.

**Alternatives considered**: Showing blank/"—" when the number is missing. Rejected — this would be a behavior regression relative to the app's own established, already-shipped pattern, and the spec's edge cases explicitly call for the fallback instead.

## Decision: This is a data-mapping and display change only — no SOQL schema, API contract, or service architecture change

**Rationale**: `Proposal_Number__c` already exists on the Salesforce Proposal object (proven by its use in `app/proposals/page.tsx` and `app/proposals/[id]/page.tsx`). The fix is limited to (a) adding this field to the SELECT clause of each affected query where it's missing, and (b) correcting/adding the field-name reference in each page/component's row-mapping and cell-rendering code.

**Alternatives considered**: Introducing a shared `getProposalDisplayNumber()` helper used everywhere. Considered but deferred — per Constitution Principle V (Simplicity/YAGNI), duplicating the same three-token fallback expression (`Proposal_Number__c || Name`) across ~15 call sites is simpler and more consistent with how this exact pattern already exists inline in the codebase today, rather than introducing a new shared abstraction for a one-line expression.
