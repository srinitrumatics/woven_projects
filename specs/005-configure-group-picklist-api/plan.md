# Implementation Plan: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Branch**: `wovn_mathu` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-configure-group-picklist-api/spec.md`

## Summary

Replace the catalog-derived `grpLabels` useMemo (feature 003) in `app/configure/page.tsx` with a dedicated Salesforce picklist fetch that retrieves `Product_Grouping__c` values from the existing `/api/salesforce/picklists` endpoint. The fetched values populate the "+ Add Group" dropdown. The pattern is identical to how `Shipping_Method__c` and `Incoterms__c` are loaded in `app/orders/[id]/page.tsx`.

**Changes required** (all in `app/configure/page.tsx`):

| Change | Detail |
|--------|--------|
| Remove `grpLabels` useMemo | Delete the derived state added in feature 003 |
| Add `grpLabels` state + fetch | `useState<string[]>([])` + `useEffect` fetching `/api/salesforce/picklists` and extracting `result.data[0].Product_Grouping__c` |
| No JSX change needed | The dropdown JSX from feature 003 already maps `grpLabels` — source change is transparent to the JSX |

## Technical Context

**Language/Version**: TypeScript / React 18, Next.js 15 (App Router)

**Primary Dependencies**: `useState`, `useEffect` (already imported in the file), `fetch` (browser-native)

**Storage**: N/A — no database changes

**Testing**: Manual browser validation

**Target Platform**: Web browser (Next.js client component)

**Project Type**: Next.js 15 web application — single client component edit

**Performance Goals**: Picklist fetch is fire-and-forget on mount; does not block catalog load or page render

**Constraints**:
- Must use existing `/api/salesforce/picklists?accountId=...&contactId=...` endpoint — no new API routes
- Must wait for `SF_ACCOUNT_ID` and `SF_CONTACT_ID` before fetching (same guard as catalog fetch)
- Empty/failed response must degrade gracefully (empty `grpLabels` state → list section hidden)
- The `grpLabels` useMemo from feature 003 is superseded and must be removed

**Scale/Scope**: Single file change (`app/configure/page.tsx`) — state declaration + useEffect + removal of useMemo.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Single Source of Truth | ✅ Pass | Picklist data comes from Salesforce via the existing `salesforceGetPicklists` service in `lib/salesforce-auth.ts`. |
| II. RBAC-First Feature Design | ✅ Pass | No new UI surface. The `requireAccountAccess` guard in the picklist route already enforces org-scoped access. |
| III. Next.js 15 App Router Patterns | ✅ Pass | No route param changes. `useEffect` + `useState` is the correct client-component data-fetching pattern here. |
| IV. Multi-Tenant Isolation | ✅ Pass | Fetch uses `SF_ACCOUNT_ID` from the session context — same org-scoped credential pattern as catalog fetch. |
| V. Simplicity & Phase-Driven Scope | ✅ Pass | Replaces one derived state with one useState + useEffect. Net code change is minimal. |

**Gate result**: All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-configure-group-picklist-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/configure/
└── page.tsx             # Only file changed — remove grpLabels useMemo, add useState + useEffect
```

**Structure Decision**: Single-file edit. No new files in source tree.

## Complexity Tracking

> No constitution violations. Table not applicable.
