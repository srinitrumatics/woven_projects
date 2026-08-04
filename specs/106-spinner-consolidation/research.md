# Research: Spinner Consolidation

All findings below are grounded in a direct read of every affected file before planning (24 unique files, 27 spinner occurrences). No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. LoadingSpinner's `size="sm"` redefinition

**Decision**: Change `components/ui/LoadingSpinner.tsx`'s `sizeClasses.sm` from `"w-6 h-6"` to `"w-8 h-8"`.

**Rationale**: Confirmed via codebase-wide search that `LoadingSpinner` is imported nowhere today — `size="sm"` has zero existing call sites to preserve. All 10 Bucket B (tab-panel) spinners use `h-8 w-8`. Redefining `sm` to exactly match is a safe, non-breaking change and avoids inventing an awkward 4th size name for a gap that only exists because the component was never adopted.

**Alternatives considered**: Approximating Bucket B onto the current 24px `sm` — rejected per the scoping conversation; a real size mismatch would be introduced for no reason when redefining is free.

## 2. Full-page loading spinners (US1) — per-file treatment

**Decision**: For each of the 16 files, replace the raw `<div className="animate-spin ...">` with `<LoadingSpinner size="md" />` (or `<LoadingSpinner size="md" text="..." />` where a text label exists), following 4 distinct wrapper patterns found during investigation:

- **Pattern 1 — bare spinner inside a sizing wrapper, no text** (8 files: `app/inventory/[id]/page.tsx`, `app/products/[id]/page.tsx`, `app/profile/page.tsx`, `app/proposals/[id]/page.tsx`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, `app/quotes/[id]/lines/[lineid]/page.tsx`, `app/shipments/[id]/lines/[lineid]/page.tsx`, `app/supplier-bills/[id]/page.tsx`, `app/supplier-bills/[id]/lines/[lineid]/page.tsx`, `app/invoices/[id]/page.tsx`, `app/invoices/[id]/lines/[lineid]/page.tsx`): the outer wrapper (`flex items-center justify-center` plus a real sizing class like `min-h-[400px]`/`h-64`/`min-h-screen`/`h-screen`) does layout work `LoadingSpinner` doesn't replicate, so it's kept unchanged; only the inner raw spinner `<div>` is replaced with `<LoadingSpinner size="md" />`.
- **Pattern 2 — spinner + text as flex-col siblings, no extra wrapper** (2 files: `app/quotes/[id]/page.tsx`, `app/shipments/[id]/page.tsx`): the spinner's own `mb-4`/sibling `<p>` are replaced by `LoadingSpinner`'s built-in `text` prop — `<LoadingSpinner size="md" text="Loading quote details..." />` / `<LoadingSpinner size="md" text="Loading shipment details..." />` — dropping the now-redundant `flex-col` from the outer wrapper (kept: `flex items-center justify-center min-h-[400px] min-w-0`) since `LoadingSpinner` already lays out its own column internally.
- **Pattern 3 — spinner + text inside a nested `text-center` sub-wrapper** (3 files: `app/orders/create/page.tsx`, `app/orders/[id]/lines/[lineId]/page.tsx`, `app/proposals/[id]/lines/[lineid]/page.tsx`): the inner `<div className="text-center">` wrapper (which existed only to center the old raw spinner + text pair) is removed entirely; `<LoadingSpinner size="md" text="..." />` renders directly inside the outer sizing wrapper.
- **Pattern 4 — spinner inside a larger loading-skeleton block** (1 file: `app/proposals/[id]/page.tsx`): only the spinner `<div>` itself is replaced with `<LoadingSpinner size="md" />`; the sibling `animate-pulse` skeleton block and the outer `opacity-60` wrapper are left completely untouched.

**Rationale**: `LoadingSpinner`'s own markup (`flex flex-col items-center justify-center py-12`) already handles centering, column layout, and optional text — preserving redundant wrapper markup that duplicates this would leave dead weight; wrapper markup that does something `LoadingSpinner` doesn't (page-level sizing via `min-h`/`h-*`) is kept since removing it would change the loading state's footprint on the page.

**Alternatives considered**: Leaving every existing wrapper untouched and only ever swapping the innermost spinner div, even where this leaves a redundant now-unnecessary sub-wrapper (Pattern 3) — rejected; the whole point of consolidation is a clean, consistent result, not the minimum possible diff.

## 3. Tab-panel loading spinners (US2) — per-file treatment

**Decision**: For each of the 10 files, replace the raw `<div className="animate-spin ...">` with `<LoadingSpinner size="sm" />` (or with the `text` prop where a label exists):

- `app/products/[id]/components/ComplianceCertsTab.tsx`, `app/products/[id]/components/DatasheetsTab.tsx`: each has a `<p className="mt-2 text-sm text-gray-500">Loading .../...</p>` sibling — migrate to `<LoadingSpinner size="sm" text="Loading certifications..." />` / `text="Loading datasheets..."`, removing the now-redundant `col-span-full py-12 text-center` wrapper's centering duties (kept: enough of the wrapper to preserve `col-span-full` grid placement).
- `app/products/[id]/components/EditProductTabs.tsx` (2 occurrences, lines ~525 and ~578): both currently `border-blue-600` (off-brand) with no text label — replace each with `<LoadingSpinner size="sm" />`, automatically correcting the color.
- `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, `app/supplier-bills/[id]/lines/[lineid]/page.tsx` (Bucket B occurrence — each of these 2 files also has a separate Bucket A occurrence elsewhere in the same file): bare spinner, no text — replace with `<LoadingSpinner size="sm" />`, wrapper unchanged.
- `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`, `QuoteLinePurchasesTab.tsx`, `QuoteLineReturnsTab.tsx`: bare spinner, no text, identical `flex justify-center py-12` wrapper — replace with `<LoadingSpinner size="sm" />`, wrapper unchanged.
- `components/ui/DataTable.tsx`'s `TableLoadingState`: currently lays spinner + optional `message` out horizontally (`ml-3` inline `<span>`); migrate to `<LoadingSpinner size="sm" text={message} />`, which stacks spinner+text vertically — this changes the loading row's internal layout from horizontal to vertical, a deliberate unification onto `LoadingSpinner`'s one text-treatment rather than a 2nd horizontal variant.
- `app/home/page.tsx`: an absolute-positioned semi-transparent overlay (background dashboard refresh, not a full-page first-load) with `border-blue-600` (off-brand) and a `"Updating dashboard..."` label — replace the inner `flex flex-col items-center gap-2` block with `<LoadingSpinner size="sm" text="Updating dashboard..." />`, automatically correcting the color; the outer absolute-overlay div is untouched.

**Rationale**: Same reasoning as US1 — reuse `LoadingSpinner`'s built-in text handling where a label exists, remove wrapper markup that only duplicated centering/text-below-spinner layout, keep wrapper markup that serves a distinct structural purpose (`col-span-full` grid placement, the absolute-overlay positioning).

**Alternatives considered**: Keeping `DataTable.tsx`'s horizontal spinner+message layout and only changing its color/size inline — rejected; the entire tab-panel population should read as the same visual language, and `LoadingSpinner`'s vertical text-below-spinner treatment is already the pattern every other Bucket B (and Bucket A) file is converging on.

## 4. Scope boundary — what's explicitly NOT touched

**Decision**: Inline button/icon spinners (~25+ occurrences: save-button spinners, the 8 near-identical FilesTab upload spinners, refresh-icon spinners) are left completely untouched.

**Rationale**: Confirmed via direct read that none of these share `LoadingSpinner`'s shape (a centered, padded, column-layout block with optional text below) — they're small, inline elements sitting next to or inside other controls. Forcing them onto `LoadingSpinner` would require building the component into something it isn't; a proper fix for that population needs a different, purpose-built small inline-spinner primitive, scoped as its own initiative.

**Alternatives considered**: Extending `LoadingSpinner` with an "inline" variant to also cover this population in the same spec — rejected as scope creep; the spec's own investigation and the user's explicit scoping decision drew this line before planning began.
