# Research: Auth Error Banner Consistency

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Sign In error banner border/animation fix (US1)

**Decision**: Change `components/SignInForm.tsx:78`'s error banner className from `bg-red-50 text-red-500 p-3 rounded-md text-sm` to `bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1` — appending the missing `border border-red-100 animate-in fade-in slide-in-from-top-1` classes, matching `SignUpForm.tsx:141` and `ForgotPasswordForm.tsx:120` exactly. No other classes change; `role="alert"` is already present on this element and is left untouched.

**Rationale**: Confirmed via direct read that `SignUpForm.tsx` and `ForgotPasswordForm.tsx`'s error banners are already byte-identical in their border/animation classes — a clear, already-proven-correct shared pattern that `SignInForm.tsx` simply never adopted.

**Alternatives considered**: Removing the border/animation from Sign Up and Forgot Password instead (converging the other direction) — rejected; 2 of 3 forms already share the more polished treatment, and it's a strict visual improvement (a gentle entrance animation and subtle border) with no downside, so converging Sign In up to match is the smaller, more valuable change.

## 2. Sign Up error banner `role="alert"` fix (US2)

**Decision**: Add `role="alert"` to `components/SignUpForm.tsx:141`'s error banner `<div>`, matching `SignInForm.tsx:78` and `ForgotPasswordForm.tsx:120`, both of which already have it.

**Rationale**: Confirmed via direct read that `SignUpForm.tsx`'s error banner has no `role` attribute at all, while its 2 sibling forms already do. This is the exact same class of fix applied by spec `093`'s accessibility pass (which added `role="alert"` to `SignInForm.tsx`, `ForgotPasswordForm.tsx`, and `app/(admin-portal)/admin-login/page.tsx`'s error banners) — `SignUpForm.tsx` was simply not included in that pass's file list at the time.

**Alternatives considered**: None — this is a single, unambiguous accessibility gap with a directly-confirmed reference pattern already in 2 sibling files of the same component family.

## 3. Scope boundary — what's explicitly NOT touched

**Decision**: `ForgotPasswordForm.tsx`'s success banner (`:126`, the green "code sent" message) is left completely untouched. No other content or behavior on any of the 3 forms is touched.

**Rationale**: The success banner is a distinct message type (positive confirmation, not an error) with no equivalent on Sign In or Sign Up — there's no cross-form inconsistency to resolve, since nothing else in the app renders an analogous success state on these forms. Every other aspect of the 3 forms (social-login buttons, password-toggle icons) was already fully addressed in spec `099`.

**Alternatives considered**: None — this boundary follows directly from the fact that the success banner has no sibling instance anywhere else to be inconsistent with.
