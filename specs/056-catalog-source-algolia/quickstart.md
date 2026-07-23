# Quickstart: Validate Configure Order Catalog Sourced from Algolia

## Prerequisites

- Repo dependencies installed (`npm install`).
- Algolia credentials configured (`ALGOLIA_APP_ID`/`NEXT_PUBLIC_ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`) and the org's index already populated by the existing sync pipeline — the same index the main Products page (`/products`) already reads from. If the Products page shows real products today, the same index is usable here.
- Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) — needed for the add-time qty/MOQ lookup (`/api/salesforce/product-details`) — or rely on the app's mock-data fallback if credentials are absent.
- A logged-in session against the main portal (Configure Order is behind the Salesforce session middleware).
- At least one product present in **both** the Algolia index and Salesforce, with a known `MOQ__c` value, and ideally one product that exists in Salesforce but is not (yet) indexed in Algolia, and vice versa, to exercise the edge cases below.

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session
npm run dev
```

Navigate to `http://localhost:3000/configure` (login first via `/auth` if redirected).

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Browse Catalog list comes from the search index** (User Story 1)
   - Open browser devtools → Network tab.
   - Open the Configure Order page and expand the Browse Catalog panel.
   - Confirm no request to `/api/salesforce/orders?action=products` fires; confirm a request to the Algolia index (`*.algolia.net` / `*.algolianet.com`) fires instead.
   - Type a known product name into "Search catalog...". Confirm the list filters to matching results.

2. **Quick-add dropdown also comes from the search index** (User Story 1, Assumptions)
   - Type into the "Quick add product..." field. Confirm matching suggestions appear and are sourced the same way (no Salesforce catalog call).

3. **Adding via "+" populates accurate qty/MOQ from Salesforce** (User Story 2)
   - In the Browse Catalog panel, click the "+" control on a product with a known Salesforce MOQ.
   - Confirm a brief loading indication, then confirm the new Lines table row shows Qty equal to that product's actual `MOQ__c` from Salesforce (not a value from the search index).
   - Cross-check against that product's MOQ on `/products` (or Salesforce directly) to confirm they match.

4. **Adding via drag-and-drop matches the "+" path** (User Story 2)
   - Drag a different catalog item onto the Lines table.
   - Confirm the resulting line's Qty/MOQ matches its Salesforce record, same as Scenario 3.

5. **Existing MOQ stepper still works unchanged** (User Story 3)
   - On either line added above, click the increase/decrease controls.
   - Confirm they still step by that product's MOQ and floor at MOQ, exactly as before this feature (spec 053 behavior).

6. **Stale-index protection** (User Story 2, Edge Cases)
   - If possible, change a product's `MOQ__c` in Salesforce without re-running the Algolia sync.
   - Add that product from Browse Catalog. Confirm the new line reflects the updated Salesforce MOQ, not whatever the (now stale) index might imply.

7. **Deleted/unresolvable product handling** (FR-007, Edge Cases)
   - Using a product known to be indexed in Algolia but removed/deactivated in Salesforce (or simulate by testing with an invalid product ID), attempt to add it.
   - Confirm a clear error toast appears and no line is added to the table.

8. **Order flow is otherwise unchanged** (User Story 3, SC-003)
   - Complete a full order build: add 2+ products, adjust quantities, add a group, reorder a line via drag, and click "Create Order".
   - Confirm the order is created successfully and the resulting order's lines match what was shown in the Configure Order table, exactly as before this feature.

## Expected outcome

All eight scenarios pass with no console errors. The Browse Catalog panel and quick-add dropdown never call the Salesforce bulk products endpoint; every order line's qty/MOQ is verifiably sourced from Salesforce at add-time; and every downstream behavior (stepper, drag-and-drop, grouping, submission) is unchanged from before this feature. Since this repo has no automated component test runner, this manual pass through `npm run dev` in a browser is the primary verification method (see Technical Context / Testing in `plan.md`).
