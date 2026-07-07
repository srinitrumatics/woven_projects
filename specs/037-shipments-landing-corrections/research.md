# Research: Shipments Landing Page — Required Corrections

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature has no unresolved unknowns. This document records the audit findings that resolved every open question before planning began.

## Decision: Scope is verification-only, zero code changes

**Rationale**: A background audit agent directly inspected `app/shipments/page.tsx` against both the prior spec (`specs/028-shipments-landing-corrections/spec.md`) and this request's exact 28-column list. The audit's verbatim conclusion: *"the implementation already satisfies the 028 spec in full. No discrepancies found against the FR-007 column order, hyperlink requirements, field mappings, or the P2 stories."*

**Alternatives considered**: Treating the request as corrective work by default (as was appropriate for features 033/034/036) was rejected because it would introduce unnecessary code churn on a page confirmed to already be correct — violating Constitution Principle V (Simplicity & Phase-Driven Scope, "No speculative rework").

## Decision: Column order/labels match FR-007 exactly

**Rationale**: Verified via direct read of `app/shipments/page.tsx` lines 484-516 (headers) and 540-640 (body cells) — all 28 columns render in the exact requested order with the exact requested labels.

**Alternatives considered**: N/A — a direct match, no alternative interpretation needed.

## Decision: Hyperlink behavior and `isManufacturer` gating are correct and unchanged

**Rationale**: Shipping Manifest # (line 541-547) links unconditionally to `/shipments/${shipment.Id}`. Customer Quote # (556), Proposal # (574), and Customer Order # (593) each link conditionally when the target ID exists AND `!isManufacturer` (isManufacturer defined at line 204 from `Account_Record_Type__c`), matching the account-type gating pattern already established across every other landing page in this portal (Orders, Quotes, Invoices).

**Alternatives considered**: N/A — matches the established cross-page convention exactly.

## Decision: Proposal #/Proposal Name split, Ship to Contact, and Drop Ship are correctly implemented

**Rationale**: Proposal # (line 74) falls back from a dedicated proposal-number field to `Proposal_Name` when unavailable — the same fallback convention already used on other landing pages (Invoices, Quotes). Proposal Name (line 75) is a separate plain-text field, distinct from Proposal #. Ship to Contact and Drop Ship (lines 82-83) both have real field mappings, not placeholder/dead fields.

**Alternatives considered**: N/A — matches the established fallback convention exactly.

## Decision: Six Box dimension columns use the exact requested dual-namespace API field fallbacks

**Rationale**: Lines 86-91 map `Box__c ?? gtherp__Box__c`, `Case_Length__c ?? gtherp__Case_Length__c`, `Case_Width__c ?? gtherp__Case_Width__c`, `Case_Height__c ?? gtherp__Case_Height__c`, `Case_Net_Weight__c ?? gtherp__Case_Net_Weight__c`, `Case_Gross_Weight__c ?? gtherp__Case_Gross_Weight__c` — an exact match to this request's explicit API names, using the dual-namespace fallback pattern already established across this portal's Box/Ship/Delivered date fields (spec 033 onward).

**Alternatives considered**: N/A — exact match confirmed by direct grep/read.

## Decision: Planned Ship Date, Ship Confirmed Date, and Delivery Date columns are correctly labeled and mapped

**Rationale**: Planned Ship Date (line 93) maps `Ship_Date__c ?? gtherp__Ship_Date__c`, labeled correctly at line 505 — not mislabeled as a generic "Ship Date". Ship Confirmed Date (line 96) maps `Delivered_Date__c ?? gtherp__Delivered_Date__c`, labeled correctly at line 506 — critically, NOT mislabeled as "Ship Confirmation" (a mislabeling pattern seen and corrected in earlier features on other pages). Estimated Delivery Date and Actual Delivery Date (lines 97-98) are distinct fields with distinct columns (509-510, 628-629), not aliases of Planned/Confirmed Ship Date.

**Alternatives considered**: N/A — exact match confirmed by direct grep/read.

## Decision: Header/sticky-column/pagination/sort requirements are already correct

**Rationale**: Every `SortableHeader` (lines 484-510) has `truncate={false}` except the plain Action `<th>` (511-516), which uses a bare `truncate` class instead of `whitespace-nowrap` — explicitly out of scope since "Action" is a single short word that never wraps or truncates in practice. Sticky classes exist on both the header (484) and body cell (540) for the first column. `ITEMS_PER_PAGE = 10` (line 15) and the `Pagination` component (650-659) are present. `useSortableData(filteredShipments, { key: 'name', direction: 'desc' })` (line 202) confirms default Record ID DESC sort. `colSpan={28}` on the empty-state row (line 522) correctly matches the 28 rendered columns — no off-by-one bug, unlike feature 036's Inventory landing page.

**Alternatives considered**: N/A — exact match confirmed by direct grep/read; the one cosmetic Action-header note is documented as an accepted, out-of-scope non-issue.
