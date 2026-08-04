# Research: Admin-Portal Polish

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Sync-run status → shared StatusBadge (US1)

**Decision**: In `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`, import `StatusBadge` from `@/components/ui/StatusBadge` and replace the raw `<span className={`font-medium ${run.status.startsWith('completed') ? 'text-green-600' : run.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>{run.status}</span>` (line 662) with `<StatusBadge status={run.status} variant="compact" />`. In `components/ui/StatusBadge.tsx`, add `case "completed_with_errors":` alongside the existing `case "completed":` in the green-color bucket (no other vocabulary changes).

**Rationale**: Confirmed via codebase-wide `grep` that `completed_with_errors` is a real, distinct status value (used by the sync-run type union in this same file, and produced by `lib/product-load-service.ts:225` and `lib/product-index-service.ts:350`), and does not collide with any other status string used anywhere else in the app's status vocabulary. `StatusBadge` already has a `case "completed":` (green) and `case "failed":` (red) — adding `completed_with_errors` to the same green bucket as `completed` exactly preserves the current raw-span logic's behavior (`status.startsWith('completed')` matches both `"completed"` and `"completed_with_errors"` today). Any other status value (e.g. `"running"`) falls through to `StatusBadge`'s existing `default:` gray case, identical to the raw span's `text-gray-500` fallback today. The `compact` variant (`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium`) matches the raw span's small, inline, non-bordered presentation more closely than `bordered` or `pill`.

**Alternatives considered**: Mapping `completed_with_errors` to a distinct color (e.g., yellow/orange, to visually distinguish "succeeded with some failures" from "fully succeeded") — rejected for this feature; that would be a behavior *change*, not a consistency migration, and is a separate semantic-accuracy improvement outside this feature's scope (which is explicitly to preserve current visual behavior while gaining shared-component consistency). Leaving the raw span as-is — rejected; it's a hand-rolled duplicate of exactly the logic `StatusBadge` already centralizes, on a page that already imports Heroicons and other shared conventions.

## 2. Organization Detail heading weight (US2)

**Decision**: Change `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx:308`'s `<h1>` className from `text-2xl font-bold text-gray-900 dark:text-white` to `text-2xl font-semibold text-gray-900 dark:text-white` — a single-token change (`font-bold` → `font-semibold`), matching `app/(admin-portal)/admin-portal/organizations/page.tsx:93` exactly.

**Rationale**: Confirmed via direct read that both headings are `text-2xl` at the identical structural position (top of their respective page's content, paired with a one-line description directly beneath) — the same conceptual heading tier within the same page family, differing only in weight for no apparent reason.

**Alternatives considered**: Changing List's heading to `font-bold` instead (converging the other direction) — rejected; List is the entry point a Super Admin reaches first when navigating this section, so keeping its existing weight and bringing Detail in line prevents introducing a new, larger visual change to the more-frequently-seen page.

## 3. Admin Login decorative icon `aria-hidden` (US3)

**Decision**: Add `aria-hidden="true"` to all 4 of `app/(admin-portal)/admin-login/page.tsx`'s decorative icons: `ShieldCheck` (line 54), `Mail` (line 71), `Lock` (line 86), `ArrowRight` (line 104).

**Rationale**: Confirmed via direct read that none of the 4 currently has `aria-hidden`; each sits directly beside an already-labeled element (the heading text, the labeled email/password inputs, and the button's own visible "Sign In"/"Validating..." text) — the icons carry no independent information a screen reader needs to announce separately.

**Alternatives considered**: Adding descriptive `aria-label`s to the icons instead of hiding them — rejected; these are purely decorative accents next to already-labeled content, not standalone interactive controls, so `aria-hidden="true"` (removing them from the accessibility tree entirely) is the correct pattern, not a label.

## 4. Scope boundary — what's explicitly NOT touched

**Decision**: The indigo/purple/amber action-button color scheme on Organization Detail/Create (Load Products/Index Products/Retry Indexing buttons) is left completely untouched. No other Admin-Portal page is touched.

**Rationale**: Whether these distinct semantic action colors are an intentional convention (each action type gets its own recognizable hue) or should consolidate onto the `primary` token is a genuine open judgment call requiring a separate decision, not a confirmed defect — unlike this feature's 3 fixes, which are each an unambiguous mismatch (duplicate logic, weight drift, missing a11y attribute).

**Alternatives considered**: Including the action-button color question as a 4th user story — rejected; it doesn't meet this feature's bar of "confirmed genuine defect," and forcing a decision on it here would expand scope well beyond the 3 already-scoped, well-bounded fixes.
