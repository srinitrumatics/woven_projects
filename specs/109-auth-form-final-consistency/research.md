# Research: Auth Form Final Consistency Pass

## Decision: Fix Sign Up to match Sign In/Forgot Password's panel order, not the other way around

**Rationale**: Sign In and Forgot Password both place the form left / CTA right using plain DOM order with **no** `order-*` utilities — this is the simpler, majority (2 of 3) convention, and it's also the one with no extra mechanism riding on top of it. Sign Up is the outlier, using explicit `order-1 md:order-2` (form) / `order-2 md:order-1` (CTA) to deliberately flip desktop while keeping mobile stacking form-first. The fix removes Sign Up's order classes and swaps its two panel blocks' DOM order to plain form-then-CTA, exactly matching its siblings — no `order-*` utilities needed anywhere once this is done, since mobile (`flex-col`) will still stack by DOM order (form first) and desktop (`md:flex-row`) will place DOM-first (form) on the left, DOM-second (CTA) on the right, matching Sign In/Forgot Password exactly.

**Alternatives considered**:
- **Flip Sign In/Forgot Password to match Sign Up's CTA-left arrangement**: Rejected — would require touching 2 files instead of 1 for no benefit, and moves away from the simpler no-`order-class` pattern toward the more complex flipped one.
- **Keep Sign Up's `order-*` classes but change their values to result in the same visual outcome**: Rejected — once DOM order is corrected, no `order-*` override is needed at all; keeping unused `order-1`/`order-2` classes around would be dead styling, contrary to Simplicity/YAGNI.

## Decision: Sign Up's decorative circles get repositioned to Sign In/Forgot Password's coordinates

**Rationale**: Sign In/Forgot Password's CTA panel (right side) places its top circle at `top-20 right-20` and bottom circle at `bottom-20 left-20`. Sign Up's CTA panel (currently left side) places them at `top-20 left-20` / `bottom-20 right-20` — a deliberate mirror to suit its left position. Once Sign Up's panel moves to the right, its circle coordinates must also change to `top-20 right-20` / `bottom-20 left-20` to match — otherwise the circles would sit in the wrong corners relative to the panel's new position (e.g., a "top-right" circle intended to hug the panel's outer edge would instead point toward the form panel).

## Decision: Sign In/Sign Up's labels become visible; Forgot Password is left untouched

**Rationale**: Visible field labels that persist regardless of typing state are the stronger, more standard accessibility practice compared to `sr-only` label + placeholder-as-visible-substitute (a known anti-pattern once a user starts typing and the placeholder disappears). Forgot Password already does this correctly for all 4 of its fields. This project has separately, deliberately invested in accessibility remediation (a prior spec added `aria-label`s, `role="alert"`, proper `htmlFor`/`id` pairing, keyboard operability, and `aria-current` across the app) — converging the 2 non-conforming forms onto the already-correct third, rather than the reverse, is consistent with that established direction.

**Scope of the change**: Only the label's `className` changes (from `sr-only` to Forgot Password's visible-label styling: `block text-sm font-medium text-gray-700 mb-1`) — the `htmlFor`/`id` pairing, the input's `placeholder`, and every other input attribute/class remain exactly as they are today. Placeholder text is **not** changed to an "example value" style (like Forgot Password's `"name@company.com"`) — it stays as today's label-substitute text (`"Email"`, `"Password"`, etc.), which now reads as a redundant-but-harmless hint once the visible label exists above it. Changing placeholder wording philosophy was investigated and explicitly excluded from this feature's scope (see plan.md constraints) since the audit finding is specifically about label visibility, not placeholder content, and rewriting 7 placeholders' wording is a separate, unscoped judgment call.

**Alternatives considered**:
- **Remove Sign In/Sign Up's placeholders once labels are visible (cleaner, avoids "redundant" hint text)**: Rejected — out of scope per the spec's explicit constraint (FR-005: placeholder text MUST remain); removing them is a separate design call not requested by the audit finding, and existing tests/behavior assume the placeholder attribute is present.
- **Converge Forgot Password onto sr-only+placeholder instead**: Rejected — moves away from the stronger accessibility practice already established there; would also require inventing new placeholder text for Forgot Password's fields that don't currently have "label-substitute" style placeholders (its placeholders are example-value hints like `"name@company.com"`, a different, already-correct pattern that shouldn't be perturbed).

## Note: Riding-along inconsistencies explicitly left untouched

Prior investigation surfaced several small inconsistencies riding alongside these 2 findings, all deliberately out of scope for this feature since they weren't the audited finding:
- Sign Up's inputs lack `placeholder-gray-400` (present on Sign In/Forgot Password's inputs).
- Sign Up's inputs use `min-h-screen`/`bg-gray-50` on its root wrapper vs. Sign In/Forgot Password's `h-screen` (this affects only the outer div's sizing keyword, not layout correctness — screen still fills correctly either way — and isn't part of the panel-order finding).
- Sign Up's focus ring is missing `focus:border-transparent` (present on Sign In/Forgot Password).
- Inconsistent redundant `title="..."` attributes on some password labels across forms.

None of these are part of either audited finding; each would need its own separate scoping decision if pursued later.
