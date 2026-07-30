# Feature Specification: Consistent Product Catalog Freshness Across Configure & Order Views

**Feature Branch**: `073-fix-stale-catalog-sync`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "after update algolia index the chnages reflect in app/products/page.tsx page. but the changes is not reflect in app/configure/page.tsx and app/orders/[id]/components/productcatalog.tsx"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Add on the Configure page shows current catalog data (Priority: P1)

A sales rep is building or editing an order on the Configure page and uses Quick Add to search the catalog for a product. Product information (price, stock/availability, brand, etc.) has recently changed and the catalog sync has completed. The rep expects Quick Add to show the same up-to-date information they would see on the Products page.

**Why this priority**: Configure is the primary screen for assembling orders. If Quick Add shows outdated price or stock, reps can add products at the wrong price or promise stock that no longer exists — a direct, order-accuracy risk. This is the most severe instance of the reported problem.

**Independent Test**: Change a product's price/stock and let the catalog sync complete. Open the Configure page and search for that product in Quick Add. The updated value must appear without any special workaround (hard refresh, clearing cache, restarting the app).

**Acceptance Scenarios**:

1. **Given** a product's price or stock has changed and the catalog sync has completed, **When** a user opens the Configure page and searches for that product in Quick Add, **Then** the current (post-sync) value is displayed.
2. **Given** the Configure page was already open before the sync completed, **When** the user reopens or re-triggers the Quick Add search, **Then** the current (post-sync) value is displayed.
3. **Given** a product shown in Quick Add and the same product shown on the Products page, **When** both are viewed at the same point in time, **Then** they display identical catalog data.

---

### User Story 2 - Order detail Product Catalog shows current catalog data (Priority: P2)

A user viewing an existing order opens the Product Catalog view (`app/orders/[id]/components/productcatalog.tsx`) to add or compare products. As with Quick Add, they expect the displayed data to reflect the latest catalog sync, not a snapshot taken when the order page first loaded.

**Why this priority**: Adding products to an existing order carries the same accuracy risk as Story 1, but it's a less frequently used path than Configure, and typically affects one order at a time rather than a whole new order build.

**Independent Test**: Change a product's price/stock and let the catalog sync complete. Open an order's detail page and view its Product Catalog. The updated value must appear without a workaround.

**Acceptance Scenarios**:

1. **Given** a product's price or stock has changed and the catalog sync has completed, **When** a user opens an order's Product Catalog view, **Then** the current (post-sync) value is displayed.
2. **Given** an order's Product Catalog was loaded before a sync completed, **When** the user navigates back to that tab/view or triggers a refresh, **Then** the current (post-sync) value is displayed.

---

### User Story 3 - Consistent freshness behavior across all catalog surfaces (Priority: P3)

Support staff and users should never need to know or care that Products, Configure, and Order Product Catalog are three different screens — all three should behave the same way with respect to reflecting catalog updates, so nobody has to learn or apply a special "trick" (hard refresh, logout/login, clearing cache) to see current data on any one of them.

**Why this priority**: This is a polish/trust outcome that falls out of fixing Stories 1 and 2, but is worth stating explicitly so the fix isn't considered "done" if only one of the two broken surfaces is addressed, or if the fix only works after unusual troubleshooting steps.

**Independent Test**: After implementing fixes, ask a user unfamiliar with the internals to update a product, then check all three surfaces (Products, Configure Quick Add, Order Product Catalog) using only normal navigation (no dev tools, no hard refresh). All three must show the update.

**Acceptance Scenarios**:

1. **Given** a catalog update has synced, **When** a user checks Products, Configure, and an order's Product Catalog in any order using normal navigation, **Then** all three show the same current data for the affected product.

---

### Edge Cases

- What happens if a user views Configure or an order's Product Catalog while a catalog sync is still in progress? They see the data as of the most recently *completed* sync — this is expected and out of scope for this fix (sync latency itself is a separate, existing concern).
- How does the system handle a failed refresh attempt (e.g., the catalog service is temporarily unreachable)? The previously displayed data must remain visible, and the user must be informed the refresh did not succeed, rather than being shown a blank or broken view.
- What happens if a user keeps the Configure page or an order's Product Catalog open in a browser tab for a long time without navigating away or interacting with it? Continuous background updating while the view sits idle is not required (see Assumptions) — freshness is guaranteed at the point the user opens or re-engages with the view.
- What happens when multiple browser tabs/sessions have Configure or an order open at the same time? Each independently fetches current data when opened/re-engaged; there is no cross-tab data sharing requirement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Configure page's Quick Add catalog data MUST be fetched fresh (reflecting the latest completed catalog sync) each time the Quick Add search is opened or (re)activated, rather than reusing data fetched earlier in the same session.
- **FR-002**: The order detail Product Catalog view MUST be fetched fresh (reflecting the latest completed catalog sync) each time it is opened or navigated back to, rather than reusing data fetched earlier in the same session.
- **FR-003**: For a given product at a given point in time, Quick Add, the order detail Product Catalog, and the Products page MUST display the same catalog values (price, stock/availability, and other synced fields).
- **FR-004**: Users MUST be able to manually refresh the catalog data shown in Configure's Quick Add and in the order detail Product Catalog without reloading the entire application or page.
- **FR-005**: If a catalog data refresh fails, the system MUST keep showing the last successfully loaded data and MUST notify the user that the refresh failed, rather than clearing the view or showing an error in place of data.
- **FR-006**: Users MUST NOT need to perform a full browser refresh, clear their cache, or restart the application to see catalog updates on Configure or the order detail Product Catalog.

### Key Entities *(include if feature involves data)*

- **Catalog Entry**: A single product's synced, user-visible attributes (e.g., name, price, stock/availability, brand) as currently reflected in the catalog index. Consumed identically by the Products page, Configure's Quick Add, and the order detail Product Catalog.
- **Catalog View**: Any screen/panel that displays Catalog Entries to the user — Products page, Configure Quick Add, order detail Product Catalog — each of which must independently guarantee freshness per FR-001/FR-002.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user opening the Configure page after a catalog sync sees updated product data on the first view, with no manual workaround, 100% of tested cases.
- **SC-002**: A user opening an order's Product Catalog view after a catalog sync sees updated product data on the first view, with no manual workaround, 100% of tested cases.
- **SC-003**: For the same product, data shown on Products, Configure Quick Add, and order detail Product Catalog matches at the same point in time, with no perceptible extra delay compared to the Products page.
- **SC-004**: Reports of "stale" or "outdated" product data on Configure or order pages drop to zero after rollout.

## Assumptions

- The process that populates the catalog index from the source system (the sync itself) already works and completes before a user views the affected screens; this feature is about how Configure and the order detail Product Catalog *consume and display* already-synced data, not about the sync pipeline's speed or reliability.
- "Freshness parity" means matching the Products page's existing behavior of always fetching current data whenever a view is opened or a search/interaction is (re)triggered — it does not require continuously polling or auto-updating a view that a user is not actively interacting with.
- A user is expected to take some ordinary action (open the page, open/re-run Quick Add search, revisit a tab, or use a refresh control) to see updated data. A view is not required to change on its own while left idle and untouched.
- Both affected views already have an existing mechanism for retrieving catalog data (whether a direct query or a backing API); this fix changes when/how often that mechanism is invoked, not the underlying data source.
