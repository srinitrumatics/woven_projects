# Research: Fulfillment Tab Navigation Links — Proposals & Customer Quotes

## Decision 1: NSO Account Type String Value

**Decision**: Use `'NSO'` (uppercase) as the raw `Account_Record_Type__c` comparison string.

**Rationale**: Confirmed by direct inspection of `lib/permissions.ts:9`:
```ts
if (accountType === 'Customer' || accountType === 'NSO') return 'Customer';
```
And corroborated in `app/proposals/page.tsx:170`, `app/proposals/[id]/page.tsx:91`, `app/orders/[id]/components/ReturnsTab.tsx:92`, and `app/quotes/[id]/components/QuoteReturnsTab.tsx:27`.

**Alternatives considered**: Using the mapped category (`'Customer'` from `getCategoryFromAccountType`) — rejected because `FulfillmentTab.tsx` already uses raw `accountType` string comparisons for Shipments/Invoices (`accountType === 'Customer'`, `accountType === 'Hybrid'`), and NSO must be checked separately as it is not equal to the string `'Customer'`.

---

## Decision 2: Page Accessibility for Customer/NSO/Hybrid Users

**Decision**: Add links for Customer, NSO, and Hybrid users to `/proposals/{Id}` and `/quotes/{Id}` without adding any route-level guards.

**Rationale**: `middleware.ts` protects all main portal routes by session cookie only — no account-type filtering at the middleware layer. Authenticated users of any type can navigate directly to `/proposals/{id}` and `/quotes/{id}`. This is the existing design: proposal/quote pages have their own internal `isRestricted` guards (e.g. `isRestricted = accountType === 'Customer' || accountType === 'NSO'`) that hide vendor-facing tabs without blocking page access.

The sidebar intentionally hides the Proposals and Quotes nav items for Customer/NSO/Hybrid (`visibleFor: [""]`), but this does not prevent direct navigation — it only removes the nav shortcut. Adding clickable links in FulfillmentTab follows the same existing pattern as the Links to Shipments/Invoices added in feature 010 (those pages are visible in the sidebar for Customer/Hybrid but not for NSO).

**Alternatives considered**: Adding middleware or page-level account-type guards before enabling links — rejected because it would duplicate existing `isRestricted` logic and add unnecessary complexity. The spec (FR-008) already mandates that the permission check derive from the authenticated session, which it does via `useUserSession`.

---

## Decision 3: Implementation Approach — Raw Account Type vs. Category Function

**Decision**: Use raw `accountType` string comparisons (`accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid'`), not `getCategoryFromAccountType()`.

**Rationale**: Consistent with the existing code in `FulfillmentTab.tsx` (lines 127–128 for Shipments/Invoices use raw string comparisons). Using the category function would silently include future account types that map to `'Customer'` or `'Hybrid'`, which may not be intended. Explicit string comparisons are clearer and predictable.

**Alternatives considered**: `getCategoryFromAccountType(accountType) !== 'Partner'` — rejected as overly broad (would include unknown/future types) and inconsistent with surrounding code.

---

## Scope Confirmation

This feature requires **no changes** to:
- API routes (`/api/salesforce/orders`)
- Data model or database schema
- Sidebar `visibleFor` configuration (that is a separate concern and out of scope)
- Proposal or quote detail pages themselves
- Any other component beyond `FulfillmentTab.tsx`
