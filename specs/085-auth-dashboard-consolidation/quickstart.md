# Quickstart: Validating the Auth/Landing/Dashboard Consolidation

## Prerequisites

- Local dev server running (`npm run dev`).
- A valid portal login for the "signed in as an already-authenticated user visits a protected page" checks; the redirect checks themselves don't require credentials.

## Scenario 1 — Dashboard routes redirect correctly (User Story 1)

1. Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/program360` — expected: a 3xx status and `redirect_url` ending in `/home`.
2. Repeat for `http://localhost:3000/dashboard` — expected: same, redirecting to `/home`.
3. In a browser, navigate to `/program360` and `/dashboard` directly and confirm both land on the real Home dashboard with no visual break.
4. Run: `ls app/program360 app/dashboard 2>&1` — expected: "No such file or directory" for both (fully removed, not just redirect-only stubs).

## Scenario 2 — Auth/landing routes redirect correctly, return param preserved (User Story 2)

1. Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/` — expected: redirects to `/signin`.
2. Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/auth` — expected: redirects to `/signin`.
3. **Critical**: Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3000/auth?return=/orders/123"` — expected: redirects to `/signin?return=/orders/123` (the query string MUST survive). If it does not, the redirect config needs an explicit source/destination wildcard fix before this feature is done.
4. While logged out, try to open `/home` directly — expected: redirected to `/signin?return=%2Fhome` (or equivalent), and after logging in, land back on `/home`.
5. Run: `ls app/page.tsx app/auth 2>&1` — expected: "No such file or directory" for both.
6. Run: `grep -rn "/auth" middleware.ts components/ProtectedPageWrapper.tsx` — expected: zero results (both updated to `/signin`).
7. Open `/signin` and `/signup` directly and confirm both still work exactly as before (fields, validation, submit, "Forgot Password?" link, cross-navigation between the two).
8. Run: `grep -n "onToggle" components/SignInForm.tsx components/SignUpForm.tsx` — expected: zero results.
9. Run: `grep -rln "ForceLightMode\|components/Navigation" app/ components/ --include="*.tsx"` — expected: zero results (both fully removed).

## Scenario 3 — Force-light-mode consolidated (User Story 3)

1. Toggle the app's dark mode on (via the theme toggle, or manually setting `localStorage.theme = 'dark'` then reloading).
2. Visit `/signin`, `/signup`, and `/forgot-password` — expected: all three consistently display in light mode regardless of the dark-mode setting.
3. Run: `grep -rn "document.documentElement.classList.remove(\"dark\")" app/signin/page.tsx app/signup/page.tsx app/forgot-password/page.tsx` — expected: zero results (all 3 now call the shared hook instead of inlining the effect).
4. Inspect Forgot Password's base text color and confirm it visually matches Sign In/Sign Up's (gray-800), not a mismatched blue/primary tone.

## Cross-cutting checks

- Run: `grep -rn '"/program360"\|'"'"'/program360'"'"'\|"/dashboard"\|'"'"'/dashboard'"'"'\|"/auth"\|'"'"'/auth'"'"'' --include="*.tsx" app/ components/ | grep -v node_modules` and manually review each hit — expected: no remaining *navigational* reference to the 4 removed routes (the redirect config itself in `next.config.js` is expected and correct).
- Confirm `npx tsc --noEmit` is clean.
- Confirm the admin-portal auth system (`/admin-login`, `/admin-portal`) is completely unaffected — it's a fully separate auth system per `CLAUDE.md` and out of scope for this feature.

## Done when

- All 3 scenarios above pass, including the critical query-string-preservation check in Scenario 2.
- No remaining code reference to the 4 removed routes outside `next.config.js`'s redirect config itself.
- Sign In / Sign Up / Forgot Password all function identically to before this feature, just reached via one canonical set of URLs.
