# Feature Specification: Shared Read-Only Field Component

**Feature Branch**: `092-shared-readonly-field-component`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'read-only field consistency' finding (audit item #10), based on a fresh current-state re-audit that found the problem is larger than originally described. The audit claimed Invoices alone has 4 different visual treatments of record data rendered as fake-editable readOnly form inputs (border/shadow/focus-ring implying the field can be typed into, when it never can). Investigation confirmed and expanded this: there are actually 7 distinct visual treatments across Invoices, Proposals, Quotes, and Order Line Detail's Product Information card, plus a real, separate bug — `DetailInput.tsx` (Invoices' shared read-only field component, used in 16 places across 3 files) imports `next/link` and computes an `isLink` flag from an `href` prop, but never actually renders a `<Link>` anywhere — so 9 fields across Invoice Billing/Shipping/Card-Detail cards (Bill to Account, Bill to Location, Ship to Account, Ship to Location, Site, Proposal Name, Customer Order, Sales Order, Purchase Order) that should navigate to a related record instead silently render as plain dead text. User decision: build one shared `ReadOnlyField` component (plus a `ReadOnlyTextArea` variant for Notes/Scope-Summary boxes) in `components/ui/`, following the same flat convention as `StatusBadge.tsx`/`Modal.tsx`, with real working-link support built in from the start — then migrate every one of the 16 confirmed call-site files onto it, matching the scope precedent set by the Modal (087) and SubTabs (088) shared-component consolidations. Explicitly out of scope: Order Detail's `BillingInfo.tsx`/`ShippingInfo.tsx`/`OrderNotes.tsx`/etc., which are genuine editable forms with an `isEditing` toggle and real `onChange` handlers — not fake-editable dead chrome — and stay untouched; disabled file-upload/download buttons found during the same investigation sweep, which are legitimate disabled-button states, not misrepresented record fields."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read-only fields that point to a real record actually navigate there (Priority: P1)

A user viewing an Invoice's Billing Information, Shipping Information, or Card Detail section sees fields like "Bill to Account" or "Sales Order" that look like plain text today — clicking them does nothing, even though the underlying record link is already being computed and simply never rendered.

**Why this priority**: This is a functional defect, not a style nit — a working navigation path exists in the code (the `href` is computed) but is silently dropped before it ever reaches the page, so users lose a piece of navigation that was clearly intended to exist.

**Independent Test**: Open an Invoice Detail page where the underlying record has a resolvable related Account, Location, Proposal, Order, or Purchase Order, and confirm each of the 9 affected fields is now a clickable link that navigates to the correct related record.

**Acceptance Scenarios**:

1. **Given** an Invoice Detail page with a resolvable "Bill to Account", **When** a user clicks that field's value, **Then** they navigate to that account's page.
2. **Given** an Invoice Detail page with a resolvable "Sales Order", "Purchase Order", "Customer Order", or "Proposal Name" reference, **When** a user clicks the field's value, **Then** they navigate to the correct related record.
3. **Given** an Invoice Detail page where the underlying reference cannot be resolved (no id available), **When** a user views that field, **Then** it renders as plain read-only text exactly as it does today — no broken link is ever shown.

---

### User Story 2 - Every read-only field looks honestly non-editable, everywhere (Priority: P1)

A user viewing any record's Billing Information, Shipping Information, Key Dates, Card Detail, or Product Information section — across Invoices, Proposals, Quotes, and Order Line Detail — sees the same, single visual treatment for data that can never be edited: no border implying an input box, no focus ring, no press-animation, no cursor styling that suggests interactivity.

**Why this priority**: The single largest-count defect in this tier — 7 confirmed distinct treatments of the same idiom across 4 modules, each subtly implying editability that never exists, undermining trust that "does this field look editable" is a reliable signal anywhere in the app.

**Independent Test**: Open the Billing/Shipping/Key-Dates/Card-Detail sections of an Invoice, a Proposal, and a Quote, plus an Order Line Detail's Product Information card, and confirm every read-only field across all of them renders with identical, honestly-non-interactive styling.

**Acceptance Scenarios**:

1. **Given** Invoice Detail's Billing Information, Shipping Information, and Card Detail sections, **When** a user views any field, **Then** it renders with the new shared read-only styling, with 0 remaining `active:scale`/press-animation classes.
2. **Given** Proposal Detail's Billing Information, Shipping Information, and Key Dates sections, **When** a user views any field, **Then** it matches the exact same styling as the equivalent Invoice field.
3. **Given** Quote Detail's Billing Information, Shipping Information, and Key Dates sections, **When** a user views any field, **Then** it matches the exact same styling — including Quote Billing Info, which today uniquely renders in a grayed-out `cursor-not-allowed` style unlike every sibling section.
4. **Given** Invoice Line Detail, Proposal Line Detail, and Quote Line Detail's Product Information cards, **When** a user views any field, **Then** all three render identically to each other and to the top-level Detail-page treatment.
5. **Given** Order Line Detail's Product Information card, **When** a user views any field, **Then** it also matches this same single shared treatment, eliminating its own previously-distinct 7th variant.
6. **Given** Order Detail's Billing Information, Shipping Information, and Notes sections (genuine editable forms with a real edit mode), **When** a user views them, **Then** they are completely unaffected by this feature.

---

### User Story 3 - Notes and Scope Summary boxes look honestly non-editable too (Priority: P2)

A user viewing an Invoice, Proposal, or Quote's Notes section (and a Proposal's Scope Summary) sees a consistent, honestly-static read-only text box, not a `readOnly`/`disabled` `<textarea>` styled with the same implied-editability chrome as a real input.

**Why this priority**: The same defect as User Story 2 but for multi-line content — lower priority since it's a smaller, secondary surface (3-4 files) rather than the primary record-field surface, but the fix is the natural pairing to User Story 2's single-line consolidation.

**Independent Test**: Open the Notes section of an Invoice, a Proposal, and a Quote, plus a Proposal's Scope Summary, and confirm all render with the same shared, honestly-static styling.

**Acceptance Scenarios**:

1. **Given** an Invoice Detail page's Notes section, **When** a user views it, **Then** it renders via the new shared read-only text-box styling.
2. **Given** a Proposal Detail page's Notes and Scope Summary sections, **When** a user views either, **Then** both match the same shared styling as Invoice's Notes.
3. **Given** a Quote Detail page's Notes section, **When** a user views it, **Then** it matches the same shared styling.
4. **Given** the Notes box on Invoice, Proposal, and Quote Line Detail pages, **When** a user views any of them, **Then** all three render identically via the same shared component.

### Edge Cases

- What happens when a read-only field's value is empty/null? It must continue to show the same "N/A"/placeholder fallback each call site already provides today — the shared component must not change what is displayed, only how it is styled and (for User Story 1) whether a resolvable link is rendered.
- What happens to a field with a computed `href` when that computed value turns out to be falsy (no id resolved)? It must render as plain non-interactive text, never a broken or empty link.
- What happens to fields that are long enough to overflow their container? Existing `truncate`/`title`-tooltip behavior at each call site must be preserved through the migration, not dropped.
- What happens to Order Detail's genuinely editable Billing/Shipping/Notes forms? They are out of scope entirely and must show zero behavior or style change from this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A shared `ReadOnlyField` component MUST render a real, working link (navigating to the correct related record) when a resolvable link destination is provided, instead of silently discarding it.
- **FR-002**: `ReadOnlyField` MUST render as plain non-interactive text when no resolvable link destination is provided, with no broken or empty link ever shown.
- **FR-003**: All 9 currently-broken Invoice fields (Bill to Account, Bill to Location, Ship to Account, Ship to Location, Site, Proposal Name, Customer Order, Sales Order, Purchase Order) MUST become working links wherever a resolvable destination exists.
- **FR-004**: `ReadOnlyField` MUST NOT include any styling that implies editability (no input-style focus ring, no press-animation, no cursor style suggesting the field can be interacted with as an input).
- **FR-005**: Every single-line read-only record field on Invoice, Proposal, and Quote Detail pages (Billing Information, Shipping Information, Key Dates, Card Detail) MUST render via the shared `ReadOnlyField` component, with identical visual treatment across all three modules.
- **FR-006**: Every single-line read-only record field on Invoice, Proposal, and Quote Line Detail pages' Product Information card MUST render via the shared `ReadOnlyField` component, identical to the top-level Detail-page treatment.
- **FR-007**: Order Line Detail's Product Information card MUST also render via the shared `ReadOnlyField` component, eliminating its own currently-distinct visual treatment.
- **FR-008**: A shared `ReadOnlyTextArea` component MUST render every read-only Notes/Scope-Summary box on Invoice, Proposal, and Quote Detail pages, and on Invoice, Proposal, and Quote Line Detail pages' Notes sections, with identical visual treatment across all of them.
- **FR-009**: Every field's existing empty-value fallback display (e.g. "N/A", placeholder text) MUST be preserved unchanged through the migration.
- **FR-010**: Every field's existing overflow-handling behavior (`truncate` + `title` tooltip, where present today) MUST be preserved unchanged through the migration.
- **FR-011**: Order Detail's `BillingInfo.tsx`, `ShippingInfo.tsx`, `OrderNotes.tsx`, and any other genuinely editable Order Detail form MUST NOT be modified by this feature.
- **FR-012**: The now-fully-superseded `app/invoices/[id]/components/DetailInput.tsx` MUST be deleted once all 3 of its call sites are migrated onto the new shared `ReadOnlyField` component, with zero remaining references to it.
- **FR-013**: None of the fixes in this feature MUST change any underlying record data, Salesforce query, or business logic — every change is either a dead-link-rendering bug fix (FR-001-003) or a presentation-layer styling consolidation (FR-004-010).

### Key Entities

- **`ReadOnlyField`**: New shared component in `components/ui/`, rendering a single-line read-only record value, optionally as a real link when a resolvable destination is supplied. Replaces 7 confirmed distinct existing visual treatments (Invoices' `DetailInput`, Invoices' Line Detail inline treatment, Proposals'/Quotes' shared inline treatment, Quotes' uniquely grayed-out Billing Info treatment, Order Line Detail's `ProductInfo` treatment) with one.
- **`ReadOnlyTextArea`**: New shared component in `components/ui/`, rendering a multi-line read-only Notes/Scope-Summary box. Replaces the Notes-box treatment currently duplicated across Invoice/Proposal/Quote Notes sections and their respective Line Detail pages' Notes boxes.
- **Invoice/Proposal/Quote read-only record field**: A piece of Salesforce-sourced record data (e.g. Bill to Account, Ship to Location, Issued Date) displayed but never editable on a Detail or Line Detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 9 identified broken-link Invoice fields become working links wherever a resolvable destination exists, verified across Billing Information, Shipping Information, and Card Detail sections.
- **SC-002**: 0 remaining distinct visual treatments of the single-line read-only field idiom across Invoices, Proposals, Quotes, and Order Line Detail — all render via one shared component.
- **SC-003**: 0 remaining distinct visual treatments of the read-only Notes/Scope-Summary idiom across Invoices, Proposals, and Quotes (both Detail and Line Detail pages) — all render via one shared component.
- **SC-004**: 0 remaining references anywhere in the codebase to the deleted `DetailInput.tsx`.
- **SC-005**: 100% of migrated fields preserve their existing empty-value fallback and overflow/truncation behavior, verified by direct before/after comparison.
- **SC-006**: 0 regressions on Order Detail's genuinely editable Billing/Shipping/Notes forms.

## Assumptions

- Order Detail's `BillingInfo.tsx`/`ShippingInfo.tsx`/`OrderNotes.tsx`/`DeliveryOptions.tsx`/`ShipToContact.tsx` were investigated and confirmed to be genuine editable forms (an `isEditing` prop with real `onChange` handlers), not instances of the fake-editable-dead-chrome defect this feature targets — they are explicitly out of scope and must show zero change.
- Order Line Detail's `ProductInfo.tsx` was investigated and confirmed to be the Order-module equivalent of the same defect (always read-only, no edit mode, its own 7th distinct visual treatment) — it is the one Order-module file pulled into this feature's scope.
- Disabled file-upload/download buttons found during the investigation sweep (e.g. in `InvoiceFilesTab.tsx`, `QuoteFilesTab.tsx`) are legitimate disabled-button UI states, not misrepresented record fields, and are out of scope.
- The three per-Line-Detail-page "Notes box" instances (Invoice/Proposal/Quote Line Detail) are folded into `ReadOnlyTextArea`'s scope alongside the main Notes/Scope-Summary sections, since they display the same category of content (line-level notes) and this feature's goal is one consistent treatment for every instance of this idiom, not just the top-level Detail-page ones.
- No database schema or Salesforce data changes are required — every fix is presentation-layer (styling consolidation) or a client-side rendering bug fix (the dead `href`), consistent with the existing architecture where business data is mastered in Salesforce and the app is a presentation layer over it.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.
