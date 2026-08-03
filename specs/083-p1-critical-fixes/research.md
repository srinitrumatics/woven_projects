# Phase 0 Research: P1 Critical Fixes (UI/UX Consistency Audit)

No `[NEEDS CLARIFICATION]` markers remain in the spec. This phase documents the codebase investigation that grounded the plan, including two findings that changed scope from the original audit text (confirmed with the user before proceeding).

## 1. Sign Up password leak via `title` attribute

**Decision**: Remove the `title={String(formData.<field> ?? '')}` binding from all 5 inputs in `components/SignUpForm.tsx` (name, surname, email, password, confirmPassword — lines 222, 239, 257, 276, 302), not just the two password fields.

**Investigation**: Every text input in this form has the identical copy-pasted pattern `title={String(formData.X ?? '')}` bound to live state. The audit and this spec's security concern (FR-001/002) center on the password/confirm-password fields (lines 276, 302), since those expose a sensitive value via hover tooltip and the accessibility tree. The name/surname/email fields (222, 239, 257) carry the exact same defect pattern, just with non-sensitive data — leaving them in place would be an inconsistent partial fix of one copy-pasted bug in one file.

**Rationale**: Same file, same one-line-per-input defect, zero behavior change (the `title` attribute serves no functional purpose here — labels are separately provided via `<label htmlFor>` with `sr-only`, and native placeholder text remains untouched). Removing all 5 is not scope creep; it's finishing one bug fix in one file rather than leaving 3/5 instances of it.

**Alternatives considered**: Only touching the 2 password fields named in the audit — rejected, since it leaves an identical dead/leaky attribute pattern sitting in the same file for no reason, and the spec's FR-003 ("all other Sign Up field behavior... MUST remain unchanged") is unaffected either way since `title` isn't functional behavior.

## 2. Invoice Detail "Pay Now" CTA — dropped from scope

**Decision**: This finding is entirely excluded from spec 083, per explicit user confirmation ("no payment handling happens in this app").

**Investigation**: `app/invoices/[id]/components/InvoiceDetails.tsx` line 100 defines `const handleMakePayment = () => {};` — a no-op stub, not a working payment flow as the audit assumed ("handler already exists"). `handleDownloadPDF` (line 98) is an identical no-op. A codebase-wide search for any payment-gateway integration (Stripe, Braintree, Authorize.net, a checkout/session concept) found none. The only "payment" references anywhere are `lib/invoice-service.ts` and `app/api/salesforce/invoices/route.ts`, both of which only fetch a read-only "Payments" tab of historical payment records from Salesforce — there is no code path anywhere that could submit a new payment.

**Rationale**: Adding a visible "Pay Now" button wired to a no-op (or to a fabricated placeholder flow that looks like it processes payment) would ship exactly the kind of misleading fake-functionality UI the audit itself flags as a defect elsewhere (§15 — placeholder image carousels, mock tracking data). Per the user's explicit decision, no CTA — real or placeholder — is added. This is tracked as a separate, deferred product decision (a real payment gateway would need to be chosen first), not part of this UI-fix batch.

**Alternatives considered**:
- Placeholder CTA (e.g. "contact your account team to pay") — offered to the user as an option, explicitly declined.
- Linking to an existing hosted payment page — offered to the user as an option; user confirmed none exists.

## 3. Supplier Bill Detail `productLineCount: 100` bug

**Decision**: Delete the hardcoded override block in `app/supplier-bills/[id]/page.tsx` (lines 136–146) that stomps the already-correct values fetched from the bill record.

**Investigation**: The bill's initial mapping (line 99) already sets `productLineCount: b.Total_Product_Lines__c || b.Total_Lines__c || 0` — a real, correct value read from Salesforce. After lines are fetched, a second `setBill` call unconditionally overwrites it: `productLineCount: 100` (literal, ignoring the real Salesforce field entirely) and `serviceLineCount: Math.floor(mappedLines.length / 2)` (an arbitrary halving of the total line count, not a real product/service split — `Supplier_Bill_Line__c` records have no field distinguishing "product" vs. "service" lines in the mapped shape at lines 103–133). Both look like leftover debug/placeholder code, not a deliberate recomputation.

**Rationale**: The correct fix is to simply not clobber the value that was already fetched correctly — there is no PO Detail "pattern to mirror" as the audit assumed (`app/purchase-orders/[id]/page.tsx` has no equivalent `productLineCount`/line-count-recomputation logic at all; grep confirmed zero matches). Deleting the override block is the minimal, correct fix: it restores trust in the Salesforce-sourced count without inventing a new client-side computation that has no real data to back it (no product/service distinction exists in the line data).

**Alternatives considered**: Recomputing `productLineCount` as `mappedLines.length` (total line count) — rejected, since the bill record already provides this correctly from Salesforce (single source of truth per Constitution Principle I), and overwriting it with a client-side recount would be redundant and could disagree with the server value if lines are paginated/filtered differently than the summary field expects.

## 4. Orders List stat-card filter mismatch

**Decision**: Introduce one shared category-matching predicate in `app/orders/page.tsx`, used both to compute each stat card's count and to filter the table when that card is clicked — replacing the current single exact-match check `order.status === activeTab`.

**Investigation**: `stats` (lines 161–190) computes four categories via genuinely different predicates:
- `totalOrders` ("Total" card): `["Submitted", "Approved", "Closed"].includes(status)` — an aggregate of 3 statuses.
- `draftCount` ("Draft" card): `status === "Draft"` — a single literal status.
- `pendingCount` ("Pending/Submitted" card): `status === "Pending" || status === "Submitted"` — 2 statuses.
- `fulfilledCount` ("Fulfilled/Success" card): `status === "Success" || status === "Approved" || status === "Delivered"` — 3 statuses.

But `filteredAndSearchedOrders` (line 196) always does `order.status === activeTab` — a single exact-string match against whatever tab key was clicked (`"Total"`, `"Draft"`, `"Pending"`, or `"Success"`, set by `handleCardClick`, line 542). Since `"Total"` and `"Success"` are never real values of `order.status` (they're card labels standing in for an aggregate), clicking those cards always yields an empty table — the exact bug the audit flagged. `"Pending"` partially works (catches literal `"Pending"` orders) but silently drops the `"Submitted"` orders the card itself counted. `"Draft"` is the only card that happens to work today, because its card label and its single matching status are the same string.

**Rationale**: A single shared predicate function eliminates the class of bug entirely — the count and the filter can never disagree again, because they're driven by the same logic. This also naturally extends to the free-text status-pill row below the stat cards (line 845, `uniqueStatuses.map(status => ...)`), which already passes real literal `order.status` values as `activeTab` and must keep working via a fallback exact-match case.

**Alternatives considered**: Patching only the "Total" and "Success" cards' filter cases with one-off `if` branches inline in `filteredAndSearchedOrders` — rejected in favor of one named predicate, since the count logic and filter logic living in two separate places is exactly what caused this bug in the first place; a shared function structurally prevents the two from drifting apart again.

## 5. Shipments List "Partial Shipment" active-state bug

**Decision**: Fix the single wrong string comparison at `app/shipments/page.tsx` line 325.

**Investigation**: The "Partial Shipment" stat card's outer `<button>` className (line 325) checks `activeTab === "Pending"` to decide its border/ring active styling, while every other visual signal on the same card — the icon bubble background at line 351, and the click handler `onClick={() => handleCardClick("Partial Shipment")}` at line 323 — correctly reference `"Partial Shipment"`. `stats.partialCount`/`stats.partialValue` (lines 126–127, 140) are already computed correctly from a real `partialShipment` array; this is purely a single stray copy-paste of a neighboring card's check (the "Pending" comparison appears to have been copied from a different card and never updated for this one), not a data or filtering bug.

**Rationale**: One-line fix: change `activeTab === "Pending"` to `activeTab === "Partial Shipment"` at line 325, matching the already-correct check at line 351.

**Alternatives considered**: None — this is an unambiguous single-line typo fix with no design decision involved.

## 6. Purchase Order Line Detail / Supplier Bill Line Detail case-sensitive StatusBadge — already resolved

**Decision**: No code change. Retained in the spec as a verification-only story (User Story 5).

**Investigation**: The audit (citing `app/purchase-orders/[id]/lines/[lineid]/page.tsx:670-694` and 3 sibling files) describes local, case-sensitive status-badge switch statements. Direct inspection of the current codebase found:
- `app/purchase-orders/[id]/lines/[lineid]/page.tsx` line 220 (Supplier Bill Line Detail's own page — see below) and its PO counterpart both import and render the shared `components/ui/StatusBadge.tsx` (case-insensitive — confirmed by reading its implementation, which lowercases the input at the top of `getStyles()`).
- All 4 sub-tab files that render line-level statuses in this area — `PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, `SBLDebitMemoLinesTab.tsx` — import `StatusBadge` from `@/components/ui/StatusBadge` and use it directly (`<StatusBadge status={line.Status__c || '-'} variant="bordered" />` or equivalent).
- A codebase-wide grep for any remaining case-sensitive status `switch`/`case` blocks (`case "Draft":`, `case "Approved":`, `case "Received":`) returned zero matches anywhere in `app/`.

**Rationale**: This finding was already remediated by the prior `079`–`081` shared-StatusBadge consolidation specs (per project memory: `079-shared-status-badge`, `080-status-badge-audit`, `081-line-detail-status-badges` all specifically targeted this class of bug across PO/Supplier Bill line details). The audit document appears to predate that work landing, or missed that these particular files were already covered. Re-implementing a fix here would be redundant; the risk now is regression, not the original bug, so this is scoped as verification (confirm still-compliant, confirm no stray local copy was reintroduced) rather than a rewrite.

**Alternatives considered**: Re-auditing the entire PO/Supplier Bill module tree for any other stray local StatusBadge implementation beyond the 4 files the audit named — out of scope for this P1 spec (would duplicate the already-completed `080`-style full-module audit); if the user wants that broader re-audit, it belongs in a dedicated follow-up spec, not bundled into this fix batch.

## 7. Sibling deployment folders

**Decision**: Not part of `tasks.md`'s automated scope. Per established project convention (see prior specs `077`–`082`), propagation of these fixes to the four sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) is a separate, explicitly user-gated step performed after this feature is verified in `woven_projects-main`, not before.

**Rationale**: Consistent with how every prior status-badge/line-fix spec in this repo has operated — implement and verify in `woven_projects-main` first, then diff-before-copy/typecheck/ask-before-commit into the siblings only when the user asks.
