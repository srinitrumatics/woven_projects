# Research: Save Tracking Number and Promise Date on Purchase Order Line

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No `NEEDS CLARIFICATION` markers were left in the Technical Context — this repo's existing conventions for Salesforce writes, page/route/service layering, and account/contact scoping already answer every open question for this feature. This document records those decisions and the alternatives considered.

## 1. Where does the write live: new endpoint vs. extending an existing one?

- **Decision**: Add a `PATCH` export to the existing `app/api/purchase-orders/route.ts` file (which currently only exports `GET`), and add a corresponding `patchPurchaseOrderLineInSalesforce()` function to the existing `lib/purchase-order-service.ts`.
- **Rationale**: Every other domain in this app pairs one route-handler file per resource with `GET`/`PATCH`/`POST` exports side by side in the same file (e.g., `app/api/salesforce/orders/route.ts` exports both `GET` and `PATCH`; `app/api/salesforce/product-details/route.ts` exports `GET`, `POST`, and `PATCH`). Matching this keeps the purchase-order write path discoverable next to its read path.
- **Alternatives considered**: A dedicated `app/api/purchase-orders/lines/route.ts` file was considered for a cleaner line-vs-order-level separation, but rejected — it would be the only resource in the app split this way, and the spec's scope (two fields on one line) doesn't justify a new route surface.

## 2. How is the Salesforce PATCH call shaped?

- **Decision**: Mirror `lib/product-salesforce-service.ts`'s `patchProductTabInSalesforce(payload)` — build the URL from `getSalesforceSession().instanceUrl` + the Apex REST resource path, call `fetchWithLogging()` with `method: "PATCH"`, `Authorization: Bearer <accessToken>`, `Content-Type: application/json`, and the caller-supplied JSON body; throw on a non-OK response after logging the response body for diagnosis.
- **Rationale**: This is the only existing PATCH-to-Salesforce pattern in the codebase and is already proven in production for an analogous single-record field update.
- **Alternatives considered**: Building a generic `patchSalesforceResource(path, payload)` helper in `lib/salesforce-service.ts` was considered to avoid near-duplicate PATCH functions across service files, but rejected for this feature — the existing product/order services don't share such a helper today either, and introducing one is a cross-cutting refactor outside this feature's scope (Constitution Principle V).

## 3. What triggers the save, and how does the UI expose it?

- **Decision**: Add a save affordance scoped to the two existing inputs in the Product Information card (e.g., a small inline "Save" control that appears once either field's value differs from the loaded line, or a per-field confirm), calling the new PATCH route only when at least one of the two fields has actually changed from its loaded value.
- **Rationale**: FR-001 requires a save path; Acceptance Scenario 3 of User Story 1 requires that an unmodified view never fires a save. Tracking a "dirty" comparison against the values set from `line.trackingNumber`/`line.promiseDate` on load (already captured in the existing `promiseDate`/`trackingNumber` state) is sufficient and requires no new state shape.
- **Alternatives considered**: Autosave-on-blur was considered but rejected — the spec explicitly scopes unsaved-edit loss on navigation to existing/unchanged behavior (Edge Cases), implying an explicit save step is expected, not implicit persistence on every blur.

## 4. How does the save request identify the correct line and tenant context?

- **Decision**: Send the line's existing `id` (already loaded and used to resolve `currentLineIndex`) as the record identifier, and `SF_ACCOUNT_ID`/`SF_CONTACT_ID` (already derived from `useUserSession()` at the top of `page.tsx`) as the account/contact context — identical to every other request already issued from this page.
- **Rationale**: FR-007 and FR-008 require unambiguous record targeting and consistent account/contact scoping; both values are already present in component state with no new derivation needed.
- **Alternatives considered**: None — this is the only account/contact source available to the page (Constitution Principle IV: org context must come from the authenticated session, never a client-supplied parameter).

## 5. How is a failed save surfaced without losing the user's input?

- **Decision**: On a non-success response (network failure, non-OK HTTP status, or a success-shaped-but-`success: false`/missing-updated-record response), show an inline error state near the fields and leave the input `value`s exactly as the user left them (do not reset to the last-saved `line.trackingNumber`/`line.promiseDate`).
- **Rationale**: FR-006 and User Story 3 require both a clear failure indication and retained unsaved input. Because the two fields are already controlled inputs bound to local state (not derived live from `line` after the initial load effect), simply not overwriting that state on failure satisfies retention with no new mechanism.
- **Alternatives considered**: A toast-only notification without inline state was considered but rejected in favor of also marking the field(s) visually (e.g., an error border/message) — a toast alone can be missed and doesn't anchor the failure to which field caused it.

## 6. Does this need a new RBAC permission?

- **Decision**: No new permission is introduced; the save action's reachability continues to be gated purely by `line.status` (Draft/Approved/Awarded), exactly as today's read-only/editable split already works.
- **Rationale**: See plan.md's Constitution Check and Complexity Tracking — neither sibling PATCH route in this codebase (orders, product-details) has a permission check today, so adding one only here would be inconsistent, one-off enforcement not requested by the spec.
- **Alternatives considered**: A new `po-line-update` permission gating the save control via `PermissionGate` was considered and rejected for this feature (see Complexity Tracking in plan.md); flagged as a reasonable follow-up for a cross-cutting RBAC hardening initiative.
