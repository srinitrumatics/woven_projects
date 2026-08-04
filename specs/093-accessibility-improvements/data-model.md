# Data Model: Accessibility Improvements

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the markup/attribute changes per file, since this feature's "entities" are accessibility-semantic constructs, not persisted data.

## Icon-only buttons (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-portal/organizations/page.tsx:106-108` | Edit `<Link>` | No accessible name | `aria-label="Edit organization"` |
| `app/(admin-portal)/admin-portal/organizations/page.tsx:109-114` | Delete `<button>` | No accessible name | `aria-label="Delete organization"` |
| `components/Header.tsx:72-85` | Account/org selector `<button>` | No accessible name | `aria-label="Select account"` |
| `components/Header.tsx:138-143` | Notification bell `<button>` | No accessible name | `aria-label="Notifications"` |
| `components/Header.tsx:162-169` | User-avatar dropdown `<button>` | No accessible name | `aria-label="User menu"` |
| `components/Header.tsx:61` | Hamburger `<button>` | `aria-label="Open menu"` | Unchanged |
| `components/Header.tsx:145-149` | Theme-toggle `<button>` | `aria-label="Toggle dark mode"` | Unchanged |

## Error/success banners (US2)

| File | Banner | Before | After |
|---|---|---|---|
| `components/SignInForm.tsx:137-141` | Error | Plain `<div>` | `role="alert"` added |
| `app/(admin-portal)/admin-login/page.tsx:59-64` | Error | Plain `<div>` | `role="alert"` added |
| `components/ForgotPasswordForm.tsx:119-123` | Error | Plain `<div>` | `role="alert"` added |
| `components/ForgotPasswordForm.tsx:125-129` | Success | Plain `<div>` | `role="alert"` added |

`setTimeout` auto-clear durations (3000-5000ms, 6 call sites in `ForgotPasswordForm.tsx`) are unchanged.

## Profile field label associations (US3)

| Field | `name` (existing) | `id` (new) | `htmlFor` (new, on existing `<label>`) |
|---|---|---|---|
| Job Title | `Title` | `Title` | `Title` |
| Mobile Phone | `MobilePhone` | `MobilePhone` | `MobilePhone` |
| Work Phone | `Phone` | `Phone` | `Phone` |
| Birthdate | `Birthdate` | `Birthdate` | `Birthdate` |
| Street Address | `MailingStreet` | `MailingStreet` | `MailingStreet` |
| City | `MailingCity` | `MailingCity` | `MailingCity` |
| State / Province | `MailingState` | `MailingState` | `MailingState` |
| Postal Code | `MailingPostalCode` | `MailingPostalCode` | `MailingPostalCode` |
| Country | `MailingCountry` | `MailingCountry` | `MailingCountry` |

All 9 rows in `app/profile/page.tsx`, only rendered when `isEditing` is true.

## Quote Line Detail Prev/Next (US4)

| File | Control | Before | After |
|---|---|---|---|
| `app/quotes/[id]/lines/[lineid]/page.tsx:625-631` | Disabled Prev | `<span className="... cursor-not-allowed">` | `<button type="button" disabled className="...">` (same classes) |
| `app/quotes/[id]/lines/[lineid]/page.tsx:650-656` | Disabled Next | `<span className="... cursor-not-allowed">` | `<button type="button" disabled className="...">` (same classes) |
| `app/quotes/[id]/lines/[lineid]/page.tsx:614-623`, `:639-648` | Enabled Prev/Next `<Link>` | Unchanged | Unchanged |

## Sync-history row (US5)

| File | Element | Before | After (only when `run.type === 'index' && (run.failed \|\| 0) > 0`) |
|---|---|---|---|
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx:642-645` | Row `<div>` | `onClick` only | `+ role="button"`, `+ tabIndex={0}`, `+ aria-expanded={expandedRunId === run.runId}`, `+ onKeyDown` (Enter/Space → `toggleFailures(run)`) |

Non-expandable rows (no failures, or `type === 'load'`) receive none of the above — unchanged.

## Org Create step wizard (US6)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-portal/organizations/create/page.tsx:273-292` | 3 step-circle `<div>`s in a plain `<div>` row | No list/nav semantics, no `aria-current` | Wrapped in `<nav aria-label="Progress"><ol>`; each step becomes an `<li>` with `aria-current="step"` when active, plus an `sr-only` span naming the step and its status |

## Key Entities

- **Icon-only button**: A button whose only visible content is an icon, requiring `aria-label` for an accessible name.
- **Live-region banner**: A conditionally-rendered message `<div>` requiring `role="alert"` so screen readers announce it on mount.
- **Label/control pair**: A `<label>` + `<input>`/`<select>` needing matching `htmlFor`/`id`.
- **Disabled navigation control**: A Prev/Next-style element needing real `<button disabled>` semantics instead of a static `<span>`.
- **Keyboard-operable custom control**: A `<div>` acting as an expand/collapse toggle, needing `role="button"`, `tabIndex`, and an `onKeyDown` handler mirroring its existing `onClick`.
- **Wizard step indicator**: A multi-step progress UI needing `aria-current="step"` plus list/nav structure and an accessible name per step.
