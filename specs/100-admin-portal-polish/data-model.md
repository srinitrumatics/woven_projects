# Data Model: Admin-Portal Polish

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact edits per file.

## Sync-run status → shared StatusBadge (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx` | Import block | No `StatusBadge` import | `import { StatusBadge } from '@/components/ui/StatusBadge';` added |
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx:662` | Sync-run status element | `<span className={...startsWith('completed')...}>{run.status}</span>` | `<StatusBadge status={run.status} variant="compact" />` |
| `components/ui/StatusBadge.tsx` | `getStyles()` switch | `case "completed":` → green (no `completed_with_errors` case) | `case "completed": case "completed_with_errors":` → green |

Reference (unchanged): `StatusBadge.tsx`'s existing `case "failed":` (red) and `default:` (gray) cases already produce the correct color for the remaining 2 behaviors this feature must preserve.

## Organization Detail heading weight (US2)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx:308` | Page `<h1>` | `text-2xl font-bold text-gray-900 dark:text-white` | `text-2xl font-semibold text-gray-900 dark:text-white` |

Reference (unchanged, the target pattern being matched): `app/(admin-portal)/admin-portal/organizations/page.tsx:93` — `text-2xl font-semibold text-gray-900 dark:text-white`.

## Admin Login decorative icon `aria-hidden` (US3)

| File | Element | Before | After |
|---|---|---|---|
| `app/(admin-portal)/admin-login/page.tsx:54` | `<ShieldCheck>` | No `aria-hidden` | `aria-hidden="true"` added |
| `app/(admin-portal)/admin-login/page.tsx:71` | `<Mail>` | No `aria-hidden` | `aria-hidden="true"` added |
| `app/(admin-portal)/admin-login/page.tsx:86` | `<Lock>` | No `aria-hidden` | `aria-hidden="true"` added |
| `app/(admin-portal)/admin-login/page.tsx:104` | `<ArrowRight>` | No `aria-hidden` | `aria-hidden="true"` added |

## Explicitly unmodified elements

| Element | File | Reason |
|---|---|---|
| Indigo/purple/amber action-button colors (Load Products/Index Products/Retry Indexing) | `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`, `.../create/page.tsx` | Separate, undecided judgment call — not a confirmed defect |
| Every other Admin-Portal page | `app/(admin-portal)/**` | Not named in this feature's scope |

## Key Entities

- **Sync-run status**: The state of a product-load or product-index background run, now visually communicated via the shared `StatusBadge` component instead of page-local logic.
- **Page heading**: Organization Detail's `<h1>`, now matching Organization List's font weight.
- **Decorative icon**: Admin Login's 4 icons, now hidden from the accessibility tree.
