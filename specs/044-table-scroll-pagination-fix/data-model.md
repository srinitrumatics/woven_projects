# Phase 1 "Data Model": Data Table Scroll Container Excludes Pagination

This feature has no data entities — it is a pure JSX layout fix. This document records the before/after structure for each of the 6 files instead.

## 1. `app/invoices/[id]/components/InvoiceLineItems.tsx`

**Before** (L59-202):
```jsx
<div className="overflow-x-auto">
    <table>...</table>
    <Pagination ... />
</div>
```

**After**:
```jsx
<div className="flex flex-col">
    <div className="overflow-x-auto">
        <table>...</table>
    </div>
    <Pagination ... />
</div>
```

## 2. `app/shipments/[id]/components/InventoryTab.tsx`

**Before** (L150-216): `<div className="overflow-x-auto py-2">` wraps `<table>` + `<Pagination>`.

**After**: `<div className="flex flex-col">` wraps `<div className="overflow-x-auto py-2"><table>...</table></div>` + `<Pagination ... />` as a sibling.

## 3. `app/shipments/[id]/components/SerialNumbersTab.tsx`

**Before** (L137-192): `<div className="overflow-x-auto py-2">` wraps `<table>` + `<Pagination>`.

**After**: `<div className="flex flex-col">` wraps `<div className="overflow-x-auto py-2"><table>...</table></div>` + `<Pagination ... />` as a sibling.

## 4. `app/shipments/[id]/components/ShipmentLinesTab.tsx`

**Before** (L192-300): `<div className="overflow-x-auto">` wraps `<table>` + `<Pagination>`.

**After**: `<div className="flex flex-col">` wraps `<div className="overflow-x-auto"><table>...</table></div>` + `<Pagination ... />` as a sibling.

## 5. `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`

**Before** (L125-178): `<div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">` wraps `<table>` + `<Pagination>`.

**After**: `<div className="flex flex-col mt-4">` wraps `<div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg"><table>...</table></div>` + `<Pagination ... />` as a sibling. (`mt-4` moves to the new outer wrapper; `border`/`rounded-lg` stay on the inner scroll div so only the table keeps its bordered-card look — see research.md.)

## 6. `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`

**Before** (L111-164): `<div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">` wraps `<table>` + `<Pagination>`.

**After**: `<div className="flex flex-col mt-4">` wraps `<div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg"><table>...</table></div>` + `<Pagination ... />` as a sibling. Same rationale as file 5.

## Unchanged in all 6 files

- Every prop passed to `<Pagination>` (currentPage, totalPages, onPageChange, totalItems, itemsPerPage, itemName).
- Every `<table>`, `<thead>`, `<tbody>`, column, and row.
- All sort/filter/pagination state and logic (`useState`, `useSortableData`, `useResizableColumns`, slicing logic).
- Any conditional wrapping already present (e.g., `{condition && (<Pagination .../>)}` in files that have one) — the conditional stays, only its position relative to the scroll div changes.
