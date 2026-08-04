# Research: Accessibility Improvements

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Icon-only button labels

**Decision**: Add a specific `aria-label` string to each of the 5 confirmed unlabeled buttons: Org List's edit `<Link>` (`aria-label="Edit organization"`) and delete `<button>` (`aria-label="Delete organization"`) in `app/(admin-portal)/admin-portal/organizations/page.tsx:106-114`; Header's account/org-selector `<button>` (`aria-label="Select account"`, `components/Header.tsx:72-85`), notification-bell `<button>` (`aria-label="Notifications"`, `:138-143`), and user-avatar dropdown `<button>` (`aria-label="User menu"`, `:162-169`).

**Rationale**: Confirmed via direct read that Header's hamburger (`:61`, already `aria-label="Open menu"`) and theme-toggle (`:145-149`, already `aria-label="Toggle dark mode"`) buttons are correctly labeled today — the audit's "Header's hamburger in one spot" claim is stale. The 3 buttons that actually lack labels were found via a full pass over every icon-only button in the file, not assumed from the audit text.

**Alternatives considered**: Using `aria-labelledby` pointing at existing visible text — rejected for the bell and avatar buttons since neither has adjacent visible text to reference; a direct `aria-label` is simpler and matches the existing pattern already used successfully on the hamburger/theme-toggle buttons in the same file.

## 2. Live-region announcements for error/success banners

**Decision**: Add `role="alert"` to `SignInForm.tsx`'s error banner (`:137-141`), the Admin Login page's error banner (`app/(admin-portal)/admin-login/page.tsx:59-64`), and both of `ForgotPasswordForm.tsx`'s error (`:119-123`) and success (`:125-129`) banners. Leave every `setTimeout`-based auto-clear duration unchanged (3000-5000ms across `ForgotPasswordForm.tsx`'s 6 call sites).

**Rationale**: `role="alert"` causes assistive technology to announce the element's content as soon as it's added to the DOM, independent of how long it remains visible afterward — the announcement itself is not gated by the visual duration. This means the 3-second auto-clear timers are not actually the core defect once `role="alert"` is present: the announcement fires immediately on mount, giving a screen-reader user the same "chance to perceive it" as a sighted user glancing at the screen. Changing timer durations would be a secondary, riskier change (touching 6 separate `setTimeout` call sites with different values for different reasons) for no accessibility benefit once the live-region role is correctly in place, so per Constitution Principle V (Simplicity), it's left alone.

**Alternatives considered**: `aria-live="assertive"` on a wrapping `<div>` instead of `role="alert"` — functionally near-identical (both map to an assertive live region in most screen readers); `role="alert"` was chosen since it requires no extra wrapper element at any of the 3 sites, all of which already conditionally render a single `<div>` for the message.

## 3. Profile page label association

**Decision**: Add matching `id`/`htmlFor` pairs to all 9 confirmed fields in `app/profile/page.tsx`: Job Title (`id="Title"`, matching its existing `name="Title"`), Mobile Phone (`id="MobilePhone"`), Work Phone (`id="Phone"`), Birthdate (`id="Birthdate"`), and the 5 mailing-address fields — Street (`id="MailingStreet"`), City (`id="MailingCity"`), State (`id="MailingState"`), Postal Code (`id="MailingPostalCode"`), Country (`id="MailingCountry"`).

**Rationale**: Every field's `name` attribute (used for the existing `handleChange` state updates) is already a unique, stable string — reusing it as the `id` requires no new naming scheme and guarantees no collision, since two fields can't already share a `name` without breaking the existing form-state logic. Each field only renders as an `<input>`/`<select>` when `isEditing` is true (confirmed via full read, `page.tsx:277-448`) — the read-only `<p>` display mode needs no `id`/`htmlFor` since it isn't a form control.

**Alternatives considered**: Introducing a naming convention independent of `name` (e.g. `field-title`, `field-phone`) — rejected as unnecessary indirection; matching `name` is simpler and self-documenting.

## 4. Disabled Prev/Next as real buttons

**Decision**: Replace both disabled `<span>` elements in `app/quotes/[id]/lines/[lineid]/page.tsx` (`:625-631` Prev, `:650-656` Next) with `<button type="button" disabled>` carrying the same visible content and Tailwind classes, adding `aria-disabled="true"` is unnecessary once the native `disabled` attribute is present (browsers and AT already treat a real disabled `<button>` correctly).

**Rationale**: The enabled Prev/Next controls (`:614-623`, `:639-648`) already correctly use `<Link>`; only the disabled-state branches use `<span>`. Swapping to `<button disabled>` for exactly those 2 branches is the minimal change that makes the control keyboard-focusable-and-announced-as-disabled (real disabled buttons are skipped in tab order but still identifiable to AT via the accessibility tree) without touching the working enabled-state code path at all.

**Alternatives considered**: Keep `<span>` but add `role="button" aria-disabled="true" tabIndex={-1}` — rejected; this reinvents native disabled-button semantics with more markup and more room for inconsistency (e.g. forgetting `tabIndex={-1}` would make it focusable-but-inert, a worse trap) than simply using the native `disabled` attribute the platform already provides for free.

## 5. Keyboard-operable sync-history row

**Decision**: In `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx:642-645`, conditionally add `role="button"`, `tabIndex={0}`, `aria-expanded={expandedRunId === run.runId}`, and an `onKeyDown` handler (Enter/Space triggers the same `toggleFailures(run)` call already wired to `onClick`) — but only when `run.type === 'index' && (run.failed || 0) > 0` (the same condition that already gates the `onClick` and the cursor-pointer styling today). Non-expandable rows receive none of these attributes, unchanged.

**Rationale**: Confirmed via full read that the click condition, the visual "clickable" styling, and the chevron icon (`:661-663`) are already all gated behind the identical `run.type === 'index' && (run.failed || 0) > 0` check — reusing that exact condition for the new keyboard attributes guarantees the interactive and non-interactive rows can never disagree about which one they are.

**Alternatives considered**: Convert the row to a real `<button>` element — rejected; the row's internal layout (`flex items-center justify-between` with multiple `<span>` children showing status/count/chevron) is a complex, non-text-only structure that a `<button>` would need extra CSS resets to keep looking identical, whereas `role="button"` on the existing `<div>` preserves the current layout exactly while adding equivalent semantics.

## 6. Wizard step semantics

**Decision**: Wrap the 3 step-indicator circles (`app/(admin-portal)/admin-portal/organizations/create/page.tsx:273-292`) in a `<nav aria-label="Progress"><ol>` structure, converting each step's outer `<div>` to an `<li>` with `aria-current="step"` added only when that step is the active one (`step === n`), plus a visually-hidden (`sr-only`) span naming the step (e.g. "Step 1: Tenant Registry") and its status (current/completed) for context beyond the bare circle.

**Rationale**: `aria-current="step"` is the standard WAI-ARIA pattern for exactly this "which step in a sequence is active" case, and pairing it with a `<nav>`/`<ol>` gives assistive technology a real list-of-steps structure to navigate, rather than 3 unrelated `<div>`s. The visually-hidden span is added because the circles' only visible content today is a bare number or checkmark icon — with no accessible name, `aria-current="step"` alone would announce "current" without saying current *what*.

**Alternatives considered**: Only adding `aria-current="step"` without the `<nav>/<ol>`/`sr-only`-label wrapper — rejected as an incomplete fix; `aria-current` on an unlabeled, unstructured `<div>` still leaves a screen-reader user unable to tell what "step 1" actually represents without cross-referencing the separate title text, which was the exact "not programmatically linked" gap the audit identified.
