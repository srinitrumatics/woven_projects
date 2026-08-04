# Data Model: Spinner Consolidation

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document lists every file/edit; see `research.md` for the per-pattern rationale.

## Shared component change

| File | Element | Before | After |
|---|---|---|---|
| `components/ui/LoadingSpinner.tsx` | `sizeClasses.sm` | `"w-6 h-6"` | `"w-8 h-8"` |

## US1 — Full-page loading spinners (16 files)

| File | Before | After |
|---|---|---|
| `app/invoices/[id]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/inventory/[id]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/invoices/[id]/lines/[lineid]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/orders/create/page.tsx` | spinner + `<p>` inside a `text-center` sub-wrapper | `<LoadingSpinner size="md" text="Creating new order..." />`, sub-wrapper removed |
| `app/orders/[id]/lines/[lineId]/page.tsx` | spinner + `<p>` inside a `text-center` sub-wrapper | `<LoadingSpinner size="md" text="Loading order line details..." />`, sub-wrapper removed |
| `app/products/[id]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/proposals/[id]/page.tsx` | bare spinner div (inside a loading-skeleton block) | `<LoadingSpinner size="md" />`; skeleton siblings untouched |
| `app/profile/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/proposals/[id]/lines/[lineid]/page.tsx` | spinner + `<p>` inside a `text-center` sub-wrapper | `<LoadingSpinner size="md" text="Loading product details..." />`, sub-wrapper removed |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/quotes/[id]/page.tsx` | spinner + `<p>` as flex-col siblings | `<LoadingSpinner size="md" text="Loading quote details..." />`; outer wrapper's `flex-col` dropped (redundant) |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/shipments/[id]/page.tsx` | spinner + `<p>` as flex-col siblings | `<LoadingSpinner size="md" text="Loading shipment details..." />`; outer wrapper's `flex-col` dropped (redundant) |
| `app/shipments/[id]/lines/[lineid]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/supplier-bills/[id]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` | bare spinner div | `<LoadingSpinner size="md" />` |

## US2 — Tab-panel loading spinners (10 files, 11 occurrences)

| File | Before | After |
|---|---|---|
| `app/products/[id]/components/ComplianceCertsTab.tsx` | spinner + `<p>` in a `text-center` wrapper | `<LoadingSpinner size="sm" text="Loading certifications..." />` |
| `app/products/[id]/components/DatasheetsTab.tsx` | spinner + `<p>` in a `text-center` wrapper | `<LoadingSpinner size="sm" text="Loading datasheets..." />` |
| `app/products/[id]/components/EditProductTabs.tsx` (2 occurrences) | bare spinner div, `border-blue-600` (off-brand) | `<LoadingSpinner size="sm" />` ×2, corrects color to brand primary |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (2nd occurrence, tab-panel) | bare spinner div | `<LoadingSpinner size="sm" />` |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx` | bare spinner div | `<LoadingSpinner size="sm" />` |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx` | bare spinner div | `<LoadingSpinner size="sm" />` |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` | bare spinner div | `<LoadingSpinner size="sm" />` |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` (2nd occurrence, tab-panel) | bare spinner div | `<LoadingSpinner size="sm" />` |
| `components/ui/DataTable.tsx` (`TableLoadingState`) | spinner + optional `message` laid out horizontally | `<LoadingSpinner size="sm" text={message} />`, vertical layout |
| `app/home/page.tsx` | spinner + `<p>`, `border-blue-600` (off-brand), inside an absolute overlay | `<LoadingSpinner size="sm" text="Updating dashboard..." />`, corrects color; overlay wrapper untouched |

## Explicitly unmodified elements

| Element | Reason |
|---|---|
| ~25+ inline button/icon spinners (save buttons, 8 FilesTab upload spinners, refresh icons) | Different shape from `LoadingSpinner`; explicitly out of scope per FR-006 |
| Every page's real content once loading completes | Untouched — this feature only changes the loading-state markup |
| Business logic / data-fetching in every touched file | Untouched — presentation-layer only |

## Key Entities

- **Full-page loading spinner**: The lone, centered spinner shown while an entire page's data is fetching, now rendered via `LoadingSpinner` at `size="md"` across all 16 occurrences.
- **Tab-panel loading spinner**: The smaller, centered spinner shown while a nested tab/sub-section's own data is fetching, now rendered via `LoadingSpinner` at `size="sm"` (redefined to 32px) across all 10 occurrences.
