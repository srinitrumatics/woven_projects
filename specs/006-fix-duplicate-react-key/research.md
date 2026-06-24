# Research: Fix Duplicate React Key — [object Object]

**Feature**: `specs/006-fix-duplicate-react-key`
**Date**: 2026-06-24

## Unknowns Resolved

No NEEDS CLARIFICATION markers in spec. All decisions derivable from existing codebase patterns.

---

## Decision Log

### D-001: Root cause — where is `[object Object]` used as a key?

**Decision**: The sole source is `app/configure/page.tsx` in the `grpLabels.map(label => <div key={label}>)` dropdown render (approximately line 553 after feature 005 changes).

**Rationale**: The `grpLabels` state is typed as `string[]` and populated by the picklist `useEffect` added in feature 005:
```ts
if (picklistData.Product_Grouping__c) {
  setGrpLabels(picklistData.Product_Grouping__c);
}
```
The Salesforce picklist API (`/api/salesforce/picklists`) can return picklist field arrays in either of two shapes:
- Plain strings: `["Group A", "Group B"]`
- Objects: `[{ value: "Group A", label: "Group A" }, ...]`

When objects are returned, calling `setGrpLabels(picklistData.Product_Grouping__c)` stores objects in a `string[]` state. TypeScript does not catch this at runtime if the API response is typed as `any`. React then receives an object as `key={label}` and coerces it to `"[object Object]"`, making every key identical.

**Alternatives considered**: Fixing the JSX (`key={String(label)}`) — rejected; this only masks the symptom and `{label}` would still render `[object Object]` as visible text. The correct fix is to normalize at ingestion so `grpLabels` always contains primitives.

---

### D-002: Normalization strategy

**Decision**: In the `useEffect`, map each raw picklist item through a normalizer before calling `setGrpLabels`:
```ts
const raw: any[] = picklistData.Product_Grouping__c;
const normalized = raw.map((item: any) =>
  typeof item === 'object' && item !== null
    ? (item.value ?? item.label ?? String(item))
    : String(item)
).filter(Boolean);
setGrpLabels(normalized);
```

**Rationale**: This mirrors the exact defensive pattern already established in:
- `app/admin/authorize-locations/components/LocationModal.tsx` lines 192–195 (locationTypes and addressTypes options)
- `app/admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx` lines 250–253 (day-of-week options)

Both files use `typeof x === 'object' ? x.value || x.label : x` before using the value as a key. The `filter(Boolean)` removes any null/undefined/empty entries that would produce an empty key.

**Alternatives considered**:
- Type the API response more strictly — rejected; the API response is an external Salesforce response and stricter typing would require changes outside this component.
- Normalize inside `setGrpLabels` via a wrapper — rejected; unnecessary abstraction for a one-time transformation.

---

### D-003: JSX impact

**Decision**: No JSX changes required. The existing `key={label}` and `{label}` in the dropdown are correct once `grpLabels` contains only primitive strings.

**Rationale**: The dropdown JSX from feature 003 is:
```tsx
{grpLabels.map(label => (
  <div key={label} ... onClick={() => addGroup(label, 'bg-gray-500')}>{label}</div>
))}
```
After normalization, `label` is always a non-empty string, so `key={label}` is unique per item (assuming Salesforce returns distinct picklist values), `{label}` displays correctly, and `addGroup(label, ...)` receives the correct string. No JSX edits needed.

---

### D-004: Are there other affected components?

**Decision**: No other components need changes for this bug report. The `[object Object]` warning is specific to `app/configure/page.tsx`.

**Rationale**: The codebase search confirmed that `LocationModal.tsx` and `DeliveryWindowModal.tsx` already apply the defensive pattern. Other pages using the picklist API (`app/orders/[id]/page.tsx`) extract `Shipping_Method__c` and `Incoterms__c` into `<option>` or similar elements where the key/value pattern is handled differently. Only the configure-page `grpLabels` fetch (added in feature 005) lacks the normalization step.
