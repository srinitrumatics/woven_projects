# Phase 0 Research: Shared Status Badge Component

## 1. A shared component already exists — extend it, don't create a new one

**Decision**: Extend `components/ui/StatusBadge.tsx` (which already exports `StatusBadge` and an unrelated `RemittanceBadge`) rather than creating a new file.

**Rationale**: Direct codebase search (`grep -rn "import.*StatusBadge"`) found 10 files already importing `StatusBadge` from `components/ui/StatusBadge.tsx` — mostly Purchase Order and Supplier Bill related-record tables (`POSupplierBillsTable.tsx`, `PODebitMemoTable.tsx`, `POLinesTable.tsx`, `PORTVTable.tsx`, `POSerialNumbersTable.tsx`, `TrackingInformationTab.tsx`, `SupplierBillDebitsTab.tsx`, `SupplierBillLinesTable.tsx`, `SupplierBillPaymentsTab.tsx`, `supplier-bills/[id]/page.tsx`). This file was missed by the original `app/`-only survey (it lives in `components/`). Creating a second "shared" component would defeat the entire point of this feature (FR-001: "exactly one shared function/component").

**Alternatives considered**: Building a brand-new component and migrating the 10 existing consumers too was considered, but rejected — those 10 consumers already work correctly against the existing file; touching them adds risk and file-count for zero benefit. Extending in place means those 10 files need zero changes.

## 2. Two additional real conflicts found between the existing (already-live) mappings and the 34-file survey

**Decision**: Treat the existing shared component's 21 already-live status mappings as the precedent/authority (they're already trusted in production across 10 files) rather than re-running a fresh majority vote that includes them. Two genuine new conflicts surfaced when merging:

| Status | Existing shared component (live, 10 consumers) | 34-file survey (per `spec.md`) | Resolution |
|---|---|---|---|
| `Inactive` | red (grouped with `cancelled`/`no`/`failed`) | gray (from `admin/authorize-locations/page.tsx` only) | **red** — precedent wins, consistent with the same logic already approved by the user for the original 8 conflicts (majority/precedent over an isolated single-file usage). `admin/authorize-locations/page.tsx`'s "Inactive" badge changes from gray to red. |
| `Partial` | yellow (grouped with `pending`/`issued`/`pending approval` — a generic "still in progress" meaning) | blue (only from Invoice's own vocabulary, meaning "partially paid" specifically) | **yellow** — precedent wins. Invoice's "Partial" line status changes from blue to yellow. This is a defensible reading too: a partially-invoiced/partially-paid line is genuinely a "still in progress" state, the same semantic role yellow already plays everywhere else. |

**Rationale**: The user's approved resolution rule for the original 8 conflicts was explicitly "majority/precedent wins." Applying the identical rule consistently to these 2 newly-discovered conflicts (rather than inventing a different rule, or silently picking one) keeps the whole exercise principled and auditable. Both changes are added to the same "pages whose color changes" disclosure already established in `spec.md` FR-005, not hidden.

**Alternatives considered**: Splitting Invoice's payment-lifecycle statuses (`Paid`, `Partial`, `Sent`, `Viewed`, `Overdue`, `Settled`) into the already-existing, separately-scoped `RemittanceBadge` component (which already handles "Partially Paid" as blue) instead of merging them into the generic `StatusBadge` was considered — this would resolve the "Partial" conflict without any color change at all, and arguably matches the *intent* of `RemittanceBadge` better. Rejected for this feature: it would require Invoice's pages to determine, per status, which of two badge components to render (a real logic change, not a pure display consolidation), which goes beyond this feature's explicit scope ("gather all status in one function," and `spec.md`'s assumption that Invoice's vocabulary is preserved as one list). Flagging this as a reasonable follow-up if payment-status semantics ever need to be revisited.

## 3. Case sensitivity

**Decision**: Keep the existing shared component's case-insensitive matching (`status?.toLowerCase()` before the switch). Add all 32 new status cases in lowercase, matching its existing convention.

**Rationale**: All 34 files being migrated pass Title-Case strings (e.g., `"Approved"`, `"Draft"`) directly from Salesforce fields. Case-insensitive matching is a strict superset of case-sensitive matching for these callers — it changes nothing about what currently renders correctly, while adding resilience if a future Salesforce value arrives in a different case.

**Alternatives considered**: Reverting the existing component to case-sensitive matching (to mirror the 34 local duplicates' style) was considered and rejected — it would be a pure downgrade in robustness for no benefit, and risks introducing a regression for any of the 10 existing consumers if their actual data ever varies in casing.

## 4. Structural variant (badge shape)

**Decision**: Add an optional `variant?: 'pill' | 'bordered' | 'compact'` prop to the shared `StatusBadge` component. `'bordered'` remains the default (the existing component's current, unparameterized behavior) so all 10 existing consumers need zero code changes. Of the 34 files being migrated, verified precisely by inspecting every file's actual JSX (not just a regex pass):

- **24 files** use the plain pill shape (`rounded-full`, no border, `font-medium`, `text-sm` — padding varies trivially between `py-0.5`/`py-1`/`py-1.0` and `px-2.5`/`px-3` across a few of them, an existing inconsistency not worth resolving further) → pass `variant="pill"`.
- **9 files** already match the existing component's bordered shape exactly (`rounded-full`, `border`, `text-xs font-bold`) → no `variant` prop needed.
- **1 file** (`app/proposals/[id]/components/ProductsTab.tsx`) uses a third, smaller shape (`rounded` — not fully rounded, `px-2 py-0.5 text-xs font-medium`) and only recognizes 3 statuses via an object-literal `colorMap` rather than a switch statement (a pattern the initial automated survey missed and had to be found by a follow-up grep for `colorMap`). Its 3 statuses (`Active`→green, `Inactive`→red, `Draft`→blue) all already match the merged resolution — this file only reinforces existing decisions, it introduces no new conflict. → pass `variant="compact"`.

**Rationale**: `spec.md` FR-007 explicitly requires preserving existing structural differences rather than forcing pixel-identical shape everywhere. Forcing all 34 files into the existing component's hardcoded bordered style (the simplest possible implementation) would silently change the visual shape of 25 pages that were never asked to change — a real, avoidable regression outside this feature's approved scope.

**`ProductsTab.tsx`'s empty-status dash fallback**: this file returns `<span className="text-gray-400">-</span>` when `status` is falsy, before ever reaching its color logic — different from `shipments/page.tsx`'s `"N/A"` fallback (§5). Per the same caller-resolves-its-own-fallback principle, this file's call site keeps its own `if (!status) return <span className="text-gray-400">-</span>;` guard, calling the shared component only when `status` is truthy.

**Alternatives considered**: A single universal shape (bordered-only, dropping pill/compact support entirely) was considered as the simplest implementation, but rejected precisely because of FR-007. Merging `compact` into `pill` (treating the padding/radius difference as negligible, same as the invoices padding variance) was also considered — rejected because `rounded` vs `rounded-full` is a visibly different shape (subtle rectangle vs. full pill), not just a padding nudge.

## 5. Fallback text for empty/missing status

**Decision**: No change to the shared component's rendering (`{status}`, no built-in "N/A" fallback). Where a caller currently shows `status || "N/A"` (found in `app/shipments/page.tsx`), that fallback is resolved by the caller before passing the prop — i.e. the call site passes `status={status || "N/A"}` to the shared component, rather than the shared component gaining new "N/A"-specific logic.

**Rationale**: Keeps the shared component's API and behavior simple and focused on color-decision + rendering; the "what to show when there's no value" is a caller-specific policy question (some pages might reasonably want "N/A", others might want to not render a badge at all), not something to hardcode into the one shared function.

**Alternatives considered**: Adding a `fallbackLabel` prop to the shared component was considered, but rejected as unnecessary complexity for what's currently a single call site's need — easily handled by the caller with zero API surface added.

## 6. Boolean-based caller

**Decision**: `app/admin/authorize-locations/[id]/delivery-windows/page.tsx` currently calls a locally-defined `StatusBadge({ active }: { active: boolean })`. At this call site, convert to the shared component by passing `status={active ? "Active" : "Inactive"}` — both values are already recognized by the merged status list (see §2 and `data-model.md`).

**Rationale**: Keeps the shared component's public API uniformly string-based (matching all 33 other callers), rather than adding a boolean overload for one caller.

**Alternatives considered**: Adding an `active?: boolean` alternate prop to the shared component was considered and rejected as unnecessary API surface for a single caller that can trivially adapt itself.

## 7. `Badges.tsx` duplicate export — confirmed safe to remove

**Decision**: `app/supplier-bills/[id]/components/Badges.tsx` exports its own local `StatusBadge` (textually identical to 4 other files' bordered-variant copies). Confirmed via `grep -rn "from.*Badges'"` that nothing outside this file imports from it — its export is dead/unused externally. Safe to delete this file's `StatusBadge` (along with the other 33 local duplicates) without needing to update any importer.

**Rationale**: Direct verification, not assumption — avoids silently breaking an import that turned out to exist.

## 8. Survey methodology gap, found and corrected

**Finding**: The initial automated survey (parsing `return "bg-...";` statements following `case` labels) missed `app/proposals/[id]/components/ProductsTab.tsx`, which uses an object-literal `colorMap: Record<string, string>` instead of a switch statement — a structurally different pattern the regex-based parser wasn't built to recognize. It was found by a targeted follow-up `grep -rln "colorMap\s*[:=]"` after manually inspecting a file the automated tool had mis-categorized as "unknown shape." Two other candidate patterns (`getStatusStyles` as a separate exported function, and other `Record<string, string>` object literals) were also checked and confirmed to be either duplicates of already-known data (`getStatusStyles` in `InvoiceHeader.tsx` matches Invoice's already-catalogued vocabulary exactly) or unrelated false positives (a stat-card text-color map, an HTTP request body object).

**Why this matters**: Documented transparently because it's the kind of gap that could otherwise silently produce an incomplete merged status list. All 34 files' actual rendered JSX were subsequently re-verified individually (not just their `case` statements) specifically to catch anything else structurally different — no further gaps found.
