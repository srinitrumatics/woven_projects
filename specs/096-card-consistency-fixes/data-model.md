# Data Model: Card Consistency Fixes

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact className changes per file.

## Icon-bubble color fix (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/orders/[id]/components/BillingInfo.tsx:19` | Icon `<svg>` | `text-green-600 dark:text-green-400` | `text-blue-600 dark:text-blue-400` |
| `app/quotes/[id]/components/QuoteBillingInfo.tsx:13` | Icon `<svg>` | `text-green-600 dark:text-green-400` | `text-blue-600 dark:text-blue-400` |
| `app/proposals/[id]/components/BillingInfo.tsx:13` | Icon `<svg>` | `text-green-600 dark:text-green-400` | `text-blue-600 dark:text-blue-400` |

Bubble color (`bg-blue-50 dark:bg-blue-900/20`) is already correct in all 3 files — unchanged. Reference (already correct, unchanged): `app/invoices/[id]/components/InvoiceBillingInfo.tsx:30-31`, `app/supplier-bills/[id]/components/BillingInformation.tsx:15-18`.

## Product Detail card reconciliation (US2)

| File | Element | Before | After |
|---|---|---|---|
| `app/products/[id]/components/ProductInfoCard.tsx:24` | Root `<div>` | `rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 ... transition-all duration-300 hover:shadow-2xl` | `rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ...` (hover/transition removed entirely) |

Reference (unchanged, the target pattern being matched): `app/products/ProductClientPage.tsx:543` catalog card — `rounded-xl shadow-sm hover:shadow-lg` (catalog card's own `hover:shadow-lg` is retained since it IS a clickable `<Link>`, unlike `ProductInfoCard`).

## Reports page legacy shadow (US3)

| File | Element | Before | After |
|---|---|---|---|
| `app/reports/page.tsx:13` | Card `<div>` | `rounded-lg shadow p-6` | `rounded-lg shadow-md p-6` |

Reference (unchanged, the target pattern being matched): `app/unauthorized/page.tsx:5` — `rounded-lg shadow-md`.

## Explicitly unmodified populations

| Population | File count | Pattern |
|---|---|---|
| Dominant detail-page info card | 37 | `rounded-lg shadow-md border`, `bg-white dark:bg-gray-800` |
| Home/Profile stat cards | 5 | `rounded-2xl shadow-sm border`, `bg-white dark:bg-slate-900/50` |
| List-page stat/filter cards | 7 | `rounded-xl shadow-sm hover:shadow-lg` |

## Key Entities

- **Icon bubble**: A circular colored background behind a small icon on info cards; correctness means the icon color and bubble color are from the same color family.
- **Product card surface**: The conceptual "this is a product" card, rendered in 2 contexts (catalog, clickable; Product Detail, static) that should share the same shape/shadow language while differing appropriately in interactivity.
- **Legacy card shadow**: The older, flatter `shadow` (no intensity suffix) token, now confirmed to remain only on Reports' card.
