# Phase 0 Research: Quick Wins & Dead Code Cleanup

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation (a dedicated Explore sub-agent pass plus follow-up direct verification) that grounded the plan, including two places where the original audit's claims did not hold up as originally written.

## 0. Two corrections to the original audit's claims

**Line drift**: `w-70` was cited by the audit at `ConfigureOrderClientPage.tsx:691`; the current location is `:731`. Confirmed by direct read — the file has grown since the audit was written, not a different bug.

**Wrong assumed root cause**: the audit treated Inventory's "Average Aged" stat card purely as a "looks clickable, isn't" affordance bug, implying the fix is cosmetic (strip the fake hover/arrow styling). Direct investigation of `app/inventory/page.tsx` found this is incomplete: `inventoryData["Average Aged"]` is a real array, already returned by the page's existing data source, already used to compute the card's own displayed statistics (`stats.avgDaysAged`, `stats.agedTotalValue`). It is structurally identical to `inventoryData["Put-Away"]` and `inventoryData["Products On Hold"]`, both of which already power working filter cards. The only actual gap is that `TabFilter` (`"All" | "On Hold" | "Put-Away"`) and the `rawRecords` selection `if/else` chain never got a 4th branch, and the card itself was never converted from a `<div>` to a `<button>` like its siblings. This changes the fix from "strip the affordance" to "finish wiring up a filter whose data already exists" — a small, real feature completion, not a cosmetic downgrade.

## 1. Invalid Tailwind classes — exact current locations

| Class | File:Line | Fix | Why it's currently a no-op |
|---|---|---|---|
| `PX-3 Py-2` | `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx:152` | `px-3 py-2` | Tailwind utility matching is case-sensitive; `PX-3`/`Py-2` don't exist as generated classes, so zero padding is applied today. |
| `w-70` | `app/configure/ConfigureOrderClientPage.tsx:731` | `w-72` | Not a token in Tailwind's default spacing scale (which has `w-64`, `w-72`, `w-80`, nothing at `70`) or this repo's `tailwind.config.ts` (confirmed no custom scale extension). Silently dropped; the dropdown panel's width today comes from its content and other classes alone. |
| `min-w-200px` (×2, same card) | `app/products/ProductClientPage.tsx:571` and `:577` | `min-w-[200px]` | Missing the arbitrary-value bracket syntax Tailwind requires (`min-w-[200px]`); as written it doesn't match any utility and is dropped. |
| `text-base text-sm` | `app/products/ProductClientPage.tsx:571` (same line as one `min-w-200px` hit) | Drop `text-sm`, keep `text-base` | Both classes are individually valid, so both generate CSS — but they set the same property (`font-size`) on the same element, and whichever rule is later in Tailwind's generated stylesheet order wins regardless of the classes' order in the JSX string. This is fragile (not "obviously" resolvable by reading the markup) and clearly unintentional on a product-name `<h3>` sitting directly above a `text-sm` description `<p>` — the two should be visually distinct sizes, which only holds if the contradiction is removed. |
| `w-22` (new finding, not in original audit) | `app/orders/[id]/OrderClientPage.tsx:1948` | `w-24` | Same bug class as `w-70` — `22` isn't in the default scale (`w-20`, `w-24`, `w-28`...). Found via a broader re-grep across `app/` for the same "invalid spacing scale number" pattern while verifying the audit's 4 named items, confirming the audit's list wasn't exhaustive even for this one bug class. |

No other case-typo'd utility prefixes (`Bg-`, `Text-`, etc.) or malformed arbitrary-value patterns were found in a full-repo re-grep beyond the 5 above.

## 2. Confirmed-dead files

Both confirmed via full-repo grep for their filenames/exports — zero incoming references beyond the file's own internal/self-referential content:
- `app/configure/configure.css` (740 lines; only match is the file's own header comment).
- `app/quotes/[id]/components/QuoteScopeSummary.tsx` (exports `QuoteScopeSummary`; only matches are its own internal self-references).

## 3. Lowercase filename — blast radius

`app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx` has exactly **one** importer: `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, which already imports it under the correct PascalCase *identifier* name (`import POSerialNumberLogLinesTab from "./components/poserialnumberloglinestab";`) — only the file path string needs updating after the rename, not the imported name itself. Used once in that file's JSX (one line). All 4 sibling files in the same directory (`PODebitMemoLinesTab.tsx`, `POReturnsTab.tsx`, `PORtvLinesTab.tsx`, `POSupplierBillLinesTable.tsx`) already use PascalCase, confirming this file is the sole outlier.

## 4. Dead/miswired interactive elements — current code and chosen treatment

**Reports "Generate Report"** (`app/reports/page.tsx`): a plain `<button>` with no `onClick`/`disabled`, directly above a `<p>` reading "Reports page coming soon...". Repo-wide grep for report-generation-related API routes or services found none. Treatment: add a `disabled` state (dimmed styling, `cursor-not-allowed`) — matching the audit's own suggested "disable with tooltip or remove," and the same judgment call this series already made for spec 083's "Pay Now" button (no fake wiring for a feature with no backend, but don't delete a placeholder that reads as intentionally-future rather than abandoned).

**Inventory "Average Aged" card** (`app/inventory/page.tsx`): see §0 above for the corrected root-cause finding. Exact current pieces to change:
- `type TabFilter = "All" | "On Hold" | "Put-Away";` (line 16) → add `"Average Aged"`.
- The `rawRecords` `if/else` chain (lines ~81-83) → add `else if (activeTab === "Average Aged") rawRecords = inventoryData["Average Aged"] || [];`.
- The Card 2 wrapper (lines ~419-452), currently a plain `<div className="group relative ... hover:shadow-lg ...">` with zero `onClick` → convert to `<button onClick={() => handleCardClick("Average Aged")} className={... active-state ternary matching Card 1's exact pattern ...}>`, since `handleCardClick` (lines 335-338) already does exactly `setActiveTab(filter); setCurrentPage(1);` and needs no change itself.
- The compact/mobile pill-filter row (line ~569-580, `(["All", "On Hold", "Put-Away"] as TabFilter[]).map(...)`) → add `"Average Aged"` to the array so the mobile view stays in sync with the stat cards.

**Purchase Order list eye icon** (`app/purchase-orders/page.tsx`): the button (lines ~401-406, inside a `<Td>`) has no `onClick`; the enclosing `<Tr>` also has no row-level click handler — only the row's individual `Link`-wrapped cells (PO#, quote, proposal, order, each already calling `e.stopPropagation()`) navigate anywhere. There is also a header cell `<Th>Action</Th>` (line 330) and a matching `actions: 100` entry in the page's column-width configuration (line 54) — since the icon is the column's only content, the fix removes the entire column (header, body cells, and width-config entry), not just the button, to avoid leaving a permanently-empty column.

## 5. Shipment Detail's dead "tracking" tab — confirmed distinct from the working modal

`app/shipments/[id]/components/ShipmentTabs.tsx` defines `ShipmentTabId = "lines" | "inventory" | "serial" | "files" | "tracking"` and a `counts` prop with a `tracking?: number` field, but its rendered `TAB_DEFS` array (the actual tab-bar UI) only lists `lines`/`inventory`/`serial`/`files` — `"tracking"` is never offered as a clickable tab, so `app/shipments/[id]/page.tsx`'s `{activeTab === "tracking" && <TrackingTimelineTab trackingData={trackingData} />}` (line 202) can never execute.

**Confirmed distinct from the working feature**: `app/shipments/[id]/components/ManifestSummary.tsx` already has its own, fully-reachable "Track Timeline" button that opens `TrackingTimelineModal` (migrated in spec 087) — a separate, working, modal-based presentation of the same underlying `trackingData`. The dead in-page tab was an earlier, superseded implementation of the same idea, left behind after the modal replaced it, not a partially-built duplicate of a still-needed feature.

**What must NOT change**: `trackingData` state and its fetch effect in `page.tsx` (lines ~44, ~107) are used by both `TrackingInfo` (line 171) and, via `ManifestSummary`, the working modal — only the dead render branch (line 202) and the `PlaceholderTabs` import (line 18) are removed from `page.tsx`; the state/fetch logic itself is untouched.

**Deletion safety**: `app/shipments/[id]/components/PlaceholderTabs.tsx` exports exactly one symbol, `TrackingTimelineTab` (a module-private `EmptyTab` helper is not exported). Once `page.tsx`'s import and dead branch are removed, this file has zero remaining callers anywhere in the repo — confirmed via repo-wide grep for both `PlaceholderTabs` and `TrackingTimelineTab`.

## 6. Dropped from scope — already fixed

The audit's item 17.9 ("Shipment Line Detail: Status pill hardcoded green regardless of status," citing `bg-[#E5F1E5] text-[#2E7A2E]`) no longer matches the current code. `app/shipments/[id]/lines/[lineid]/page.tsx` now reads `<StatusBadge status={product.Status__c || "Draft"} variant="compact" />` — the exact shared-component routing the audit itself recommended. This was evidently already covered by spec 084's StatusBadge consolidation pass; no action needed here.
