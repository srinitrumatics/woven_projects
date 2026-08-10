# Feature Specification: Consistent, Generic "No Search Results" Message on Landing Pages

**Feature Branch**: `120-search-empty-state-consistency`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "landing page datatable search no product message should be to same and for not specific and no need to show search key"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One consistent, generic message when a search/filter finds nothing (Priority: P1)

A user is browsing any landing page (Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory) and types a search term or applies a filter/tab that matches zero rows. Today, each page shows its own differently-worded, entity-specific message ("No orders found", "No Purchase Orders Found", "No products found matching your criteria.", etc.). Going forward, every landing page must show the exact same, generic wording in this situation, so the experience feels like one consistent product rather than nine different ones.

**Why this priority**: This is the core of the request — today there are at least nine distinct message strings across landing pages for what is functionally the same situation (a search/filter matched nothing). Fixing this alone delivers the requested consistency.

**Independent Test**: On each landing page listed above, type a search term guaranteed to match nothing, and separately apply a filter/tab guaranteed to match nothing. Confirm the exact same title text (and, where a description is shown, the exact same generic description text) appears on every page.

**Acceptance Scenarios**:

1. **Given** a user is on any landing page with a datatable and a search box, **When** they type a search term that matches no rows, **Then** the page shows the same generic "no results" title and description used by every other landing page.
2. **Given** a user is on any landing page with a datatable and a tab/status filter, **When** the selected filter matches no rows, **Then** the page shows that same generic "no results" message.
3. **Given** two different landing pages (e.g. Orders and Purchase Orders) are each searched with a term that matches nothing, **When** their empty states are compared, **Then** the title and description text are identical.

---

### User Story 2 - The message never repeats back what the user typed (Priority: P1)

A user searches for something on the Purchase Orders or Supplier Bills landing page and gets no matches. Today, those two pages echo the literal search text back in the message (e.g. "We couldn't find any results matching \"xyz\". Try a different search term."). This must stop — the message must never display, quote, or embed the user's typed search text anywhere, on any landing page.

**Why this priority**: Explicitly called out in the request ("no need to show search key") and is a concrete, currently-shipping behavior (on 2 of the 9 landing pages) that needs to be removed as part of the same consistency fix — it can't be separated from User Story 1 without leaving a known inconsistency in place.

**Independent Test**: On the Purchase Orders and Supplier Bills landing pages, search for an arbitrary/distinctive string (e.g. "zzz-no-match-zzz") that matches nothing, and confirm that exact string does not appear anywhere in the resulting empty-state message.

**Acceptance Scenarios**:

1. **Given** a user searches for a term that matches no rows, **When** the empty-state message is shown, **Then** the literal search term the user typed does not appear anywhere in the title or description text.
2. **Given** the Purchase Orders or Supplier Bills landing page specifically (the two pages that do this today), **When** a no-match search is performed, **Then** the message matches the same generic wording used on every other landing page (per User Story 1) instead of quoting the search term.

---

### Edge Cases

- What happens when a landing page has no data at all (e.g. a brand-new organization with zero orders) and the user hasn't searched or filtered anything? → Out of scope for this feature. That "genuinely empty dataset" message (e.g. "Get started by creating your first order") is a distinct, deliberately entity-specific onboarding message and is unaffected — only the "a search or filter was applied and matched nothing" case is being unified.
- What happens on the Products/Catalog page, whose card view currently renders its own empty-state text directly instead of using the shared message pattern the other landing pages use? → It must be brought in line with the same consistent, generic message as every other landing page for the searched/filtered-empty case.
- What happens if a user searches with a term containing special characters (quotes, HTML-like text)? → Not a special case once the term is never echoed back — since the message never includes the term at all, this class of concern doesn't arise.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a search or filter/tab selection on any landing-page datatable matches zero rows, the system MUST display the same message title across every landing page (Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory).
- **FR-002**: This shared message MUST be generic and MUST NOT name the specific record type (e.g. it must not say "orders" or "products" specifically) — it must read the same regardless of which page it appears on.
- **FR-003**: The shared message (title and any description shown with it) MUST NOT display, quote, or otherwise embed the literal text the user searched for.
- **FR-004**: This unified message applies whenever a search term is active, a filter/tab is active, or both — not only to one or the other.
- **FR-005**: The existing message shown when a landing page's underlying dataset is empty and no search or filter is active MUST remain unchanged (out of scope for this feature).
- **FR-006**: The Products/Catalog page's card view MUST show the same unified message as every other landing page for the searched/filtered-empty case, even though it does not currently share the same underlying display pattern as the other landing pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All landing-page datatables (9 of 9) display identical title text for the "search/filter matched nothing" case, verifiable by direct text comparison across pages.
- **SC-002**: 0 of 9 landing pages display the user's typed search term anywhere in the empty-state message (down from 2 today).
- **SC-003**: A user who encounters a no-results search on one landing page and then on a different one recognizes it as the same situation without needing to read entity-specific wording.

## Assumptions

- The unified message text is: title **"No matching records found"**, with description **"Try adjusting your search or filters."** — both are generic (name no entity type) and contain no reference to the user's input. Exact copy is a presentational detail that can be adjusted during implementation if a stakeholder prefers different wording, as long as it stays generic and echo-free.
- "Landing pages" in scope are the main list pages: Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, and Inventory. Detail-page sub-tabs (e.g. an order's line items tab) are out of scope for this feature since the request specifically calls out "landing page."
- The distinction already present on several pages between "no data at all" vs. "search/filter matched nothing" is preserved — only the wording used for the latter case is being unified; the former remains page-specific since it's a different (onboarding-oriented) message, not addressed by this request.
