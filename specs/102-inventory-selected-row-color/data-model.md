# Data Model: Inventory Selected-Row Color Consistency

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact className changes.

## Sticky-cell selected-state color fix

| File | Element | Before | After |
|---|---|---|---|
| `app/inventory/page.tsx:628` | Pinned checkbox `<Td>` (selected state) | `bg-blue-50 dark:bg-gray-700` | `bg-primary-light dark:bg-gray-700` |
| `app/inventory/page.tsx:637` | Pinned product-name `<Td>` (selected state) | `bg-blue-50 dark:bg-gray-700` | `bg-primary-light dark:bg-gray-700` |

Reference (already correct, unchanged): `app/inventory/page.tsx:609` — this same page's own sticky "Product Name" header, `bg-primary-light dark:bg-gray-900`; `app/inventory/page.tsx:627` — the row's own selected-state background, `bg-primary/5 dark:bg-primary/10`.

## Explicitly unmodified elements

| Element | Reason |
|---|---|
| Both cells' `dark:bg-gray-700` token | Neutral gray, never flagged as off-brand — not part of the confirmed defect |
| Both cells' unselected-state classes (`bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700`) | Already correct, unchanged |
| Row's own selected-state background (`bg-primary/5 dark:bg-primary/10`, line 627) | Already correct, unchanged |
| Every other page/table in the app | Not named in this feature's scope |

## Key Entities

- **Selected-row highlight**: The background tint applied to an Inventory row when selected, now rendering as one consistent brand-primary-family color across both pinned columns and the rest of the row (light mode).
