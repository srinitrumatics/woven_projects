# Implementation Plan: Fix Invoice List — Sales Order & Purchase Order Columns Invisible in Light Mode

**Branch**: `wovn_mathu` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-fix-invoice-columns-light-mode/spec.md`

## Summary

Add missing base text color classes to the Sales Order and Purchase Order column cells in `app/invoices/page.tsx`. The cells currently render with no foreground color, making them invisible against a light background. Two className edits cover all three affected code paths.

**Affected locations** (all in `app/invoices/page.tsx`):

| Line | Element | Problem | Fix |
|------|---------|---------|-----|
| 522 | `<div className="text-sm font-medium">` (Sales Order) | No color — invisible in light mode | Add `text-gray-900 dark:text-white` |
| 525 | `<div>` outer wrapper (Purchase Order) | No color — bare-text and span paths inherit nothing | Add `text-sm font-medium text-gray-900 dark:text-white` |
| 536 | `<span className="font-medium">` (PO manufacturer) | Covered by outer div fix on line 525 | No separate change needed |
| 539 | Bare text node (PO N/A fallback) | Covered by outer div fix on line 525 | No separate change needed |

The `<Link className="text-primary ...">` at line 528 is already correctly styled and needs no change.

## Technical Context

**Language/Version**: TypeScript / React 18, Next.js 15 (App Router)

**Primary Dependencies**: Tailwind CSS — existing utility classes `text-gray-900` and `dark:text-white` already used elsewhere in the same table

**Storage**: N/A

**Testing**: Manual browser validation in light mode and dark mode

**Target Platform**: Web browser — confirmed on macOS Chrome; applies to all browsers/OS

**Project Type**: Next.js 15 web application — single client component patch

**Performance Goals**: No performance impact

**Constraints**: Fix must not regress dark mode. Color choice must match the existing convention used by other data cells in the same table.

**Scale/Scope**: Two className edits in one file (`app/invoices/page.tsx`).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No data fetching changes. |
| II. RBAC-First Feature Design | ✅ Pass | No new UI surface; color-only fix. |
| III. Next.js 15 App Router Patterns | ✅ Pass | No route param or layout changes. |
| IV. Multi-Tenant Isolation | ✅ Pass | No data access changes. |
| V. Simplicity & Phase-Driven Scope | ✅ Pass | Minimal two-edit fix; no abstractions. |

**Gate result**: All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-invoice-columns-light-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/invoices/
└── page.tsx             # Only file changed — 2 className edits
```

**Structure Decision**: Single-file patch. No new files in source tree.

## Complexity Tracking

> No constitution violations. Table not applicable.
