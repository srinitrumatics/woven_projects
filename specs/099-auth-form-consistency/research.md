# Research: Auth Form Consistency

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Dead social-login button removal (US1)

**Decision**: Remove, from both `components/SignInForm.tsx` and `components/SignUpForm.tsx`: the "Login/Sign up using social networks" caption paragraph, the 3-button social row (Facebook/Google/LinkedIn), and the "OR" divider block that separates it from the real email/password form. All 3 pieces exist solely to introduce the social buttons — removing only the buttons and leaving an orphaned "Login using social networks" caption above an empty gap, or a lone "OR" divider with nothing above it, would look broken. The email/password `<form>` itself (including its own error banner, fields, and submit button) is untouched.

**Rationale**: Confirmed via direct read that **3** social buttons exist per form (Facebook, Google, and LinkedIn — a 3rd button the initial audit-tier investigation missed, discovered during this planning phase's direct read), not 2 as first scoped; the spec was corrected to reflect all 3 before continuing. Confirmed via `grep` across the entire codebase that no OAuth/social-login API route, callback handler, or provider configuration exists anywhere — these buttons have never been functional. This is the same class of defect as spec `083`'s Invoice "Pay Now" gap, where the resolution was to not ship a fake/placeholder control for functionality that doesn't exist.

**Alternatives considered**: Removing only the 3 buttons and leaving the caption/divider in place — rejected; both pieces of surrounding markup exist purely as scaffolding for the social buttons (a caption promising "social networks" login and a divider separating it from "the other way to log in") and would read as broken/orphaned UI once the buttons themselves are gone. Wiring the buttons to a real OAuth flow — rejected; explicitly out of scope per the spec's Assumptions, since no backend integration exists to wire to and building one is a much larger feature than a UI consistency fix.

## 2. Password show/hide toggle consistency (US2)

**Decision**: Replace `components/SignUpForm.tsx`'s password-toggle `<button>` (currently rendering `{showPassword ? "Hide" : "Show"}` as plain text) with the identical eye-icon `<svg>` markup already used by `components/SignInForm.tsx:183-200` and `components/ForgotPasswordForm.tsx:204-211` — same two `<path>` variants (open-eye / eye-with-slash), same `w-5 h-5` sizing, same `fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden` attributes on the `<svg>`. The existing `onClick={() => setShowPassword((s) => !s)}` and `aria-label={showPassword ? "Hide password" : "Show password"}` on the button itself are preserved unchanged. Separately, add the identical `aria-label={showPassword ? "Hide password" : "Show password"}` attribute to `components/ForgotPasswordForm.tsx`'s toggle button (`:200-207`), which currently has no accessible label at all despite rendering the same icon-only control as `SignInForm.tsx`.

**Rationale**: Confirmed via direct read that `SignInForm.tsx` and `ForgotPasswordForm.tsx`'s eye-icon SVGs are byte-identical (same 2 `<path>` d-values, same wrapper attributes) — a clear, already-proven-correct shared visual pattern that `SignUpForm.tsx` simply never adopted, rendering plain text instead. Confirmed `ForgotPasswordForm.tsx`'s button has no `aria-label` prop at all (unlike its otherwise-identical `SignInForm.tsx` sibling), a small accessibility gap on the exact same control being touched by this user story.

**Alternatives considered**: Converging `SignInForm`/`ForgotPasswordForm` onto `SignUpForm`'s text-button style instead — rejected; the icon is both the majority convention (2 of 3 forms) and the more standard, recognizable pattern for a password-reveal control; text-only "Show"/"Hide" is also less discoverable at a glance than an eye icon.

## 3. Scope boundary — what's explicitly NOT touched

**Decision**: `SignUpForm.tsx`'s confirm-password field gains no show/hide toggle (it has none today). No broader Typography-category audit findings are addressed in this feature.

**Rationale**: Adding a new toggle to a field that has never had one is new functionality, not a consistency correction — outside this feature's bug-fix scope. Typography findings (heading hierarchy, missing page headings) are a distinct, not-yet-investigated audit category with its own separate scoping needs.

**Alternatives considered**: Bundling a confirm-password toggle into US2 "while we're in the file" — rejected; consistent with this repo's established discipline of not expanding scope beyond confirmed defects (e.g. spec `096`'s explicit non-consolidation of already-consistent card populations).
