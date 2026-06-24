# Research: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Feature**: `specs/005-configure-group-picklist-api`
**Date**: 2026-06-24

## Unknowns Resolved

No NEEDS CLARIFICATION markers in spec. All decisions derivable from existing codebase patterns.

---

## Decision Log

### D-001: Reuse existing picklist endpoint vs new endpoint

**Decision**: Reuse the existing `/api/salesforce/picklists?accountId=...&contactId=...` endpoint — no new API route or service method needed.

**Rationale**: The endpoint already exists, is already auth-guarded (`requireAccountAccess`), and already returns `Product_Grouping__c` in its response. Adding a new endpoint would be unnecessary duplication. Confirmed by inspecting `app/api/salesforce/picklists/route.ts` and `lib/salesforce-auth.ts`.

**Alternatives considered**: A dedicated `?action=groupings` query param on the orders endpoint — rejected; the picklist endpoint is the correct semantic home for picklist data.

---

### D-002: State management — useState + useEffect vs useMemo

**Decision**: Replace the `grpLabels` useMemo (feature 003, derived from catalog state) with `const [grpLabels, setGrpLabels] = useState<string[]>([])` and a `useEffect` that fires when `SF_ACCOUNT_ID` and `SF_CONTACT_ID` are ready.

**Rationale**: The catalog-derived useMemo was synchronous and only as complete as the loaded catalog. A `useEffect` fetch allows loading from Salesforce independently of catalog contents, matching how `Shipping_Method__c` is loaded in `app/orders/[id]/page.tsx` (lines 548–572 — the exact pattern to follow).

**Alternatives considered**: Fetching inside the catalog useEffect — rejected; the picklist fetch is independent and should not be coupled to catalog load timing.

---

### D-003: Picklist response extraction

**Decision**: Extract `result.data[0].Product_Grouping__c` from the API response — the same indexing pattern used in `app/orders/[id]/page.tsx` line 558.

**Rationale**: The picklist API returns `{ success: true, data: [ { Shipping_Method__c: [...], Incoterms__c: [...], Product_Grouping__c: [...] } ] }`. Access via `result.data[0].Product_Grouping__c` is consistent with all existing usages.

**Alternatives considered**: `result.data?.Product_Grouping__c` — rejected; `data` is an array, not an object.

---

### D-004: Error / empty-state handling

**Decision**: On fetch failure or missing `Product_Grouping__c`, leave `grpLabels` as `[]`. The existing JSX guard from feature 003 (`grpLabels.length > 0`) already hides the list section when empty — no additional UI change needed.

**Rationale**: Silent degradation is the established pattern for picklist loading failures in this codebase (see `console.error` in `app/orders/[id]/page.tsx` line 568 with no user-facing error). The custom input remains usable regardless.

**Alternatives considered**: Show an error toast — rejected; picklist unavailability is non-critical and should not surface as an error.

---

### D-005: Removal of feature-003 grpLabels useMemo

**Decision**: Delete the `grpLabels` useMemo line added in feature 003 (`app/configure/page.tsx` line 416). Replace it with the new `useState` declaration (placed with other state declarations at the top) and a new `useEffect` (placed near the catalog fetch useEffect).

**Rationale**: The useMemo and the new useState serve the same purpose. Keeping both would cause a name conflict. The useMemo is strictly superseded.
