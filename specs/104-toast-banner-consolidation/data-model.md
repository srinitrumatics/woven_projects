# Data Model: Toast Banner Consolidation

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact call-site changes per file.

## Profile feedback banner → useToast (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/profile/page.tsx` | Import block | No `useToast` import | `import { useToast } from "@/components/ui/Toast";` added |
| `app/profile/page.tsx` | Component body | — | `const { success, error } = useToast();` added |
| `app/profile/page.tsx` (validation branch) | Feedback call | `setMessage({type:"error", text:"Please fix the validation errors below."})` | `error("Please fix the validation errors below.", 5000)` |
| `app/profile/page.tsx` (success branch) | Feedback call | `setMessage({type:"success", text:"Profile updated successfully!"})` | `success("Profile updated successfully!", 5000)` |
| `app/profile/page.tsx` (server-error branch) | Feedback call | `setMessage({type:"error", text: result.error \|\| "Failed to update profile."})` | `error(result.error \|\| "Failed to update profile.", 5000)` |
| `app/profile/page.tsx` (catch branch) | Feedback call | `setMessage({type:"error", text:"Failed to update profile. Please try again."})` | `error("Failed to update profile. Please try again.", 5000)` |
| `app/profile/page.tsx` | `message` state declaration | Present | Removed |
| `app/profile/page.tsx` | Auto-clear `useEffect` | Present | Removed |
| `app/profile/page.tsx` (`handleSave` start) | `setMessage({type:"", text:""})` reset | Present | Removed |
| `app/profile/page.tsx` ("Cancel" button) | `setMessage({type:"", text:""})` reset | Present | Removed |
| `app/profile/page.tsx` | Inline banner JSX block | Present | Removed |

Unchanged: `fieldErrors` state and its inline per-field display; the `window.scrollTo({top:0, behavior:'smooth'})` call on validation failure.

## Forgot Password's two banners → useToast (US2)

| File | Element | Before | After |
|---|---|---|---|
| `components/ForgotPasswordForm.tsx` | Import block | No `useToast` import | `import { useToast } from "@/components/ui/Toast";` added |
| `components/ForgotPasswordForm.tsx` | Component body | — | `const { success, error } = useToast();` added |
| `components/ForgotPasswordForm.tsx` (`handleEmailSubmit` success) | Feedback call, 3000ms | `setSuccess(data.message \|\| "..."); setTimeout(() => setSuccess(""), 3000);` | `success(data.message \|\| "...", 3000);` |
| `components/ForgotPasswordForm.tsx` (`handleEmailSubmit` server error) | Feedback call, 5000ms | `setError(data.error \|\| data.message \|\| "..."); setTimeout(() => setError(""), 5000);` | `error(data.error \|\| data.message \|\| "...", 5000);` |
| `components/ForgotPasswordForm.tsx` (`handleEmailSubmit` catch) | Feedback call, 3000ms | `setError("Failed to connect..."); setTimeout(() => setError(""), 3000);` | `error("Failed to connect...", 3000);` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` code-format validation) | Feedback call, 3000ms | `setError("Verification code must be exactly 6 digits."); setTimeout(...3000); return;` | `error("Verification code must be exactly 6 digits.", 3000); return;` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` password-match validation) | Feedback call, 3000ms | `setError("Passwords do not match."); setTimeout(...3000); return;` | `error("Passwords do not match.", 3000); return;` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` password-strength validation) | Feedback call, 3000ms | `setError("Password must be at least 8 characters..."); setTimeout(...3000); return;` | `error("Password must be at least 8 characters...", 3000); return;` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` success) | Feedback call, 3000ms | `setSuccess("Your password has been reset..."); setTimeout(...3000);` | `success("Your password has been reset...", 3000);` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` server error) | Feedback call, 3000ms | `setError(data.error \|\| "..."); setTimeout(...3000);` | `error(data.error \|\| "...", 3000);` |
| `components/ForgotPasswordForm.tsx` (`handleResetSubmit` catch) | Feedback call, 3000ms | `setError("Failed to connect..."); setTimeout(...3000);` | `error("Failed to connect...", 3000);` |
| `components/ForgotPasswordForm.tsx` | `error`/`success` state declarations | Present | Removed |
| `components/ForgotPasswordForm.tsx` (both handlers, start) | `setError(""); setSuccess("");` resets | Present | Removed |
| `components/ForgotPasswordForm.tsx` | Both inline banner JSX blocks | Present | Removed |

Unchanged: `setTimeout(() => setStep(2), 1500)` in `handleEmailSubmit`; `setTimeout(() => router.push("/signin"), 2000)` in `handleResetSubmit`.

## Key Entities

- **Save/submit feedback message**: A success or error message shown after a user action, now rendered via the app's shared toast mechanism with its exact prior visible duration preserved.
