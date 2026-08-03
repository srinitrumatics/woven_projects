# Phase 0 Research: Auth/Landing/Dashboard Route Consolidation

No `[NEEDS CLARIFICATION]` markers remain. Both major scope decisions (dashboard redirect target, auth route survivor) were confirmed with the user before this spec was written, based on the investigation below.

## 1. Program360 / Dashboard — confirmed dead, safe to redirect

**Decision**: Delete `app/program360/page.tsx` and `app/dashboard/page.tsx`; add permanent redirects to `/home` via `next.config.js`'s `redirects()` (currently absent — the file only has `headers()`).

**Investigation**: `diff app/home/page.tsx app/program360/page.tsx` shows exactly 3 differing lines: the exported function name, the `lg:grid-cols-5` vs `lg:grid-cols-6` quick-actions grid (5 real items — Program360's `-cols-6` leaves a visible gap, the exact bug the audit described), and the `isManufacturer` computation. A codebase-wide grep for `isManufacturer\s*=` found **28 other files** using the identical pattern Home uses (`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '')`); Program360's version (`selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'manufacturer' || user?.role?.toLowerCase() === 'manufacturer'`) is the sole outlier app-wide — confirming it's drift/a bug, not a deliberate distinct definition worth preserving. Neither `/program360` nor `/dashboard` appears in `components/layouts/Sidebar.tsx`'s nav list, nor in `middleware.ts`'s `protectedRoutes` array — both are unreachable via any in-app navigation and not even auth-protected today. `app/dashboard/page.tsx` (129 lines) has zero data-fetching — every stat is a literal hardcoded string (`"24"`, `"8"`, etc.).

**Rationale**: Since neither route is linked or protected, a redirect closes the dead-code/latent-bug surface with zero risk to any real observed user flow.

**Alternatives considered**: Fixing Program360's `isManufacturer` bug and grid class in place, keeping both pages — rejected; there is no reachable path to either page today, so maintaining two more files with drift-prone duplicate logic serves no purpose the single `/home` page doesn't already serve.

## 2. `/` and `/auth` — confirmed dead toggle, redirect to `/signin`

**Decision**: Delete `app/page.tsx` and `app/auth/page.tsx`; add permanent redirects to `/signin` (preserving query string) via `next.config.js`. Update the 2 files that currently redirect unauthenticated users to `/auth` — `middleware.ts` and `components/ProtectedPageWrapper.tsx` — to target `/signin` instead.

**Investigation**: Both `/` and `/auth` render an `isSignUp`-gated slide (`translateX` transform) between `SignInForm` and `SignUpForm`, passing an `onToggle` callback to each. Direct inspection of both form components found:
- `SignInForm.tsx`: the "Sign Up" button that would call `handleSignUpClick` (→ `router.push("/signup")`) is **entirely commented out** (lines 253-258) — there is no live control anywhere in the rendered SignInForm to reach Sign Up, and `onToggle` is never referenced in the component body at all (accepted as a prop, never called).
- `SignUpForm.tsx`: the "Sign In" button IS live and calls `handleSignInClick` (→ `router.push("/signin")`) — a full navigation away, not a call to the `onToggle` prop it also accepts and never uses.
- Since `isSignUp` starts `false` and nothing in either component can ever set it `true` (the only thing that could, `onToggle`, is dead), `/` and `/auth` can only ever show the SignIn half in practice, and that half has no working way to reach Sign Up at all.

This means `/` and `/auth` are not just redundant with `/signin`/`/signup` — they are actively **more broken**, since their Sign Up path doesn't render a button. `/signin` and `/signup` are already confirmed as the actual, working, real destinations: `SignUpForm.tsx` navigates to `/signin`, `SignInForm.tsx`'s "Forgot Password" link and `ForgotPasswordForm.tsx`'s own back-link both reference `/signin`, and both routes already function as complete standalone pages.

`middleware.ts`'s `isProtectedRoutePath` gate redirects unauthenticated users to `/auth?return=<path>` (query string built manually). `components/ProtectedPageWrapper.tsx` (the client-side gate wrapping pages that need `ProtectedPageWrapper`) does a bare `router.push('/auth')` with no return param. Both need their literal `/auth` target changed to `/signin`; `SignInForm.tsx` already reads `searchParams?.get('return')` itself, so the return-URL behavior is preserved automatically once middleware points at `/signin` instead.

**Rationale**: `/signin`/`/signup` require touching only 2 external redirect-target files (`middleware.ts`, `ProtectedPageWrapper.tsx`) to become the sole canonical entry points, versus fixing `/`/`/auth`'s dead toggle (which would require adding a real Sign Up button to `SignInForm.tsx`, wiring `onToggle` correctly in both forms, and touching the same 2 redirect files anyway to decide which of `/auth`/`/signin` survives) — smaller, lower-risk change for an identical end-user outcome.

**Alternatives considered**: Fixing the toggle so `/`+`/auth` become the single working entry point instead — rejected per the user's explicit choice; also higher-risk since it requires *adding* functionality (a real Sign Up affordance) to a component whose current commented-out state suggests a deliberate, if undocumented, prior decision to disable it.

## 3. `ForceLightMode.tsx` and `Navigation.tsx` — orphaned once `/auth` is removed

**Decision**: Delete both files.

**Investigation**: `ForceLightMode.tsx` (107 lines) is imported only by `app/auth/page.tsx` — 2 `MutationObserver`s plus a perpetual 100ms `setInterval`, the heaviest of the app's several duplicate force-light-mode mechanisms. Once `/auth` is deleted, this becomes fully dead code. `Navigation.tsx` (the WOVN-branded marketing nav bar, the one referenced by the original audit as "unused anywhere") was independently confirmed via codebase-wide grep to have **zero importers already, before this feature** — deleting it is unrelated cleanup that happens to fall in the same "dead auth/landing code" theme, not a consequence of removing `/auth`.

**Rationale**: Both are unreferenced after this feature (one as a direct consequence, one already true beforehand) — leaving them in place would be exactly the kind of orphaned dead code this feature is otherwise removing.

## 4. `onToggle` prop removal from `SignInForm.tsx` / `SignUpForm.tsx`

**Decision**: Remove the `onToggle?: () => void` prop, its type in each `*FormProps` interface, and the now-fully-unreachable `handleSignUpClick`/`handleSignInClick` wrapper functions — replacing their one live call site (`SignUpForm.tsx`'s "Sign In" button) with a direct `router.push("/signin")` inline, and simply deleting the commented-out dead button block in `SignInForm.tsx` (it was already non-functional and commented out prior to this feature).

**Rationale**: No page will pass `onToggle` after `/` and `/auth` are deleted — keeping the prop would be a dead API surface with no caller. This is pure dead-code removal (FR-006 requires the real behavior — fields, validation, submission, cross-links — to be unchanged), not a functional change, since `onToggle` was already unreachable.

## 5. Force-light-mode consolidation (signin/signup/forgot-password)

**Decision**: Extract the identical inline `useEffect` (currently duplicated verbatim in `app/signin/page.tsx` and `app/signup/page.tsx`, and near-verbatim with a wrapper-class bug in `app/forgot-password/page.tsx`) into one shared hook, e.g. `hooks/useForceLightMode.ts`, called by all three page components. While touching `app/forgot-password/page.tsx`, fix its wrapper `className`: currently `"min-h-screen  text-primary light forced-light"` (double space; `text-primary` instead of the `text-gray-800` base text color `signin`/`signup`'s equivalent wrapper uses) → `"min-h-screen text-gray-800 light forced-light"`.

**Investigation**: All 3 pages' `useEffect` bodies are the identical ~10 lines (remove `dark`/add `light` on both `<html>` and `<body>`, set `body.style.backgroundColor = "#E5EDF1"`, clean up the background color on unmount) — none use `ForceLightMode.tsx`'s heavier MutationObserver/interval approach, so this consolidation is independent of item 3 above (no interaction between the two).

**Alternatives considered**: Reusing `ForceLightMode.tsx` itself as the shared mechanism for all 3 pages — rejected; it's a much heavier wrapper-component pattern (2 observers + a perpetual interval) designed for a different composition style (wrapping `{children}` in a styled `<div>` with injected global CSS overrides), and it's being deleted as part of item 3. A small hook matching the 3 survivors' existing lightweight pattern is the better fit and requires no new dependency.

## 6. Redirect mechanism

**Decision**: Use `next.config.js`'s `async redirects()` function (currently absent — the file only defines `headers()` and `compiler`/`experimental` options) rather than stub `page.tsx` files that call `redirect()` client-side.

**Rationale**: `redirects()` is a permanent, server/edge-level redirect that works identically for direct navigation, bookmarks, and any server-rendered request — no client-side flash-then-redirect, and it cleanly allows the 4 old route directories/files to be deleted outright rather than replaced with new stub content.
