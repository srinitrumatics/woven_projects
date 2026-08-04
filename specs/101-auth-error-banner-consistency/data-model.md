# Data Model: Auth Error Banner Consistency

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact edits per file.

## Error banner consistency

| File | Element | Before | After |
|---|---|---|---|
| `components/SignInForm.tsx:78` | Error banner `<div>` | `role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm"` | `role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1"` |
| `components/SignUpForm.tsx:141` | Error banner `<div>` | `className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1"` (no `role`) | `role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1"` |

Reference (already correct, unchanged): `components/ForgotPasswordForm.tsx:120` — `role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-100 animate-in fade-in slide-in-from-top-1"` (this form's own `mb-4` is a pre-existing, unrelated spacing difference not touched by this feature — the border/animation/role are what this feature aligns on).

## Explicitly unmodified elements

| Element | File | Reason |
|---|---|---|
| Success banner (green "code sent" message) | `components/ForgotPasswordForm.tsx:126` | Distinct message type with no equivalent on Sign In or Sign Up — no cross-form inconsistency to resolve |
| Social-login buttons, password-toggle icons | `SignInForm.tsx`, `SignUpForm.tsx`, `ForgotPasswordForm.tsx` | Already fully addressed in spec `099` |

## Key Entities

- **Form-level error banner**: The message shown when a login/signup/password-reset submission fails, now rendering and being announced identically across all 3 auth forms.
