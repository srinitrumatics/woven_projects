# Phase 0 Research: Supplier Bill Landing Page Corrections

## Current-state audit

**File**: `app/supplier-bills/page.tsx`

**Columns today** (lines 264-278, 15 total): Supplier Bill (sticky, plain text — clickable only via row-level `onClick`, no cell-level hyperlink) → Status → Purchase Order (gated by `isManufacturer` — should be unconditional) → Customer Quote (correctly gated) → **Proposal Name** (incorrectly doubles as the sole Proposal column: gated hyperlink using the Proposal's display name, with no separate "Proposal #"/plain "Proposal Name" split) → Customer Order (correctly gated) → **Supplier Name** (the supplier's own name — not in the requested column list; the request calls for Ship to Account/Location/Contact instead, none of which are rendered anywhere on this page) → Total Lines → **Total Amount** (sourced from `TotalAmount__c`, which per the request's `gtherp__TotalAmount__c` API-name annotation is actually the "Grand Total" field) → Billed Date → Payment Terms → Due Date → Remittance Status (color-coded correctly already) → Open Balance (no color-coding at all) → Action.

**Missing entirely** (fetched into component state but never rendered, or not fetched at all): "Proposal #" as its own gated column, "Ship to Account/Location/Contact", "Shipping" (`totalShippingCharges` is fetched but unused), "Grand Total" as its own column (its data is what's currently mislabeled under "Total Amount"), "Settled Date" (`settledDate` is fetched but unused).

**Decision**: Treat this as the same correction recipe already proven on `POSupplierBillsTable.tsx` (feature 041) for the near-identical defect pattern (wrong ship-to-vs-supplier fields, missing Proposal #/Name split, swapped financial columns, missing gating, missing color-coding) — reuse the exact same fix shapes since the underlying bug causes and the target column semantics are the same, just on a different page.

**Rationale**: This landing page and the PO-Details Supplier Bills tab render the same `Supplier_Bill__c` object family from the same generic Apex proxy, so the field names and the already-proven fix patterns (ship-to fields, Proposal #/Name split, gated-hyperlink JSX shape) transfer directly.

**Alternatives considered**: Extracting a shared `SupplierBillsTable` component reused by both this landing page and `POSupplierBillsTable.tsx`. Rejected per Constitution Principle V (Simplicity & Phase-Driven Scope) — the two components have different data-fetch wiring, different filter/search/stats-card surrounding UI, and different column sets (this page adds Total Lines, Payment Terms as landing-page-relevant columns not needed in the PO-scoped tab); unifying them now is a larger refactor than this correction feature calls for.

## Live-data field availability (confirmed, not assumed)

Queried the exact live endpoint this page's data flows through (`GET /api/supplier-bills?accountId=...&contactId=...&objectName=Supplier_Bill__c&tabName=Supplier_Bill`) against a real Salesforce org record. Confirmed the following fields ARE present on the returned `Supplier_Bill__c` array items (dumped every key on a real record):

- `Ship_to_Account_Name` + `Ship_to_Account__c`
- `Ship_to_Contact_Name` + `Ship_to_Contact__c`
- `Authorized_Ship_To_Location_Name` + `Authorized_Ship_To_Location__c` (the "Ship to Location" field — an authorized-location relationship, distinct from Ship to Account)
- `Total_Product_Amount__c` (→ Total Amount, per the request's `gtherp__Total_Product_Amount__c` annotation)
- `Total_Shipping_Charges__c` (→ Shipping, per the request's `gtherp__Total_Shipping_Charges__c` annotation)
- `TotalAmount__c` (→ Grand Total, per the request's `gtherp__TotalAmount__c` annotation)
- `Proposal_Name` + `Proposal__c` (no separate "proposal number" field exists — see Decision below)
- `Settled_Date__c`

**Why this matters**: Unlike feature 041's research (which flagged unconfirmed field-availability risk for the sibling PO-Details Supplier Bills tab, since that page's exact endpoint hadn't been live-queried at spec time), this feature carries zero such risk — every field this plan needs was directly observed on a live record from this exact endpoint before writing the spec.

## Decision: Proposal # / Proposal Name split with no dedicated "proposal number" field

**Current**: Only `Proposal_Name` (e.g., "Porposal-QA-001") and `Proposal__c` (the record ID) exist on the raw payload — there is no separate `Proposal_Number` field on this object's live data.

**Decision**: Mirror the exact pattern already shipped in `POSupplierBillsTable.tsx` (feature 041, lines 23-25, 63-64, 178-189): declare an optional `proposalNumber` field that falls back to `proposalName` when absent, use it as the gated-hyperlink "Proposal #" column, and always show `proposalName` (the same underlying value today) as plain text in the separate "Proposal Name" column.

**Alternatives considered**: Treating "Proposal #" and "Proposal Name" as identical redundant columns showing the same value twice. Rejected — the request explicitly lists them as two distinct columns with different hyperlink behavior (one gated-link, one always-plain), matching the already-accepted precedent; collapsing them would fail acceptance scenario 5 in spec.md.

## Header truncation

**Current**: No `SortableHeader` call in this file passes `truncate={false}`. Default (`components/ui/SortableHeader.tsx:24`) is `truncate = true`.

**Decision**: Add `truncate={false}` to every `SortableHeader` call in the corrected column set, matching every other corrected table in this portal (features 016-042).

## Sort and pagination (regression guards, not fixes)

**Current**: `useSortableData<SupplierBill>(filteredBills, { key: 'name', direction: 'desc' })` (page.tsx:159) already matches the requested "Record ID DESC" default exactly. `<Pagination>` (page.tsx:364-371) already renders unconditionally.

**Decision**: No change needed to sort or pagination logic — carry both forward unmodified as the column edits land, and verify they still work post-edit (regression guard tasks, not fixes).
