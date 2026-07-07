# Phase 0 Research: Fix Broken Data Table Hyperlinks

## Audit methodology (recap)

A full audit was run this session across all 231 `.tsx` files under `app/`: every `<Link href={\`...\`}>` occurrence (~260 across 70 files) was cross-checked against its surrounding guard condition, plus a separate sweep of all `href="#"` occurrences (~74, across the 8 main list pages). The audit found the portal's hyperlink logic is correct almost everywhere — only 3 confirmed broken links, 1 defensive-coding gap, and 3 genuinely dead links, all detailed below. See the completion report in this session's conversation history for the full methodology and negative results (everything checked and found correct).

## User Story 1: Customer Quote Line guard/href field mismatch

**Current state** (confirmed identical in all three files):

```jsx
{line.Customer_Quote_Line__c ? (
    !isManufacturer ? (
        <Link href={`/quotes/${line.Customer_Quote__c}/lines/${line.Customer_Quote_Line__c}`} target="_blank" className="text-primary hover:underline font-medium">
            {line.Customer_Quote_Line_Name || 'View Quote Line'}
        </Link>
    ) : (
        <span className="font-medium">{line.Customer_Quote_Line_Name || '-'}</span>
    )
) : displayCell(line.Customer_Quote_Line_Name)}
```

| File | Line |
|---|---|
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | 153 |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | 143 |
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | 147 |

**Confirmed via live query** (prior session, `GET /api/purchase-orders?...&action=bills`/`action=returns`&objectName=Purchase_Order_Line__c`): the raw Salesforce payload for these three related-list objects never includes a `Customer_Quote__c` field — only `Customer_Quote_Line__c` and `Customer_Quote_Line_Name`. So `line.Customer_Quote__c` is always `undefined` when this branch renders, producing `/quotes/undefined/lines/{realId}`.

**Decision**: Add `line.Customer_Quote__c` to the outer guard: `line.Customer_Quote_Line__c && line.Customer_Quote__c ? (...)`. This is the identical fix already correctly implemented (and already fixed by a prior feature in this same session) on the sibling file `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx:121` (`line.Customer_Quote_Line__c && line.Customer_Quote__c ? (...)`), and matches the pattern used by ~14 other components across the codebase for identical parent+child ID pairs (e.g., `POLinesTable.tsx:140`: `line.customerQuoteLineId && line.customerQuoteId`).

**Rationale**: Since `Customer_Quote__c` is confirmed always absent on this specific endpoint, this fix means the Customer Quote Line cell will render as plain text (never a link) until the backend adds the field — this is correct, spec-required behavior (a non-functional link is worse than honest plain text), not a regression, and exactly mirrors how the sibling file above already behaves.

**Alternatives considered**: Falling back to a quote-line-only route (no parent quote segment). Rejected — no such route exists (`app/quotes/[id]/lines/[lineid]/page.tsx` requires both segments); adding one is out of scope for a link-guard fix.

## User Story 2: Supplier Bill Line's own primary link is unguarded

**Current state** (`app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx:137-141`):

```jsx
<td className="... sticky left-0 ..." title={line.Name}>
    <Link href={`/supplier-bills/${line.Supplier_Bill__c}/lines/${line.Id}`} className="text-primary hover:underline font-medium">
        {line.Name}
    </Link>
</td>
```

Six lines later, the "Supplier Bill #" column on the same tab (line 144) correctly guards the identical field:

```jsx
{line.Supplier_Bill__c ? (
    <Link href={`/supplier-bills/${line.Supplier_Bill__c}`} target="_blank" className="text-primary hover:underline font-medium">
        {line.Supplier_Bill_Name || ''}
    </Link>
) : displayCell(line.Supplier_Bill_Name)}
```

**Live-data check**: queried the same endpoint across 4 different Supplier Bill Line records — `Supplier_Bill__c` was populated in every case. Unlike `Customer_Quote__c`, this is architecturally a required parent relationship (every Supplier Bill Line belongs to exactly one Supplier Bill), so it is expected to always be present — this is a defensive-coding gap, not a confirmed production failure.

**Decision**: Guard the primary link the same way: `{line.Supplier_Bill__c ? (<Link href={...}>{line.Name}</Link>) : displayCell(line.Name)}`, matching the already-correct pattern six lines below it in the same file.

**Rationale**: Consistency and defense — if this field is ever absent (e.g., a data migration edge case, a bulk-load gap), the row's own primary sticky-column link should degrade the same way every other guarded link in this codebase does, rather than being the one exception.

## User Story 3: Inventory "Average Days Aged" tile has no real click behavior

**Current state** (`app/inventory/page.tsx:15,426-435`):

```jsx
type TabFilter = "All" | "On Hold" | "Put-Away";   // no "Average Aged" filter exists
...
<Link href="#" className="hover:underline block">
    <p ...>Average Days Aged</p>
</Link>
<div className="flex items-baseline gap-2 group/count">
    <Link href="#" className="hover:underline block">
        <span ...>{stats.avgDaysAged.toFixed(2)}</span>
    </Link>
    <Link href="#" className="hover:underline block">
        <span ...>Days</span>
    </Link>
</div>
```

Unlike the portal's other three summary tiles (each wrapped in a `<button onClick={() => handleCardClick(...)}>` that sets `activeTab` to a real `TabFilter` value), this card is a plain `<div>` with no `onClick` anywhere, and `avgDaysAged`/`Average Aged` has no corresponding entry in the `TabFilter` union type at all — there is no filter state this tile could ever activate.

**Decision**: Remove the three `<Link href="#">` wrappers, keeping their inner `<p>`/`<span>` elements as plain (non-link) content, per FR-005's "or MUST NOT be rendered as a clickable link" branch.

**Rationale**: Since no corresponding filter exists (confirmed via the `TabFilter` type definition and the `activeTab` branching logic at lines 80-82, which only handles `"All"`/`"On Hold"`/`"Put-Away"`), wiring a fake `onClick` would require inventing new filter behavior not requested by this feature — out of scope. Removing the non-functional link wrapper is the minimal, correct fix.

**Alternatives considered**: Adding a real "Average Aged" filter tab/state. Rejected — this would be new feature scope (a new filter behavior), not a broken-link fix; the spec's FR-005 explicitly allows "or MUST NOT be rendered as a clickable link" as the resolution path precisely for cases like this.
