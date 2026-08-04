# Data Model: Auth Form Consistency

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact edits per file.

## Dead social-login button removal (US1)

| File | Element | Before | After |
|---|---|---|---|
| `components/SignInForm.tsx` | "Login using social networks" caption `<p>` | Present | Removed |
| `components/SignInForm.tsx` | Social button row (Facebook/Google/LinkedIn `<button>`s) | Present | Removed |
| `components/SignInForm.tsx` | "OR" divider block | Present | Removed |
| `components/SignUpForm.tsx` | "Sign up using social networks" caption `<p>` | Present | Removed |
| `components/SignUpForm.tsx` | Social button row (Facebook/Google/LinkedIn `<button>`s) | Present | Removed |
| `components/SignUpForm.tsx` | "OR" divider block | Present | Removed |

Unchanged: both forms' `<form method="POST" onSubmit={handleSubmit}>` blocks (error banner, email/password fields, submit button) and all associated state/handlers.

## Password show/hide toggle consistency (US2)

| File | Element | Before | After |
|---|---|---|---|
| `components/SignUpForm.tsx` | Password toggle `<button>` content | `{showPassword ? "Hide" : "Show"}` (plain text) | The same eye-icon `<svg>` markup used by `SignInForm.tsx`/`ForgotPasswordForm.tsx` |
| `components/ForgotPasswordForm.tsx` | Password toggle `<button>` | No `aria-label` | `aria-label={showPassword ? "Hide password" : "Show password"}` added |

Unchanged: `SignUpForm.tsx`'s toggle `onClick={() => setShowPassword((s) => !s)}` and existing `aria-label`; `SignInForm.tsx`'s toggle (already the reference pattern, untouched); `ForgotPasswordForm.tsx`'s existing eye-icon SVG and `onClick`.

## Explicitly unmodified elements

| Element | File | Reason |
|---|---|---|
| Confirm-password field | `components/SignUpForm.tsx` | Has no show/hide toggle today; adding one would be new functionality, out of scope |
| Email/password submit, validation, error handling | `SignInForm.tsx`, `SignUpForm.tsx` | Untouched — only the social-login scaffolding is removed |
| Typography-category findings (heading hierarchy, missing page headings) | app-wide | Separate, not-yet-investigated audit category |

## Key Entities

- **Social sign-in button**: A Facebook, Google, or LinkedIn-branded button with no functional wiring, rendered on Sign In and Sign Up — removed along with its supporting caption and divider.
- **Password show/hide toggle**: The control that switches a password input between masked and plain text, now rendering and behaving identically across all 3 auth forms that have one.
