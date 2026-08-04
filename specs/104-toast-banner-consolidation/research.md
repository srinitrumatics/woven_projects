# Research: Toast Banner Consolidation

All findings below are grounded in a direct read of both affected files before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Profile feedback banner → useToast (US1)

**Decision**: In `app/profile/page.tsx`: add `import { useToast } from "@/components/ui/Toast";` and `const { success, error } = useToast();` inside the component. Replace each `setMessage({...})` call with the equivalent toast call, both using `5000` as the explicit duration (matching the removed `useEffect`'s clear-timer):
- Line 147-150 (validation-error branch): `setMessage({type:"error", text:"Please fix the validation errors below."})` → `error("Please fix the validation errors below.", 5000)`
- Line 172 (success branch): `setMessage({type:"success", text:"Profile updated successfully!"})` → `success("Profile updated successfully!", 5000)`
- Line 183 (server-error branch): `setMessage({type:"error", text: result.error || "Failed to update profile."})` → `error(result.error || "Failed to update profile.", 5000)`
- Line 186 (catch branch): `setMessage({type:"error", text:"Failed to update profile. Please try again."})` → `error("Failed to update profile. Please try again.", 5000)`

Remove entirely: the `message` state declaration (line 13), the auto-clear `useEffect` (lines 42-49), the reset call at the start of `handleSave` (line 125, no longer needed since there's no persistent state to clear before a new attempt), the "Cancel" button's `setMessage({type:"",text:""})` reset (line 468, becomes a no-op once the state is gone), and the inline banner JSX block (lines 200-209).

**Rationale**: Confirmed via direct read that all 4 `setMessage` call sites map cleanly onto `useToast()`'s `success(message, duration)` / `error(message, duration)` API, and that `ToastProvider` is already mounted at `app/layout.tsx` (the application root), so no new provider wiring is needed in this file. `fieldErrors` (per-field validation messages, rendered inline next to each input) is a completely separate state variable and JSX block from `message` — confirmed untouched by this migration.

**Alternatives considered**: Adopting `useToast()`'s own default duration (10000ms) instead of matching the prior 5000ms — rejected; the spec's own FR-005 requires preserving each message's exact prior visible duration, keeping this a pure presentation-layer swap rather than a behavior change.

## 2. Forgot Password's two banners → useToast (US2)

**Decision**: In `components/ForgotPasswordForm.tsx`: add `import { useToast } from "@/components/ui/Toast";` and `const { success, error } = useToast();` inside the component. Replace each `setError(text)`/`setSuccess(text)` + its paired `setTimeout(() => setX(""), Nms)` with a single toast call preserving that call site's exact duration:
- `handleEmailSubmit`: success message (3000ms), server-error message (5000ms), catch-block error message (3000ms)
- `handleResetSubmit`: 3 client-side validation errors (code format, password match, password strength — each 3000ms, each followed by an early `return`, which is preserved), success message (3000ms), server-error message (3000ms), catch-block error message (3000ms)

Remove entirely: the `error`/`success` state declarations (lines 14-15), the reset calls at the start of each handler (`setError(""); setSuccess("");`, no longer needed), and both inline banner JSX blocks (the red error banner and the green success banner).

Left completely untouched: the `setTimeout(() => setStep(2), 1500)` call in `handleEmailSubmit` (advances the wizard step, unrelated to message display) and the `setTimeout(() => router.push("/signin"), 2000)` call in `handleResetSubmit` (post-reset redirect, unrelated to message display).

**Rationale**: Confirmed via direct read of every `setError`/`setSuccess` call site and its paired `setTimeout` duration. Each maps 1:1 onto a `useToast()` call with the same message and duration. The step-advance and redirect timers are independent `setTimeout` calls with their own distinct purposes (navigation, not message display) and don't reference `error`/`success` state at all — confirmed they survive the state removal untouched.

**Alternatives considered**: Standardizing all message durations to one value (e.g., always 3000ms) — rejected; the spec's own FR-005 requires preserving each existing duration exactly, and the one 5000ms outlier (the "send reset code" server-error case) was presumably chosen deliberately to give a longer error message more time to be read.

## 3. Scope boundary — what's explicitly NOT touched

**Decision**: Profile's `fieldErrors` state/display and its `window.scrollTo` call, and Forgot Password's step-advance/redirect timers, are left completely untouched.

**Rationale**: Each is a distinct mechanism from the generic success/error banner this feature targets — `fieldErrors` is per-field inline validation, `scrollTo` reveals those field-level errors (still relevant even after the generic banner becomes a toast), and the step/redirect timers are navigation logic, not message display.

**Alternatives considered**: None — these are clearly separate concerns from the confirmed defect (hand-rolled inline banner vs. shared toast).
