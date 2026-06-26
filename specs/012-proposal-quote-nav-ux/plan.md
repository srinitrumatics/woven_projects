# Implementation Plan: Proposal & Customer Quote Navigation UX

**Branch**: `012-proposal-quote-nav-ux` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-proposal-quote-nav-ux/spec.md`

## Summary

Two UX improvements to the proposal and customer quote navigation flow:
1. **New tab links** — Proposal and Customer Quote links in the Fulfillment tab open in a new browser tab (add `target="_blank" rel="noopener noreferrer"` to the two Next.js `<Link>` components in `FulfillmentTab.tsx`)
2. **Plain-text breadcrumb** — The clickable "Proposals"/"Quotes" first segment of the breadcrumb on proposal/quote detail pages is replaced with non-interactive plain text (remove `<button>` + `onBack` prop from `ProposalHeader` and `QuoteHeader`)

Total scope: 4 source files, ~8 line edits.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Next.js `Link` component — add `target="_blank" rel="noopener noreferrer"`; no new packages

**Storage**: N/A

**Testing**: Manual browser validation per quickstart.md

**Target Platform**: Web browser

**Project Type**: Web application — UI-only patch to existing components

**Performance Goals**: No impact

**Constraints**: Must not touch the "Back to Proposals/Quotes" footer buttons in the proposal/quote detail pages (those are separate, out of scope). Must not change Shipment or Invoice Fulfillment tab links.

**Scale/Scope**: 4 files, ~8 line edits total; zero new dependencies

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Source of Truth | PASS | No data fetching changes |
| II. RBAC-First Feature Design | PASS | No permission changes; new-tab applies to same permitted types as feature 011 |
| III. Next.js 15 App Router Patterns | PASS | `Link` with `target="_blank"` is standard Next.js usage |
| IV. Multi-Tenant Isolation | PASS | No data access changes |
| V. Simplicity & Phase-Driven Scope | PASS | Minimal UX patch; no new abstractions |

No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/012-proposal-quote-nav-ux/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

*No data-model.md or contracts/ — pure UI change, no new entities or API contracts.*

### Source Code (4 files)

```text
app/orders/[id]/components/
└── FulfillmentTab.tsx          # US1: add target="_blank" rel="noopener noreferrer" to proposal & quote links

app/proposals/[id]/components/
└── ProposalHeader.tsx          # US2: replace <button onClick={onBack}> with <span>, remove onBack prop

app/proposals/[id]/
└── page.tsx                    # US2: remove onBack prop from <ProposalHeader /> usage

app/quotes/[id]/components/
└── QuoteHeader.tsx             # US2: replace <button onClick={onBack}> with <span>, remove onBack prop

app/quotes/[id]/
└── page.tsx                    # US2: remove onBack prop from <QuoteHeader /> usage
```

**Structure Decision**: Pure component patch — no new files, no new directories.

## Key Research Findings

(Resolved inline — see research.md)

1. **`target="_blank"` security**: `rel="noopener noreferrer"` is required alongside `target="_blank"` to prevent the new tab from accessing the opener's `window.opener`. Next.js does not auto-add this.

2. **FulfillmentTab.tsx exact changes**:
   - Proposal link (line ~281): add `target="_blank" rel="noopener noreferrer"` to existing `<Link>`
   - Customer Quote link (line ~339): add `target="_blank" rel="noopener noreferrer"` to existing `<Link>`

3. **ProposalHeader.tsx exact changes**:
   - Remove `onBack: () => void` from `ProposalHeaderProps` interface
   - Remove `onBack` from component props destructuring
   - Replace `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Proposals</button>` with `<span>Proposals</span>`
   - Remove unused `useRouter` import and `const router = useRouter()` line

4. **QuoteHeader.tsx exact changes**:
   - Remove `onBack: () => void` from `QuoteHeaderProps` interface
   - Remove `onBack` from component props destructuring
   - Replace `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Quotes</button>` with `<span>Quotes</span>`
   - No `useRouter` import in this file — no import cleanup needed

5. **proposals/[id]/page.tsx**: Remove only `onBack={() => router.push("/proposals")}` prop from `<ProposalHeader>` (line ~1363). The footer `router.push("/proposals")` button (line ~1512) is OUT OF SCOPE.

6. **quotes/[id]/page.tsx**: Remove only `onBack={() => router.push("/quotes")}` prop from `<QuoteHeader>` (line ~679). The floating action bar and error-state buttons are OUT OF SCOPE.
