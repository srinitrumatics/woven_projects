# Implementation Plan: Shared Read-Only Field Component

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`091`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/092-shared-readonly-field-component/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build two new shared components in `components/ui/` — `ReadOnlyField` (single-line record value, with real working-link support) and `ReadOnlyTextArea` (multi-line Notes/Scope-Summary display) — then migrate all 16 confirmed call-site files across Invoices, Proposals, Quotes, and Order Line Detail onto them, following the same shared-component consolidation precedent as Modal (087) and SubTabs (088). This closes two independently-verified defects: (1) `DetailInput.tsx` imports `next/link` and computes an `isLink` flag from an `href` prop but never renders a `<Link>` anywhere, silently dropping 9 working navigation links across 3 Invoice files; (2) 7 distinct visual treatments of the "read-only field styled as fake-editable input" idiom exist across Invoices, Proposals, Quotes, and Order Line Detail's `ProductInfo.tsx` — each independently drifted (different padding, border color, cursor hack, focus-ring suppression). Both new components render a `<div>`/`<Link>` rather than an `<input readOnly>`, eliminating the entire category of "looks editable" defects at the root instead of suppressing them one class at a time. `DetailInput.tsx` is deleted once its 3 call sites migrate. Order Detail's genuine editable forms (real `isEditing`/`onChange` state) are confirmed out of scope and untouched.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — `next/link` (already used throughout the app) is the only import the new components need beyond React itself

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature; every field's already-resolved display value and fallback logic stays exactly where it lives today (at the call site)

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`091` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders beyond replacing one DOM element type with another

**Constraints**:
- FR-009/FR-010: every field's existing empty-value fallback and truncate/`title`-tooltip overflow handling MUST be preserved unchanged — the new components receive already-resolved display strings and don't reimplement fallback logic.
- FR-011: Order Detail's `BillingInfo.tsx`/`ShippingInfo.tsx`/`OrderNotes.tsx`/`DeliveryOptions.tsx`/`ShipToContact.tsx` (genuine editable forms with a real edit mode) MUST NOT be modified.
- FR-013: no business logic, data-fetching, or Salesforce read/write changes anywhere — every change is either the dead-link rendering fix or a presentation-layer styling consolidation.
- The Proposal/Quote "Drop-Ship" field's conditional `text-green-600 font-medium` styling MUST be preserved through `ReadOnlyField`'s new `valueClassName` prop.

**Scale/Scope**: 19 file operations — 2 new shared components, 13 call-site files migrated for single-line fields (3 Invoice cards + 1 Invoice Line Detail page + 3 Proposal cards + 1 Proposal Line Detail page + 3 Quote cards + 1 Quote Line Detail page + 1 Order Line Detail `ProductInfo.tsx`), 3 of those same page files additionally carry a Notes-box migration to `ReadOnlyTextArea` (no extra file count), 3 additional standalone Notes/Scope-Summary component files migrated (`InvoiceNotes.tsx`, `ProposalDetails.tsx` — 2 boxes, `QuoteNotes.tsx`), 1 file deleted (`DetailInput.tsx`). No new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes — every migrated field already receives its resolved value as a prop from its existing parent; no new query or service call is introduced.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature replaces 7 independently-duplicated visual treatments with 2 shared components — a net reduction in duplicated code, following the established precedent of `Modal.tsx` (087) and `SubTabs.tsx` (088). `valueClassName` is added only because a real, confirmed use case (Drop-Ship's conditional color) requires it — not speculative.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/092-shared-readonly-field-component/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — the two new components are internal presentation-layer primitives (like `StatusBadge.tsx`/`Modal.tsx`), not an external API/interface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/ReadOnlyField.tsx                                        # NEW — single-line read-only field, real Link support, label/value/href/className/valueClassName
components/ui/ReadOnlyTextArea.tsx                                     # NEW — multi-line Notes/Scope-Summary display, value/className

app/invoices/[id]/components/DetailInput.tsx                           # DELETE — fully superseded once its 3 call sites migrate
app/invoices/[id]/components/InvoiceBillingInfo.tsx                    # migrate 6 DetailInput usages -> ReadOnlyField
app/invoices/[id]/components/InvoiceShippingInfo.tsx                   # migrate 5 DetailInput usages -> ReadOnlyField
app/invoices/[id]/components/InvoiceCardDetail.tsx                     # migrate 5 DetailInput usages -> ReadOnlyField (component internally named InvoiceKeyDates — pre-existing naming quirk, untouched)
app/invoices/[id]/components/InvoiceNotes.tsx                          # migrate <textarea disabled> -> ReadOnlyTextArea
app/invoices/[id]/lines/[lineid]/page.tsx                              # migrate 9 inline fields (~342-461) -> ReadOnlyField; migrate Notes box (~314-317) -> ReadOnlyTextArea

app/proposals/[id]/components/BillingInfo.tsx                          # migrate 6 inline fields -> ReadOnlyField
app/proposals/[id]/components/ShippingInfo.tsx                         # migrate 6 inline fields -> ReadOnlyField (Drop-Ship uses valueClassName)
app/proposals/[id]/components/KeyDates.tsx                             # migrate 5 inline fields -> ReadOnlyField
app/proposals/[id]/components/ProposalDetails.tsx                      # migrate 2 <textarea readOnly> (Notes ~47-51, Scope Summary ~79-83) -> ReadOnlyTextArea
app/proposals/[id]/lines/[lineid]/page.tsx                             # migrate 9 inline fields (~744-871) -> ReadOnlyField; migrate Notes box (~722-726) -> ReadOnlyTextArea

app/quotes/[id]/components/QuoteBillingInfo.tsx                        # migrate 6 inline fields -> ReadOnlyField (previously uniquely grayed-out treatment)
app/quotes/[id]/components/QuoteShippingInfo.tsx                       # migrate 6 inline fields -> ReadOnlyField (Drop-Ship uses valueClassName)
app/quotes/[id]/components/QuoteKeyDates.tsx                           # migrate 5 inline fields -> ReadOnlyField
app/quotes/[id]/components/QuoteNotes.tsx                              # migrate <textarea disabled> -> ReadOnlyTextArea
app/quotes/[id]/lines/[lineid]/page.tsx                                # migrate 9 inline fields (~482-608) -> ReadOnlyField; migrate Notes box (~460-464) -> ReadOnlyTextArea

app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx              # migrate 9 inline fields -> ReadOnlyField (7th treatment, only Orders file in scope)
```

Unmodified (already correct, confirmed out of scope, genuine editable forms):
```text
app/orders/[id]/components/BillingInfo.tsx
app/orders/[id]/components/ShippingInfo.tsx
app/orders/[id]/components/OrderNotes.tsx
app/orders/[id]/components/DeliveryOptions.tsx
app/orders/[id]/components/ShipToContact.tsx
```

**Structure Decision**: Single Next.js project. 2 new shared components, 16 call-site files migrated, 1 file deleted — 19 total file operations, no new dependency. Every migration is independent (no shared files between the Invoices/Proposals/Quotes/Orders groups beyond the 2 new shared components both groups import).

## Complexity Tracking

*No violations — table intentionally empty.*
