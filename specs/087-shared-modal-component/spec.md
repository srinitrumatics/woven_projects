# Feature Specification: Shared Accessible Modal Component

**Feature Branch**: `087-shared-modal-component`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Build a shared, accessible Modal component and migrate every existing modal-shaped element onto it. No shared Modal/Dialog component exists anywhere in this codebase today, and zero of the app's modals implement role=dialog, aria-modal, Escape-to-close, or a focus trap. Build the shared component on @radix-ui/react-dialog (new dependency, user-approved) rather than hand-rolling focus-trap/ARIA logic. Migrate: Products module's 4 modals (AddProductModal, AddToOrderModal, CertificationModal, DatasheetModal — currently 3 different radii, 2 shadow depths, 2 z-index values, inconsistent close-icon sizing, and 2 of the 4 have no isOpen prop at all); Locations/Delivery-Windows module's 2 modals (LocationModal, DeliveryWindowModal — the latter has dead non-functional animation classes); Shipments' TrackingTimelineModal (shell/accessibility only — its separate mock-data-fallback bug is out of scope); and a bonus-found unnamed inline modal in Product Catalog's image popup. Explicitly out of scope: the Sidebar's mobile navigation drawer (a different UI pattern), TrackingTimelineModal's data bug, and any visual redesign of modal content beyond the shared shell."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every dialog in the app behaves like a real, accessible dialog (Priority: P1)

A user interacting with any popup dialog in the app — whether adding a product, adding a certification, editing a location, or viewing tracking details — should be able to close it by pressing Escape, should have their keyboard focus stay trapped inside the dialog while it's open (not accidentally tab into the page behind it), and should have their focus correctly returned to what they were doing once the dialog closes. Screen reader users should be told they've entered a dialog and hear its title.

**Why this priority**: This is a foundational, cross-cutting capability with zero current support anywhere in the app — every dialog in the product currently fails basic keyboard and screen-reader expectations. Building this once, correctly, is the prerequisite for every other story in this feature.

**Independent Test**: Open any single dialog once migrated (e.g. Add Product), verify Escape closes it, verify Tab cycles only through elements inside the dialog, verify focus returns to the triggering button after close, and verify a screen reader announces dialog entry and its title.

**Acceptance Scenarios**:

1. **Given** a dialog is open, **When** the user presses Escape, **Then** the dialog closes.
2. **Given** a dialog is open, **When** the user presses Tab repeatedly, **Then** focus cycles only among the dialog's own interactive elements and never reaches content behind it.
3. **Given** a dialog was opened by clicking a button, **When** the dialog closes (via Escape, close button, or a completed action), **Then** keyboard focus returns to that triggering button.
4. **Given** a screen reader user opens a dialog, **When** it appears, **Then** the screen reader announces it as a dialog and reads its title.

---

### User Story 2 - Every modal in the app looks and feels like one consistent product (Priority: P1)

A user opening any modal anywhere in the app — across Products, Locations, Delivery Windows, Shipments, or Order Line product pickers — should see the same visual language: the same corner rounding, the same shadow depth, the same close-button style and position, and the same open/close animation, varying only in width to fit each dialog's content.

**Why this priority**: The audit's original finding — up to 3 different corner radii, 2 different shadow depths, 2 different z-index values, and inconsistent close-icon sizing across just the 4 Products-module modals alone — is a direct, highly visible product-polish gap. Tied for P1 with User Story 1 because both are delivered by the same underlying shared component.

**Independent Test**: Open each of the 4 Products-module modals back-to-back and confirm they share identical corner rounding, shadow depth, close-button style, and animation, differing only in width.

**Acceptance Scenarios**:

1. **Given** a user opens the Add Product modal and then the Add to Order modal, **When** comparing them, **Then** both share the same corner rounding, shadow depth, and close-button style.
2. **Given** any modal in the app, **When** it opens or closes, **Then** it uses the same enter/exit animation as every other modal.
3. **Given** a modal with more content (e.g. Add Product) versus one with less (e.g. Add to Order), **When** both are open, **Then** they differ only in width/size, not in shape, shadow, or close-button treatment.

---

### User Story 3 - Products module's 4 modals are migrated (Priority: P1)

Users adding or editing a product, adding a product to an order, adding/editing a certification, or adding/editing a datasheet all see the same consistent, accessible modal.

**Why this priority**: The single largest, most visually inconsistent group identified (4 modals, 3 different radii, 2 shadow depths, 2 z-index values) — the primary real-world proof that the shared component works across genuinely different content shapes (a large multi-field product form vs. a short confirmation-style dialog).

**Independent Test**: Exercise each of the 4 Products modals' existing functionality (create/edit a product, add to an order, add/edit a certification, add/edit a datasheet) and confirm each still works exactly as before, now inside the shared shell.

**Acceptance Scenarios**:

1. **Given** a user opens "Add Product" or "Edit Product", **When** they fill the form and save, **Then** the existing create/update behavior is unchanged.
2. **Given** a user opens "Add to Order" from a product page, **When** they choose an order and confirm, **Then** the existing add-to-order behavior is unchanged.
3. **Given** a user opens the Certification or Datasheet add/edit dialog, **When** they save, **Then** the existing save behavior is unchanged, and the dialog now responds correctly to being opened and closed via the same `isOpen`-style control used by every other modal in the app (previously, these two dialogs had no such control and relied on the parent page to mount/unmount them).

---

### User Story 4 - Locations and Delivery Windows modals are migrated (Priority: P2)

Administrators managing authorized locations and their delivery windows see the same consistent, accessible modal used everywhere else.

**Why this priority**: A smaller, lower-traffic admin-only surface than Products, but still a confirmed inconsistency (different radius/shadow/z-index between the two, plus one of them has dead animation code that currently does nothing).

**Independent Test**: Open the Location add/edit/view dialog and the Delivery Window add/edit dialog and confirm both now share the same shell, and that the delivery-window dialog's open/close animation now actually works (previously dead code).

**Acceptance Scenarios**:

1. **Given** an administrator adds, edits, or views a Location, **When** the dialog is open, **Then** it shares the same shell as every other migrated modal, and existing save/view behavior is unchanged.
2. **Given** an administrator adds or edits a Delivery Window, **When** the dialog opens or closes, **Then** it now animates using the shared component's real animation (not the previous non-functional CSS classes).

---

### User Story 5 - Tracking Timeline modal is migrated (Priority: P2)

A user viewing a shipment's tracking timeline sees the same consistent, accessible modal shell as everywhere else in the app.

**Why this priority**: One modal, moderate traffic (Shipments module). Scoped strictly to the shell — this modal's separate, already-known issue of falling back to placeholder tracking data when real data is absent is a different concern and is not addressed by this feature.

**Independent Test**: Open the Tracking Timeline modal and confirm it now shares the shared shell, while its content/data behavior is otherwise unchanged.

**Acceptance Scenarios**:

1. **Given** a user opens the Tracking Timeline modal, **When** it displays, **Then** it uses the shared modal shell (accessible, consistent styling), and its existing content/data logic is otherwise unchanged.

---

### User Story 6 - Product Catalog's image popup is migrated (Priority: P3)

A user viewing a larger product image from the catalog (via an image popup) gets the same accessible, consistent modal experience as every other dialog in the app.

**Why this priority**: Lowest priority — a single, simple, display-only popup not previously identified as a named "modal" in the original audit, found only through direct investigation. Included for completeness now that the shared component exists, since leaving one modal-shaped element unmigrated would defeat the purpose of the consolidation.

**Independent Test**: Open the image popup from Product Catalog and confirm it now behaves like every other migrated modal (Escape closes it, focus is trapped, consistent shell).

**Acceptance Scenarios**:

1. **Given** a user clicks a product image in the Order Line product catalog, **When** the enlarged image popup opens, **Then** it behaves like every other migrated modal (Escape to close, focus trap, consistent shell), while continuing to only display the image with no other change in content.

### Edge Cases

- What happens when a user opens a modal, then opens a second modal from within it (e.g. a nested confirmation)? The shared component must support this without breaking focus trapping for the topmost dialog.
- What happens if a modal is opened programmatically without a clear "triggering element" to return focus to (e.g. opened on page load)? Focus should land inside the dialog itself in that case, and closing it should not throw an error.
- What happens to the 2 modals that currently have no `isOpen` prop (Certification, Datasheet) if their parent page still tries to unconditionally render them? Their migration must include updating the parent call sites to pass a real `isOpen` value, not just adding an unused prop.
- What happens on very small (mobile) screens where a modal's set width is close to or larger than the viewport? The shared component must remain usable (scrollable content, doesn't overflow the viewport) at common mobile widths.
- What happens if a user clicks the backdrop outside a modal that previously did NOT support click-outside-to-close (3 of 8 modals did not)? Once migrated, all modals should behave consistently — this feature standardizes on one click-outside behavior for all migrated modals rather than preserving each one's previous inconsistent behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide one shared modal component used by every dialog in scope, replacing each dialog's individually hand-rolled overlay/container/header/close-button shell.
- **FR-002**: Every migrated modal MUST support closing via the Escape key.
- **FR-003**: Every migrated modal MUST trap keyboard focus within itself while open, and MUST return focus to the triggering element when closed.
- **FR-004**: Every migrated modal MUST be correctly announced to assistive technology as a dialog, including its title.
- **FR-005**: Every migrated modal MUST share the same corner rounding, shadow depth, close-button style/position, and open/close animation, varying only in width/size to fit its content.
- **FR-006**: Every migrated modal MUST support closing by clicking outside its content area, consistently (regardless of whether the original implementation had this behavior).
- **FR-007**: The Certification and Datasheet dialogs (currently with no open/close control of their own) MUST be updated to use the same `isOpen`-style control as every other modal in the app.
- **FR-008**: Migrating a modal to the shared component MUST NOT change any of its existing content, fields, validation, or save/submit behavior — only its shell (overlay, container, header, close button, animation, accessibility).
- **FR-009**: The Delivery Window modal's non-functional animation styling MUST be replaced with the shared component's real, working animation.
- **FR-010**: Migrating the Tracking Timeline modal MUST NOT address or change its separate, already-known mock-data-fallback behavior — that remains explicitly out of scope.
- **FR-011**: The Sidebar's mobile navigation drawer MUST NOT be migrated to the shared modal component — it is a categorically different UI pattern (a slide-out navigation drawer, not a dialog).
- **FR-012**: The shared modal component MUST remain usable (no content cut off or unreachable) at common mobile screen widths.

### Key Entities

- **Shared Modal component**: The single reusable dialog shell every migrated modal renders through — owns overlay, container styling, header/title/close-button, footer slot for actions, focus trapping, Escape handling, and accessibility attributes.
- **Migrated modal (×8)**: AddProductModal, AddToOrderModal, CertificationModal, DatasheetModal, LocationModal, DeliveryWindowModal, TrackingTimelineModal, and Product Catalog's image popup — each retains its own content/fields/save-logic but delegates its shell to the shared component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 8 in-scope modals close via the Escape key.
- **SC-002**: 100% of the 8 in-scope modals trap keyboard focus while open and correctly return focus on close.
- **SC-003**: 100% of the 8 in-scope modals are announced as dialogs (with title) to assistive technology.
- **SC-004**: 100% of the 8 in-scope modals share identical corner rounding, shadow depth, close-button style, and animation — verified by direct visual comparison across all 8.
- **SC-005**: 0 regressions in existing save/submit/content behavior across all 8 migrated modals, verified by exercising each modal's existing core action (create/edit/save/view/close).
- **SC-006**: 100% of the 8 modals remain fully usable at common mobile viewport widths.
- **SC-007**: 0 remaining hand-rolled modal overlay implementations for the 8 in-scope modals (each fully delegates its shell to the shared component).

## Assumptions

- The shared component is built on `@radix-ui/react-dialog` (an unstyled, accessible dialog primitive), per explicit user decision — chosen over hand-rolling focus-trap/ARIA logic, since no such library exists in this codebase today and correctness in this area is easy to get wrong without one.
- The shared component uses the app's already-installed `lucide-react` icon library for its standardized close button, since neither of the app's 2 installed icon libraries is currently used consistently for this purpose across the 8 existing modals.
- Enter/exit animation may be implemented via the already-installed `framer-motion`, or via Radix's own open/closed state data attributes with CSS transitions — whichever the implementation finds more maintainable; the user-facing requirement (FR-005, consistent animation) does not mandate a specific mechanism.
- `components/layouts/Sidebar.tsx`'s mobile navigation drawer is explicitly excluded (FR-011) — it is a different UI pattern (a persistent slide-out panel, not a transient dialog) despite sharing a similar backdrop-overlay visual technique.
- `TrackingTimelineModal`'s separate, already-known mock-data-fallback bug is explicitly excluded (FR-010) — this feature touches only its shell/accessibility, not its data-fetching or fallback logic.
- Migrating the Certification and Datasheet dialogs to accept an `isOpen` prop requires small updates to their parent page's call sites (to pass a real open/closed value instead of relying on conditional mounting) — this is included as part of their migration, not a separate feature.
- No visual redesign of any modal's internal content/fields is in scope — only the shared shell (overlay, container, header, close button, footer slot, animation, accessibility) changes; each modal's form fields, validation, and business logic are preserved as-is.
- No database, Salesforce, or business-logic changes are required — this is a presentation-layer component consolidation plus one new frontend dependency.
