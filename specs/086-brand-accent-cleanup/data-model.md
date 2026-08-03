# Data Model: Brand Accent Color Cleanup

No database, API, or data-fetching changes. This feature only changes Tailwind className color tokens on already-rendered elements — no new components, no logic changes.

## Color mapping reference

| Off-brand class | Replacement | Basis |
|---|---|---|
| `indigo-600` (bg/text) | `primary` | Direct brand-color equivalent |
| `indigo-700` (hover) | `primary-dark` | Established hover convention |
| `indigo-400`/`indigo-300` (dark mode text) | `primary` (token already has dark-mode-safe usage elsewhere) or `primary-light` where a lighter tone reads better | Matches existing dark-mode-aware `primary` usage app-wide |
| `indigo-100`/`indigo-900` (badge bg) | `primary/10` / `primary/20` | Established badge-tint convention |
| `indigo-500` (focus ring) | `primary` | Established focus-ring convention |
| `blue-500` (Search input focus ring) | `primary` | Same-page consolidation (bonus find) |
| `purple-500`/`purple-600`/`purple-50`/`purple-100`/`purple-200`/`purple-900` | `primary` / `primary-dark` / `primary/10` family | Direct brand-color equivalents |
| `orange-500`/`amber-600` (gradients, CTAs, focus rings) | `primary` / `primary-dark` | Direct brand-color equivalents, matching `app/orders/page.tsx:605`'s gradient convention |
| `orange-50`/`amber-50` (section backgrounds) | `primary-light` / `primary/10` | Established light-background convention |
| `#A7C7E7` / `#8FB8DE` (hardcoded hex) | `bg-primary` / `hover:bg-primary/90` | Exact token replacement — 4 sibling files already do this |
| `#E8F1FC` (hardcoded hex) | `bg-primary-light` | Nearest existing token to the original hex |
| `#9BB8F4` (hardcoded hex) | `bg-primary/40` | Nearest brand-family shade preserving the two-tone panel/box relationship |

## Per-file changes

| File | Lines | Change |
|---|---|---|
| `app/search/SearchClientPage.tsx` | 74, 82, 86, 104, 117, 128, 202, 234, 247, 265, 288, 291, 316, 319 | Replace all `indigo-*` and the one `blue-500` occurrence with `primary`-family equivalents (User Story 1) |
| `app/configure/ConfigureOrderClientPage.tsx` | 693, 729, 760, 761, 841, 852 (purple), 834, 846 (indigo, bonus find) | Replace all purple + adjacent indigo group-feature styling with `primary`-family; swap `lvColors`' purple entry for a `primary`-family entry (User Story 2) |
| `app/admin/organizations/page.tsx` | 228, 239, 256, 270, 301, 308, 314, 321, 335, 341, 347, 353, 366, 372, 387, 434, 452, 459, 491, 496, 520, 538, 557, 637, 679, 680, 682, 694 | Replace all orange/amber/indigo/purple occurrences with `primary`-family equivalents, copying `app/admin/authorize-locations/page.tsx`'s established patterns (User Story 3) |
| `app/admin/page.tsx` | 20-21 | Replace orange icon-bubble with `bg-primary/10 dark:bg-primary/20` + `text-primary` (User Story 3) |
| `app/invoices/[id]/lines/[lineid]/page.tsx` | 236 | Replace hex "Back" button with `bg-primary`/`hover:bg-primary/90` (User Story 4) |
| `app/shipments/[id]/lines/[lineid]/page.tsx` | 190 | Same (User Story 4) |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | 358 | Same (User Story 4) |
| `app/admin/authorize-locations/[id]/delivery-windows/page.tsx` | 250 | Same (User Story 4) |
| `app/products/[id]/components/ProductGallery.tsx` | 59, 71 | Replace hex backgrounds with `bg-primary-light` and `bg-primary/40` respectively (User Story 5) |

## Explicitly unchanged (out of scope, confirmed legitimate)

| Location | Color(s) | Why unchanged |
|---|---|---|
| `app/(admin-portal)/*` | indigo, blue gradients | Intentionally independent internal-tool system (user decision) |
| `components/ui/StatusBadge.tsx` | purple, indigo (2 of ~13 status cases) | Deliberate semantic status-color system |
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`, `.../create/page.tsx` | indigo, purple, emerald | Deliberate sequential-step action color code; file's real CTAs already use `primary` |
| `app/home/page.tsx` | purple (Quotes tile) | Categorical per-section tile color scheme |
| `POFilesTable.tsx`, `SupplierBillFilesTable.tsx`, `SBLFilesTab.tsx`, `FilesTab.tsx`, `QuoteFilesTab.tsx` | purple, amber (file-type icons) | Deliberate document-type color convention |
| `EditProductTabs.tsx`, `Toast.tsx`, various list-page stat tabs | orange, amber | Legitimate semantic status/warning/pending indicators |
| `KeyDates.tsx`, `ProposalDetails.tsx`, `PODetails.tsx` | purple/amber icon-container mismatches | Different defect class (icon pairing), deferred to a future spec |
