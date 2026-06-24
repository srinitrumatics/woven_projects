# Implementation Plan: Configure Order — Group Dropdown from Product Grouping

**Branch**: `wovn_mathu` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-configure-group-dropdown/spec.md`

## Summary

Replace the hardcoded preset list in the "+ Add Group" dropdown (`app/configure/page.tsx`) with a dynamically derived, deduplicated, alphabetically sorted list of `groupingLabel` values from the loaded product catalog. The `groupingLabel` field is already mapped in the existing catalog-loading logic (`p.Grouping__c || p.Product_Grouping__c`). The custom group name input is preserved. No API, database, or service changes are required — this is a self-contained client component change.

## Technical Context

**Language/Version**: TypeScript / React 18, Next.js 15 (App Router)

**Primary Dependencies**: React (`useMemo` for derived list), Tailwind CSS (existing classes)

**Storage**: N/A — no database or persistence changes

**Testing**: Manual browser validation (no automated test suite for UI components in this project)

**Target Platform**: Web browser (Next.js SSR/CSR hybrid; this page is a client component)

**Project Type**: Next.js 15 web application — single client component change

**Performance Goals**: No additional performance concern; `useMemo` already used for derived catalog lists (`mfrs`, `fams`)

**Constraints**: The `groupingLabel` list must only be computed after the catalog loads. Empty/undefined values must be excluded. Values must be deduped and sorted before render.

**Scale/Scope**: Single file change (`app/configure/page.tsx`); impacts only the "Add Group" dropdown UI.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | No new data fetching. `groupingLabel` already fetched via existing catalog API call. |
| II. RBAC-First Feature Design | ✅ Pass | No new permission surface. "+ Add Group" was ungated prior to this change; this feature introduces no new ungated action and creates no regression. |
| III. Next.js 15 App Router Patterns | ✅ Pass | No route param handling involved. Existing client component patterns unchanged. |
| IV. Multi-Tenant Isolation | ✅ Pass | Catalog data already fetched per org. No cross-org data access. |
| V. Simplicity & Phase-Driven Scope | ✅ Pass | Minimal change: one `useMemo` and one JSX block replacement. No abstractions introduced. |

**Gate result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-configure-group-dropdown/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/configure/
└── page.tsx             # Only file changed — group dropdown JSX + grpLabels useMemo
```

**Structure Decision**: Single-file client component edit. No new files in source tree.

## Complexity Tracking

> No constitution violations. Table not applicable.
