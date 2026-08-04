# Implementation Plan: Mock Data & Dead Code Cleanup

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`090`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/091-mock-data-dead-code-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Five independent, verified defects/dead-code items, all re-confirmed against current source (two of the original audit's claims — Product Detail's carousel and a supposed dead `Badges.tsx` — were found stale and are explicitly out of scope): (1) `TrackingTimelineModal` fabricates tracking events (including a corrupted location string) whenever real events are absent, reachable because the "Track Timeline" button opens the modal without ever triggering the tracking fetch or checking loading/availability state, unlike its sibling "Track Shipment" button — fix removes the mock fallback (the modal's honest "No tracking events found" branch is already built and simply dead code today) and has "Track Timeline" reuse the same fetch-then-open handler and disabled-state guard as "Track Shipment"; (2) Proposal Line Detail and Shipment Line Detail each render a fully-interactive but entirely fake image carousel, confirmed infeasible to wire to real images since neither page's fetched data carries any product-image reference — fix strips both down to the existing static placeholder icon, removing all carousel state/handlers/controls; (3) `SBLFilesTab` calls the wrong API (`/api/salesforce/orders` instead of `/api/supplier-bills`) with a stale `poId` prop — fix switches the endpoint and drops the now-provably-unused prop, mirroring the sibling `POFilesTable.tsx`'s working call shape; (4) `PODetails.tsx`, a confirmed-dead 94-line file with zero references, is deleted; (5) `POSupplierInfo.tsx` — which renders a "Billing Information" card, never any supplier field — is renamed to `POBillingInfo.tsx` (component, props interface, and its one call site), matching the `<Module>BillingInfo.tsx` convention already used by `InvoiceBillingInfo.tsx`/`QuoteBillingInfo.tsx`.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix uses existing components/hooks/API routes already present in the codebase

**Storage**: N/A — no schema, query, or data-fetching *source* changes; item 3 changes which existing API route a client call targets, not any database/Salesforce structure

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`090` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls beyond redirecting one existing call to a different existing endpoint

**Constraints**:
- FR-004/FR-007: Shipment Detail's real-tracking-data render path and Product Detail's `ProductGallery` MUST show zero behavior change.
- FR-009/FR-012: the SBLFilesTab endpoint switch and the POSupplierInfo→POBillingInfo rename MUST NOT change any user-visible output — both are verified byte-for-byte-equivalent renders/results, not redesigns.
- FR-013: no business logic, data-fetching source, or Salesforce read/write behavior changes anywhere beyond the specific endpoint correction in FR-008.

**Scale/Scope**: 7 files touched (2 edited for tracking fix, 2 edited for carousel removal, 2 edited for SBLFilesTab call-site + prop, 2 renamed/edited for the PO billing-info rename, 1 deleted) — 8 total file operations across 5 independent fixes, no new files, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. Item 3 redirects a client call from one existing `lib/*-service.ts`-backed API route to another (`/api/salesforce/orders` → `/api/supplier-bills`), both of which already encapsulate their SOQL/service calls correctly; no raw query construction is introduced anywhere.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface — all 5 items are fixes to or removals of existing UI/dead code.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. The corrected `/api/supplier-bills` call in item 3 still derives `accountId`/`contactId` from `useUserSession()` client-side context exactly as the sibling `POFilesTable.tsx` already does — no change to how org/account scoping is determined.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every item is either a deletion (dead file, dead mock data, dead carousel controls) or a minimal rename/redirect — no new abstraction introduced. Dropping `SBLFilesTab`'s unused `poId` prop outright (rather than renaming and keeping it, per YAGNI) is the simplest correct fix once confirmed unused by the target endpoint.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/091-mock-data-dead-code-cleanup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — the only "interface" change is a client-side fetch call switching from one already-existing internal API route to another already-existing one (item 3); neither route's own contract changes, so there is no new external interface to document.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/shipments/[id]/components/TrackingTimelineModal.tsx           # fix: remove mockTimelineData + else fallback (lines 20-29, 42-44); displayData defaults to []
app/shipments/[id]/components/ManifestSummary.tsx                 # fix: "Track Timeline" button (lines 98-103) reuses handleTrackClick + disabled guard + spinner, matching "Track Shipment" (lines 87-97)

app/proposals/[id]/lines/[lineid]/page.tsx                        # fix: remove productImages array (512-517), currentImageIndex state (519), handlePrevImage/handleNextImage (567-577); strip carousel label/arrows/dots from JSX (727-729, 733-769, 771-783), keep placeholder icon
app/shipments/[id]/lines/[lineid]/page.tsx                         # fix: remove productImages array (140-143), currentImageIndex state (144); strip carousel label/arrows/dots from JSX (219-222, 225-236, 237-242), keep placeholder icon

app/supplier-bills/[id]/lines/[lineid]/components/SBLFilesTab.tsx  # fix: handleAction (line ~97-99) switch endpoint /api/salesforce/orders -> /api/supplier-bills, drop orderId/objectName params; remove poId from SBLFilesTabProps (line 22-25) and function signature (line 29)
app/supplier-bills/[id]/lines/[lineid]/page.tsx                    # fix: drop poId={lineid} from <SBLFilesTab> call (line 404)

app/purchase-orders/[id]/components/PODetails.tsx                 # DELETE — confirmed dead, zero references
app/purchase-orders/[id]/components/POSupplierInfo.tsx            # RENAME -> POBillingInfo.tsx (component + props interface renamed, content/rendering unchanged)
app/purchase-orders/[id]/page.tsx                                 # update import (line 12) + usage (line 213) for the rename
```

**Structure Decision**: Single Next.js project. No new files, no new dependency. 6 files edited, 1 file deleted, 1 file renamed (content otherwise unchanged) with 1 dependent import site updated — 5 independent fixes across 3 modules (Shipments, Proposals/Shipments line-detail, Purchase Orders/Supplier Bills), each touching disjoint files so all 5 can proceed in any order or in parallel.

## Complexity Tracking

*No violations — table intentionally empty.*
