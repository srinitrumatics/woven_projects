# Data Model: Unauthorized Page Consistency

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact className changes in `app/unauthorized/page.tsx`.

## Dark-mode support (US1)

| Line | Element | Before | After |
|---|---|---|---|
| 4 | Outer `<div>` | `bg-gray-50` | `bg-gray-50 dark:bg-gray-900` |
| 5 | Card `<div>` | `bg-white` | `bg-white dark:bg-gray-800` |
| 6 | "403" numeral | `text-red-500` | `text-red-500 dark:text-red-400` |
| 7 | Heading `<h1>` | `text-gray-800` | `text-gray-800 dark:text-white` |
| 8 | Body `<p>` | `text-gray-600` | `text-gray-600 dark:text-gray-400` |

## "Back to Home" button color (US2)

| Line | Element | Before | After |
|---|---|---|---|
| 13 | `<a>` button | `bg-blue-600 ... hover:bg-blue-700` | `bg-primary ... hover:bg-primary-dark` |

Reference (unchanged, the target pattern being matched): spec `097`'s `bg-primary hover:bg-primary-dark` convergence on Products' "Add to Order" button and Admin Login's submit button.

## Explicitly unmodified elements

| Element | Reason |
|---|---|
| Overall page layout (centered card, "403" numeral, heading, description, single CTA) | Kept as-is — this feature corrects color tokens only, not structure |
| `href="/home"` destination and hover/transition behavior on the button | Unrelated to the color-token fix |
| `components/ui/ErrorMessage.tsx` | Not modified — investigated and confirmed not a fit for this page's shape |

## Key Entities

- **Unauthorized page**: The full-page "403 Access Denied" view, now supporting dark mode and using the app's brand `primary` color, while keeping its own distinct layout.
