# Data Model: Auth/Landing/Dashboard Route Consolidation

No database, API, or Salesforce data changes. This feature is entirely routing and presentation-layer: which route serves which content, and 2 shared redirect-target string literals.

## Key Entities (from `spec.md`)

- **Dashboard route**: `/home` is the sole real page; `/program360` and `/dashboard` become `next.config.js` redirects to it.
- **Auth entry route**: `/signin` is the sole real sign-in page; `/` and `/auth` become `next.config.js` redirects to it (query string, specifically `return`, forwarded automatically by Next.js's `redirects()` when no path-matching wildcard is used).
- **Redirect-target reference**: the literal string `/auth` as an unauthenticated-redirect destination, currently in 2 files, changed to `/signin` in both.

## Per-file changes

| File | Change |
|---|---|
| `next.config.js` | Add `async redirects()` returning 4 permanent redirects: `/` → `/signin`, `/auth` → `/signin`, `/program360` → `/home`, `/dashboard` → `/home`. |
| `app/page.tsx` | Delete. |
| `app/auth/page.tsx` | Delete. |
| `app/auth/layout.tsx` | Delete (discovered during implementation, not in original file inventory — a 3rd independent force-light-mode mechanism, a `MutationObserver`-based Next.js layout scoped only to the `/auth` route; correctly removed as a consequence of deleting the whole `app/auth/` directory, since Next.js layouts are directory-scoped with no other consumers by construction). |
| `app/program360/page.tsx` | Delete. |
| `app/dashboard/page.tsx` | Delete. |
| `components/ForceLightMode.tsx` | Delete (orphaned once `app/auth/page.tsx` is gone — its only importer). |
| `components/Navigation.tsx` | Delete (already had zero importers before this feature). |
| `middleware.ts` | Change `url.pathname = '/auth'` → `url.pathname = '/signin'` in `isProtectedRoutePath`'s redirect branch. |
| `components/ProtectedPageWrapper.tsx` | Change `router.push('/auth')` → `router.push('/signin')`. |
| `components/SignInForm.tsx` | Remove `onToggle` prop from `SignInFormProps` and the function signature; delete the dead, already-commented-out Sign Up button block (lines ~253-258) and the now-fully-unreachable `handleSignUpClick` function. |
| `components/SignUpForm.tsx` | Remove `onToggle` prop from `SignUpFormProps` and the function signature; replace the `handleSignInClick` wrapper's one live call site with an inline `router.push("/signin")` (or keep the named function without the removed prop — implementation's choice, functionally identical), removing the prop from the interface. |
| `hooks/useForceLightMode.ts` (new) | Extract the identical ~10-line light-mode-forcing `useEffect` body currently duplicated in `app/signin/page.tsx` and `app/signup/page.tsx` (and near-duplicated with a bug in `app/forgot-password/page.tsx`). |
| `app/signin/page.tsx` | Replace inline `useEffect` with a call to `useForceLightMode()`. |
| `app/signup/page.tsx` | Replace inline `useEffect` with a call to `useForceLightMode()`. |
| `app/forgot-password/page.tsx` | Replace inline `useEffect` with a call to `useForceLightMode()`; fix wrapper `className` from `"min-h-screen  text-primary light forced-light"` to `"min-h-screen text-gray-800 light forced-light"`. |

## Verification checklist derived from this model

- No remaining `import` of `ForceLightMode` or `Navigation` anywhere in `app/`/`components/`.
- No remaining reference to the literal path `/auth` as a redirect destination in `middleware.ts` or `components/ProtectedPageWrapper.tsx`.
- No remaining `onToggle` prop usage in `SignInForm.tsx`/`SignUpForm.tsx`'s prop interfaces or call sites.
- Exactly one implementation of the force-light-mode effect (`hooks/useForceLightMode.ts`), used by exactly 3 pages.
