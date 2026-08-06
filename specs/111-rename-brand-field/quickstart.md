# Quickstart: Validate the Product Brand Field Rename

## Prerequisites

- Local checkout of this branch with the rename applied.
- `npm install` already run (standard project setup — see `CLAUDE.md`).
- A running dev server (`npm run dev`) with a valid Salesforce session, per the project's existing headless/manual verification convention. At least one product/line item in the connected org must have a non-empty brand value to verify against.

## 1. Static verification — zero remaining old-name references

```bash
grep -rn "Product_Brand_Name__c" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected**: no output. Per `data-model.md`, this must cover all 30 files / 60 lines / 63 occurrences from the original inventory.

```bash
# No fallback expression or interface should now list Brand_Name__c twice.
grep -rn "Brand_Name__c.*Brand_Name__c" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected**: no output (see `research.md` Decision 2 for the specific sites that needed deduplication).

## 2. Type-check

```bash
npx tsc --noEmit
```

**Expected**: no new type errors introduced by the rename (interface property renames/dedups should be type-safe no-ops).

## 3. Manual browser verification — one page per pipeline

Pick a product/line known to have a brand value in the connected Salesforce org, then check:

| Pipeline | Page to open | What to confirm |
|---|---|---|
| Apex REST line items | An Order detail page → a line's detail (`/orders/[id]/lines/[lineid]`) or any of Invoices/Proposals/Quotes/Purchase Orders/Shipments/Supplier Bills line pages | Brand Name column/field shows the same value it showed before the rename (not blank, not a dash placeholder where a value previously existed) |
| Apex REST line items | `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`'s table specifically | Click the "Brand Name" column header — sort toggles correctly (ascending/descending) and the column width still resizes/persists, confirming the internal sort-key/column-width rename (Decision 3) is wired correctly |
| SOQL / Algolia sync | Product Catalog (`/products`) and the Configure Order "Browse Catalog" panel | Brand values display on product cards; the Manufacturer/Brand filter still filters correctly |
| SOQL / Algolia sync | Trigger a product sync (per the project's existing sync workflow) | Sync completes with no errors referencing an unknown/missing Salesforce field |

## 4. Regression check — untouched pages still work

Spot-check one page that was **not** in the occurrence inventory (e.g. Orders landing list) to confirm nothing outside the intended scope was altered.

## Rollback

This is a pure text rename with no schema or data migration. Reverting the commit(s) fully undoes the change; no database migration or Salesforce-side rollback is required from this repo.
