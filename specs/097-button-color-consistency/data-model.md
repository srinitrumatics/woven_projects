# Data Model: Button Color Consistency

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact className changes per file.

## "Add to Order" color fix (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/products/[id]/components/ProductInfoCard.tsx:93` | "Add to Order" `<button>` | `bg-blue-600 hover:bg-blue-700` | `bg-primary hover:bg-primary-dark` |
| `app/products/[id]/components/AddToOrderModal.tsx:216` | "Create Order" `<button>` | `bg-blue-600 hover:bg-blue-700 ... shadow-lg shadow-blue-500/20` | `bg-primary hover:bg-primary-dark ... shadow-lg` |
| `app/products/[id]/components/AddToOrderModal.tsx:225` | "Add to Order" `<button>` | `bg-blue-600 hover:bg-blue-700 ... shadow-lg shadow-blue-500/20` | `bg-primary hover:bg-primary-dark ... shadow-lg` |

Disabled state (`disabled:bg-gray-400 disabled:cursor-not-allowed`), sizing, radius, and font-weight are unchanged on all 3. Reference (already correct, unchanged): `app/products/ProductClientPage.tsx:597` catalog card's "Add to Order" button — `bg-primary hover:bg-primary-dark`.

## Admin Login token alignment (US2)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-login/page.tsx:53` | Icon bubble | `bg-gradient-to-br from-blue-500 to-indigo-600` | `bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]` |
| `app/(admin-portal)/admin-login/page.tsx:71` | Mail icon focus color | `group-focus-within:text-blue-500` | `group-focus-within:text-[var(--primary)]` |
| `app/(admin-portal)/admin-login/page.tsx:77` | Email `<input>` | `rounded-2xl ... focus:ring-blue-500/40 focus:border-blue-500` | `rounded-md ... focus:ring-[var(--primary)] focus:border-transparent` |
| `app/(admin-portal)/admin-login/page.tsx:86` | Lock icon focus color | `group-focus-within:text-blue-500` | `group-focus-within:text-[var(--primary)]` |
| `app/(admin-portal)/admin-login/page.tsx:92` | Password `<input>` | `rounded-2xl ... focus:ring-blue-500/40 focus:border-blue-500` | `rounded-md ... focus:ring-[var(--primary)] focus:border-transparent` |
| `app/(admin-portal)/admin-login/page.tsx:101` | Submit `<button>` | `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500` | `bg-[var(--primary)] hover:bg-[var(--primary-dark)]` |

Reference (unchanged, the target pattern being matched): `components/SignInForm.tsx:154,172` (input fields — `rounded-md`, `focus:ring-[var(--primary)] focus:border-transparent`), `SignInForm.tsx:213` (submit button — `bg-[var(--primary)] hover:bg-[var(--primary-dark)]`), `SignInForm.tsx:233` (the `from-[var(--primary)] to-[var(--primary-dark)]` gradient pair, reused for the icon bubble).

## Explicitly unmodified elements

| Element | File | Reason |
|---|---|---|
| Page layout (centered single-card shell) | `app/(admin-portal)/admin-login/page.tsx:44,51` | Intentional architectural difference from `/signin` — two separate auth systems, per `CLAUDE.md` |
| Decorative background blur blobs | `app/(admin-portal)/admin-login/page.tsx:47-48` | Not named in this feature's functional requirements; low-opacity ambient decoration, not a semantic-action color |
| Submit button shape (`rounded-2xl`) | `app/(admin-portal)/admin-login/page.tsx:101` | FR-005 names only the icon bubble and input fields for shape correction, not the button |
| Orders' "Cancel"/"Save Draft" vs. "Clone" button styles | `app/orders/[id]/OrderClientPage.tsx`, `app/orders/[id]/components/OrderHeader.tsx` | Investigated and found to be a reasonable secondary-action-tier distinction between two UI regions, not a genuine mismatch |

## Key Entities

- **Add to Order action**: The single semantic "add this product to the current order" action, rendered at 3 independent call sites that should share one brand color.
- **Admin Login token family**: The button/icon-bubble/input color and shape tokens on `/admin-login`, aligned onto `/signin`'s equivalent tokens while the two pages' surrounding layouts remain independently structured.
