# Research: Shipping Manifest Line Page — Corrections

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature has no unresolved unknowns. This document records the audit findings that resolved every open question before planning began.

## Decision: Fix Inventory Positions tab's "Location" to fall back through `item.Location` first

**Rationale**: `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx:60` currently sources `inventoryLocation: item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || ""` — three field-name guesses, none of which is the field the Inventory Landing Page's own detail view (`app/inventory/[id]/page.tsx:65-66,225,255`) actually uses: a single raw field literally named `Location`, rendered directly as `item.Location` with no mapping at all. This is the exact same bug already found and fixed at the parent shipping-manifest level in spec 038 (`app/shipments/[id]/components/InventoryTab.tsx:63`, changed from `raw.Inventory_Location_Name || ""` to `raw.Location || raw.Inventory_Location_Name || ""`), but that fix was scoped to the manifest-level tab only and was never propagated to this line-level tab, which has its own separate component and its own separate (and even more divergent) field-mapping guess.

**Alternatives considered**: Leaving all three existing fallback fields in place and only prepending `item.Location` — chosen, since it preserves any existing behavior for records where `Location` happens to be absent but one of the other three fields is populated, while making the primary path match the landing page exactly for the common case (the same conservative approach taken in spec 038). Removing the three existing fallback fields entirely — rejected, no evidence they are always redundant with `Location` in every underlying API response shape, and removing them risks regressing any record where `Location` is absent.

## Decision: Everything else is verification-only, zero further code changes

**Rationale**: A background audit agent directly inspected both tab components against both the prior spec (`specs/029-shipping-manifest-line-corrections/spec.md`) and this request's exact column lists, using the newly-corrected manifest-level tab and the Inventory Landing Page as reference conventions. Confirmed already correct: column order/labels on both tabs; Product Name hyperlink on the Inventory Positions tab; Product Name and Shipping Manifest # hyperlinks on the Serial Number Logs tab; Brand Name mappings on both tabs (`gtherp__Brand_Name__c || Brand_Name__c`); sticky first column, full-text single-line headers (`truncate={false}`), `Pagination` (10/page), and ascending default sort (`{key:'name', direction:'asc'}`) on both tabs.

**Alternatives considered**: Treating the full request as corrective work by default was rejected because it would introduce unnecessary code churn on a tab/columns confirmed to already be correct — violating Constitution Principle V (Simplicity & Phase-Driven Scope, "No speculative rework").

## Out of scope: unused mapped fields on the Serial Number Logs tab

**Rationale**: The audit noted the Serial Number Logs tab's mapping object computes several fields (`shippingManifestLine`, `shipDate`, `shipToAccount`, `active`) that are never rendered as columns — dead data, harmless, and not part of the user's explicit request. Left uncorrected since removing them provides no functional benefit and is out of scope for this feature; can be raised as a follow-up cleanup if desired.
