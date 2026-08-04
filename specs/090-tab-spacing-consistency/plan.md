# Implementation Plan: Tab & Pagination Spacing Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`089`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/090-tab-spacing-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Three independent, verified defects behind two reported screenshots: (1) Proposal and Quote Detail pages' tab-content wrapper has zero top padding, causing the pill tab row to sit flush against whatever renders below it; (2) the shared underline `SubTabs` component uses an override-style `className` prop with no enforced base, which has let its 18 call sites (re-verified directly against current code — one more than originally estimated) diverge into 6 different spacing/layout treatments, including one call site (`LineFulfillmentsTab.tsx`) that has lost `flex`/`gap`/`border-b`/`overflow-x-auto` entirely, not just spacing; (3) the Shipments list page uniquely wraps its `Pagination` component in a shaded, padded `<div>` that no other list page has. Fix converts `SubTabs` to an append-style `className` API (matching the sibling `Tabs` component's existing pattern), normalizes every call site to rely on the new consistent default, and removes the two isolated one-off wrapper bugs.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix uses only Tailwind classes and the existing `SubTabs`/`Tabs`/`Pagination` component APIs

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`–`089` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders

**Constraints**:
- FR-006: no business logic, data-fetching, tab-switching behavior, or Salesforce read/write changes anywhere in this feature.
- FR-004: `LinePurchasesTab.tsx`'s genuinely-needed `px-6 pt-6` structural horizontal/top inset (its panel has no padding of its own otherwise) MUST be preserved through the `SubTabs` className-API change — it becomes an *appended* extra, not a replaced default.
- FR-007: Purchase Order, Invoice, Supplier Bill, and Order Detail pages (the 4 detail pages already correctly spaced) MUST show zero visible change.
- The `SubTabs` API change (override → append) is a breaking change to every one of its 18 call sites' `className` prop semantics — each call site's `className` value must be re-derived, not left as-is, or spacing will double up or conflict.

**Scale/Scope**: 17 files touched (2 detail-page wrappers, 1 shared component, 13 `SubTabs` call sites needing `className` normalization, 1 list-page wrapper removal), plus 5 `SubTabs` call sites confirmed already-correct and left untouched (18 call sites total, re-verified directly against current code). No new dependency, no new shared component.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature standardizes an existing shared component's API rather than introducing a new one; no new abstraction, no speculative future-proofing — the `SubTabs` fix brings it in line with the pattern `Tabs.tsx` (its sibling, same-shape component) already uses.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/090-tab-spacing-consistency/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — the only component-API change (`SubTabs`'s `className` prop semantics) is an internal implementation detail of an existing, already-defined prop shape (`SubTabsProps`, unchanged field set); it is not a new external interface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/SubTabs.tsx                                                          # fix: className override -> append (match Tabs.tsx pattern), fixed base incl. mb-4 default

app/proposals/[id]/page.tsx                                                        # fix: tab-content wrapper px-4 -> p-4 (line 1438)
app/quotes/[id]/page.tsx                                                           # fix: tab-content wrapper px-4 -> p-4 (line 733)

app/proposals/[id]/components/ReturnsTab.tsx                                      # normalize className (line 81)
app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx              # normalize className (line 155) — restores missing flex/gap/border-b/overflow-x-auto
app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx                 # normalize className, keep px-6 pt-6 structural inset (line 108)
app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx                   # normalize className (line 169)
app/purchase-orders/[id]/components/POReturnsTab.tsx                              # normalize className (line 28)
app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx               # normalize className (line 26)
app/quotes/[id]/components/QuoteFulfillmentTab.tsx                                # normalize className, drop non-standard px-4 (line 198)
app/quotes/[id]/components/QuotePurchasesTab.tsx                                  # normalize className, drop non-standard px-4 (line 160)
app/quotes/[id]/components/QuoteReturnsTab.tsx                                    # normalize className, drop non-standard px-4 (line 204)
app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx            # normalize className (line 279)
app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx               # normalize className (line 201)
app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx                 # normalize className (line 317)
app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx                    # normalize className (line 81)

app/shipments/page.tsx                                                            # fix: remove shaded/padded wrapper div around <Pagination> (lines 634-643)
```

Unmodified (already correct, verified during investigation — no `className` override present, so each already renders with `SubTabs`'s post-fix default):
```text
app/invoices/[id]/components/InvoicePayments.tsx
app/orders/[id]/components/FulfillmentTab.tsx
app/orders/[id]/components/ReturnsTab.tsx
app/proposals/[id]/components/FulfillmentsTab.tsx
app/proposals/[id]/components/PurchasesTab.tsx
```

**Structure Decision**: Single Next.js project. One shared-component fix (`SubTabs.tsx`) plus 15 call-site `className` normalizations, 2 detail-page wrapper padding fixes, and 1 list-page wrapper removal — no new files, no new dependency.

## Complexity Tracking

*No violations — table intentionally empty.*
