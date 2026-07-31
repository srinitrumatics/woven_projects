# Implementation Plan: Shared Status Badge Component

**Branch**: `079-shared-status-badge` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/079-shared-status-badge/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

34 files across the app independently define their own local `StatusBadge` function — 19 textually distinct implementations covering 47 distinct status strings, with 8 of those strings mapping to genuinely conflicting colors depending on which file you're in (already resolved via the majority-wins rule documented in `spec.md` FR-005). Planning-time discovery: a shared `components/ui/StatusBadge.tsx` **already exists** and is already imported by 10 other files (mostly Purchase Order/Supplier Bill related-record tables) — it just isn't used by any of the 34 files this feature is consolidating. This plan **extends the existing shared component** (not a new file) to add the 32 status values it doesn't yet recognize, resolves 2 additional conflicts discovered between its already-established mappings and the 34-file survey (`Partial`, `Inactive` — resolved in `research.md` using the same precedent-wins logic already approved for the original 8), and updates all 34 files to import it instead of their local copy. The existing component's case-insensitive matching and bordered-box style are kept as-is (they're already proven safe in production); the file also exports an unrelated `RemittanceBadge` for payment-remittance status, which this feature does not touch.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing utility classes reused as-is); no new packages

**Storage**: N/A — purely a presentational component; no data, fetch, or status-computation logic changes anywhere

**Testing**: Manual/visual QA per `quickstart.md`, consistent with prior `07x` UI-consistency features in this repo (no automated UI test suite exists)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls; this is a pure refactor of already-rendered presentational logic

**Constraints**: 
- `components/ui/StatusBadge.tsx`'s existing 21 status mappings (already live across 10 consumer files) are treated as authoritative and are not re-litigated by the 34-file survey's raw vote counts — only extended with genuinely new statuses, per `research.md`.
- The shared component's status list MUST end up as a strict superset of every status string found across all 34 current implementations plus its own existing 21 (this results in 32 net-new cases added; see `data-model.md`).
- Every status string that was NOT conflicting anywhere (across the 34 files, or against the existing shared component) must keep its exact current color — zero-regression requirement (FR-004).
- Two additional conflicts were found between the already-established shared component and the 34-file survey (`Partial`, `Inactive`) beyond the original 8 approved in `spec.md` FR-005 — resolved in `research.md` using the same precedent-based logic, expanding the "pages whose color changes" list by two.
- The existing component hardcodes the bordered-box style. Per `spec.md` FR-007 (preserve existing structural differences, do not force pixel-identical shape), the component is extended with an optional `variant?: 'pill' | 'bordered' | 'compact'` prop — `'bordered'` remains the default (so all 10 existing consumers render byte-identically with zero changes), 24 files currently using the plain-pill shape pass `variant="pill"`, and 1 file (`ProductsTab.tsx`, a smaller non-fully-rounded shape found only via a follow-up search since it uses an object-literal `colorMap` instead of a switch statement) passes `variant="compact"`. Only the status→color decision logic is shared; badge shape is preserved per call site.
- One usage (`app/admin/authorize-locations/[id]/delivery-windows/page.tsx`) has a structurally different prop signature (`{ active: boolean }` instead of `{ status: string }`) — this call site must convert `active ? "Active" : "Inactive"` before calling the shared component.
- `RemittanceBadge` (payment-remittance status, exported from the same file) is a separate, already-correctly-scoped concept and is not touched by this feature.

**Scale/Scope**: 1 existing file extended (`components/ui/StatusBadge.tsx`) + 34 existing files edited (each: remove its local `function StatusBadge` definition, add an import, and — where the local status list included non-standard fallback text like `status || "N/A"` — verify the shared component's fallback still satisfies that same case, per `research.md`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No data-fetching, query, or status-value-computation changes anywhere — every page continues to pass whatever status string it already fetches; only the *rendering* of that string moves to a shared component.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or data-mutation path; all 34 touched files remain behind their existing auth/route protection, unchanged.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. The new shared component follows the existing `components/ui/*` convention already used for `DataTable`, `Toast`, etc.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — this is a presentational-only refactor.
- **V. Simplicity & Phase-Driven Scope**: PASS. This *is* the simplification the constitution's principle calls for — replacing 19 duplicated implementations with one shared, well-documented component is a direct reduction in complexity and maintenance surface, not an addition. Scope is bounded to exactly what the spec asks: consolidate the color-decision logic; do not force pixel-identical badge shapes where two shapes already coexist deliberately (FR-007), do not touch status-computation logic.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/079-shared-status-badge/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — the full 47-status merged table
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature adds a shared UI component, not an API route; there is no request/response contract to document. The component's own prop interface is fully specified in `data-model.md`.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`. This feature adds one new shared component and updates 34 existing files to use it:

```text
components/
└── ui/
    └── StatusBadge.tsx          # EXISTING FILE, EXTENDED — add 32 net-new status cases, add
                                 # a `variant?: 'pill' | 'bordered'` prop (default 'bordered',
                                 # unchanged for its 10 existing consumers). RemittanceBadge in
                                 # the same file is untouched.

app/
├── admin/authorize-locations/
│   ├── page.tsx                                          # switch to shared component
│   └── [id]/delivery-windows/page.tsx                    # switch to shared component; adapt boolean prop to string at call site
├── invoices/
│   ├── page.tsx
│   └── [id]/components/InvoiceHeader.tsx
│   └── [id]/lines/[lineid]/page.tsx
├── orders/
│   ├── page.tsx
│   └── [id]/lines/[lineId]/components/LineHeader.tsx
├── proposals/
│   ├── page.tsx
│   ├── [id]/lines/[lineid]/page.tsx
│   └── [id]/components/{FulfillmentsTab,OrdersTab,ProductsTab,PurchasesTab,ReturnsTab}.tsx
├── purchase-orders/
│   ├── page.tsx
│   └── [id]/lines/[lineid]/page.tsx
├── quotes/
│   ├── page.tsx
│   ├── [id]/lines/[lineid]/page.tsx
│   └── [id]/components/{QuoteCreditMemoSubTab,QuoteDebitMemoSubTab,QuoteInvoicesSubTab,QuoteLinesTab,QuotePurchasesSubTab,QuoteRMASubTab,QuoteRTVSubTab,QuoteSalesOrdersSubTab,QuoteShippingManifestsSubTab,QuoteSupplierBillsSubTab}.tsx
├── shipments/
│   ├── page.tsx
│   └── [id]/components/ShipmentLinesTab.tsx
└── supplier-bills/
    ├── page.tsx
    ├── [id]/components/Badges.tsx                          # exports its own local StatusBadge — confirmed nothing outside this file imports it (all 10 existing external consumers already import from components/ui/StatusBadge instead), so it's safe to remove without touching any other file's imports
    └── [id]/lines/[lineid]/{page.tsx,components/SBLDebitMemoLinesTab.tsx}
```

**Structure Decision**: Single Next.js project. The shared component already lives under `components/ui/`, matching the existing convention for `DataTable`/`Toast` — this feature extends it rather than creating a new one. All 34 consumer files are edited independently (remove local function, add import, pass `variant` where the current shape is `'pill'`) — no consumer's surrounding logic, data-fetching, or non-badge JSX changes. `app/supplier-bills/[id]/components/Badges.tsx` also exports its own local `StatusBadge`, textually identical to 4 other files' bordered-variant copies — confirmed via direct grep that its export is never imported anywhere (the 10 existing external consumers all already import from `components/ui/StatusBadge`), so removing it is a pure, isolated deletion.
