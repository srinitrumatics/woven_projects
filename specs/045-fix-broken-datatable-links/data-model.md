# Phase 1 "Data Model": Fix Broken Data Table Hyperlinks

This feature has no data entities — it is a hyperlink-guard logic fix. This document records the before/after guard condition for each of the 5 edit sites.

## User Story 1 — Customer Quote Line guard (3 identical edits)

| File | Line | Before | After |
|---|---|---|---|
| `POSupplierBillLinesTable.tsx` | 153 | `line.Customer_Quote_Line__c ?` | `line.Customer_Quote_Line__c && line.Customer_Quote__c ?` |
| `PORtvLinesTab.tsx` | 143 | `line.Customer_Quote_Line__c ?` | `line.Customer_Quote_Line__c && line.Customer_Quote__c ?` |
| `PODebitMemoLinesTab.tsx` | 147 | `line.Customer_Quote_Line__c ?` | `line.Customer_Quote_Line__c && line.Customer_Quote__c ?` |

The outer conditional this guards is unchanged; only the truthy-check expression gains the `&& line.Customer_Quote__c` clause. No other line in these three files changes for this user story.

## User Story 2 — Supplier Bill Line's own primary link (1 edit)

**File**: `POSupplierBillLinesTable.tsx`, lines 137-141

**Before**:
```jsx
<td className="... sticky left-0 ..." title={line.Name}>
    <Link href={`/supplier-bills/${line.Supplier_Bill__c}/lines/${line.Id}`} className="text-primary hover:underline font-medium">
        {line.Name}
    </Link>
</td>
```

**After**:
```jsx
<td className="... sticky left-0 ..." title={line.Name}>
    {line.Supplier_Bill__c ? (
        <Link href={`/supplier-bills/${line.Supplier_Bill__c}/lines/${line.Id}`} className="text-primary hover:underline font-medium">
            {line.Name}
        </Link>
    ) : (
        <span className="font-medium">{line.Name}</span>
    )}
</td>
```

## User Story 3 — Inventory "Average Days Aged" tile (remove 3 dead links)

**File**: `app/inventory/page.tsx`, lines 426-435

**Before**:
```jsx
<Link href="#" className="hover:underline block">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="Average Days Aged">Average Days Aged</p>
</Link>
<div className="flex items-baseline gap-2 group/count">
    <Link href="#" className="hover:underline block">
        <span className="text-3xl font-bold text-gray-900 dark:text-white ">{stats.avgDaysAged.toFixed(2)}</span>
    </Link>
    <Link href="#" className="hover:underline block">
        <span className="text-sm text-gray-500 dark:text-gray-400 ">Days</span>
    </Link>
</div>
```

**After** (Link wrappers removed, inner elements kept as-is, `hover:underline` styling removed since there's no longer a link to underline on hover):
```jsx
<p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="Average Days Aged">Average Days Aged</p>
<div className="flex items-baseline gap-2">
    <span className="text-3xl font-bold text-gray-900 dark:text-white ">{stats.avgDaysAged.toFixed(2)}</span>
    <span className="text-sm text-gray-500 dark:text-gray-400 ">Days</span>
</div>
```

Note: `group/count` class removed from the wrapping div since it was only used to scope a `group-hover/count:` style on the count text in the *other* cards (Card 3/4) — this card's `<span>` for the count never referenced `group-hover/count:` itself, so removing the named group has no visual effect here.

## Unchanged

- Every other column, row, and cell in all 4 files.
- `isManufacturer` computation and all other gating logic.
- The `activeTab`/`TabFilter` state and the other three Inventory summary tiles (Card 1 "All", Card 3 "Put-Away", Card 4 "On Hold") — untouched.
