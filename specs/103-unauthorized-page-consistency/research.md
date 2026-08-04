# Research: Unauthorized Page Consistency

All findings below are grounded in a direct read of `app/unauthorized/page.tsx` before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Dark-mode support (US1)

**Decision**: Add `dark:` variants to every colored element in `app/unauthorized/page.tsx`:
- Outer `<div>` (line 4): `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- Card `<div>` (line 5): `bg-white` → `bg-white dark:bg-gray-800`
- "403" numeral (line 6): `text-red-500` → `text-red-500 dark:text-red-400`
- Heading (line 7): `text-gray-800` → `text-gray-800 dark:text-white`
- Body text (line 8): `text-gray-600` → `text-gray-600 dark:text-gray-400`

**Rationale**: Confirmed via direct read that none of the page's 5 colored elements has any `dark:` class today. Each pairing above is the exact, already-proven-correct convention used identically across dozens of other pages in this app (e.g. `bg-white dark:bg-gray-800` for cards, `text-gray-900`/`800 dark:text-white` for headings, `text-gray-500`/`600 dark:text-gray-400` for body text, `bg-gray-50 dark:bg-gray-900` for page backgrounds) — no new dark-mode token is invented.

**Alternatives considered**: Inventing a distinct dark palette for this one page — rejected; consistency with the rest of the app is the entire point, and the standard pairings already exist and are proven.

## 2. "Back to Home" button color (US2)

**Decision**: Change the button's className (line 13) from `bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors truncate` to `bg-primary text-white rounded-md hover:bg-primary-dark transition-colors truncate`.

**Rationale**: Confirmed via direct read that this button uses a generic Tailwind `blue-600`/`blue-700` pair with no basis in `tailwind.config.ts`, the same class of off-brand-button-color defect already fixed on Products' "Add to Order" button and Admin Login's submit button in spec `097`. `bg-primary`/`bg-primary-dark` is the app's actual documented brand token pair.

**Alternatives considered**: None — this is a single, unambiguous color-token correction with a directly-confirmed reference pattern (spec `097`'s precedent) already established in this same repo.

## 3. Scope boundary — ErrorMessage rebuild declined

**Decision**: `app/unauthorized/page.tsx` keeps its own bespoke layout (centered card, large "403" numeral, heading, description, single link-styled CTA). It is not rebuilt onto `components/ui/ErrorMessage.tsx`.

**Rationale**: Confirmed via direct read of `ErrorMessage.tsx` that its shape is a small `title` + `message` + optional `onRetry` button block, designed to sit inline within an otherwise-normal page (e.g., a failed data fetch on a list page) — it has no slot for a large numeral display, and its optional action is specifically a *retry* button, not a navigation link. Unauthorized's actual content (a full-page 403 landing with a real "Back to Home" navigation link, no retry-able operation) doesn't map onto that shape without losing the numeral or mischaracterizing the CTA as a retry action.

**Alternatives considered**: Extending `ErrorMessage` with new optional props (a numeral slot, a navigation-link variant) to accommodate this one page — rejected as premature abstraction (Constitution Principle V, YAGNI); `ErrorMessage` is used by several other pages for its current, narrower inline-error purpose, and growing its API for a single full-page use case it wasn't designed for is a larger change than this feature's actual scope (2 confirmed color-token defects).
