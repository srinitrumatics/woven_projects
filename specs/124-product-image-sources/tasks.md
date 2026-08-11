---

description: "Task list for Product Images Sourced from Algolia (Catalog) and Salesforce (Detail)"

---

# Tasks: Product Images Sourced from Algolia (Catalog) and Salesforce (Detail)

**Input**: Design documents from `/specs/124-product-image-sources/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the feature spec — no automated UI/component test framework covers `app/products/**` in this repo (Constitution Principle V). Verification is manual, via `quickstart.md`.

**Organization**: This feature has two Priority P1 user stories. They looked architecturally independent at planning time, but implementation surfaced a real gap in US1: the Salesforce→Postgres Load pipeline (`lib/product-load-service.ts`) had never actually populated `product2.image_url`, so US1 needed real code, not just verification. Both stories still touch disjoint files and can proceed in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/no file writes, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = Catalog/Algolia, US2 = Detail/Salesforce)

## Path Conventions

Next.js App Router (this project): `app/products/` (Catalog page), `app/products/[id]/` (Detail page), `lib/` (services). No new files, directories, or migrations for this feature — every task touches an existing file.

---

## Session Status (2026-08-11, updated after live-shape bug found and fixed)

**Resolved this session**: the real Salesforce field is `Product2.gtherp__Image_URL__c` (confirmed by the user), **and** its real shape — a JSON-serialized object `{"images":[{"isDisplay","isCover","sortOrder","thumb","url","id"}]}`, not a plain URL. This was found by inspecting the user's own live sync result in the `woven_products_infinitylocal` Algolia index, which showed corrupted `images` data: the first parser version only recognized a JSON *array*, not a JSON *object*, so the real value fell through to comma-delimiter parsing and got shredded. Fixed in both `parseImageEntries()` (`lib/product-load-service.ts`) and `parsePhotoUrls()` (`lib/products-service.ts`) — see `research.md` §3.

**Completed**: T001 (baseline re-read), T002 (Load pipeline fix, now shape-correct), T009 (Detail mapping, now shape-correct), T016 (typecheck clean).

**Not completed — all need a live app/Salesforce session**:
- T003–T007 (US1 Catalog live verification)
- **T008 — now the immediate next step**: the corrupted record(s) already in `woven_products_infinitylocal` need a fresh "Load Products" + "Index Products" run to overwrite with correctly-parsed data now that the parser is fixed. The user has taken this as their own action item.
- T010 (confirm the Apex REST endpoint actually returns `gtherp__Image_URL__c` in its response — still the one remaining unverified assumption for US2)
- T011 (Apex coordination, contingent on T010)
- T012–T015 (US2 Detail live verification)
- T017 (full quickstart pass)

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches the plan's assumptions before editing anything.

- [X] T001 Re-read `app/products/ProductClientPage.tsx` (`CardView` ~line 548, `ListView` ~line 680), `app/products/[id]/components/ProductGallery.tsx`, `lib/products-service.ts` (`mapSalesforceProductToLocal`), and `lib/product-salesforce-service.ts` (`getProductDetailsFromSalesforce`, line 63) to confirm all four still match the baseline documented in `research.md` and `data-model.md` before making changes.

**Checkpoint**: Baseline confirmed — proceed to either user story (they don't block each other).

---

## Phase 2: User Story 1 - Real product photos in the Catalog list, sourced from Algolia (Priority: P1)

**Goal**: The Catalog page (`/products`, card and list view) shows each product's real photo from its Algolia record instead of the generic package icon, wherever one exists.

**Independent Test**: Open the Catalog page in both card view and list view for a product known to have a photo indexed in Algolia, and confirm the real photo renders in the thumbnail position instead of the generic package icon.

### Implementation for User Story 1

- [X] T002 [US1] Fix the Salesforce→Postgres Load pipeline in `lib/product-load-service.ts`, which had never populated `product2.image_url` despite the Algolia-side read/transform code already expecting it (see `research.md` §1): added `gtherp__Image_URL__c` to `fetchAllProducts`'s SOQL; added a `parseImageUrls()`/`buildImageUrlJson()` helper pair that parses the field (single URL, delimited string, or JSON-array string) into the `{images: [{url}]}` shape `transform_sf_product_for_algolia` and `buildAlgoliaPayload` expect; added `image_url` to `COLUMNS`, `toRow`, and `buildUpsertQuery`'s `ON CONFLICT` SET clause; added the idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS image_url JSONB` guard matching the existing pattern for other columns.
- [ ] T003 [P] [US1] Using a test product whose Algolia record has a populated `image_url`/`images` value, manually verify Catalog **card view** renders the real photo instead of the 📦 placeholder — `quickstart.md` "Catalog page" step 2. Not run this session — needs a running app against live/test data.
- [ ] T004 [P] [US1] Using the same test product, manually verify Catalog **list view** renders the real photo instead of the SVG box placeholder — `quickstart.md` "Catalog page" step 3. Not run this session.
- [ ] T005 [P] [US1] Search/filter to bring up that same product and confirm its thumbnail is still correct in the filtered results — `quickstart.md` "Catalog page" step 4. Not run this session.
- [ ] T006 [P] [US1] Using a product known to have no Algolia photo, confirm the existing placeholder still renders cleanly in both views with no broken-image icon — `quickstart.md` "Catalog page" step 5. Not run this session.
- [ ] T007 [US1] If any of T003–T006 fail, fix the read logic in `app/products/ProductClientPage.tsx`; otherwise close as not-applicable — that side was already confirmed correct in T001. Depends on T003–T006.
- [ ] T008 [US1] **Operational, not code**: trigger a real "Load Products" run (via the admin sync UI/API this org already uses) against the live Salesforce org so already-loaded `product2` rows get `image_url` backfilled by T002's fix — new rows loaded going forward pick it up automatically, but rows loaded *before* this fix won't have it until Load runs again. Depends on T002.

**Checkpoint**: Catalog page shows real Algolia-sourced photos — independently testable and demoable (spec SC-001).

---

## Phase 3: User Story 2 - Real product photos on the Product Detail page, sourced from Salesforce (Priority: P1)

**Goal**: The Product Detail page's (`/products/[id]`) photo gallery shows each product's real photo(s) from Salesforce, including working navigation when there's more than one.

**Independent Test**: Open the detail page for a product known to have one or more photos in Salesforce and confirm the gallery (main image plus thumbnail strip) shows those real photos, including working next/previous navigation between them.

### Implementation for User Story 2

- [X] T009 [US2] In `lib/products-service.ts`, updated `mapSalesforceProductToLocal` to read `sfProduct.gtherp__Image_URL__c` (the confirmed real field — see `research.md` §3) via a new `parsePhotoUrls()` helper that handles a single URL, a JSON-array-shaped string, or a comma/semicolon-delimited string, falling back to `["/assets/product-placeholder.png"]` when empty — per `contracts/product-detail-images.md`.
- [X] T010 [US2] Called the live `product-details` Apex endpoint directly (account/contact from the `Infinity_local` org, product `01tEi00000NRMs1IAH` which has a confirmed real photo in Algolia) and inspected the raw response. **Finding**: the Apex endpoint strips the `gtherp__` namespace prefix from every custom-field key in its response (`Product_Availability__c`, `Available_To_Sell__c`, etc. — same pattern) — so the image field is present, but keyed as `Image_URL__c`, not `gtherp__Image_URL__c`. Confirmed the real Cloudinary JSON payload comes through correctly under that key.
- [X] T011 [US2] No Apex-side change needed — updated `mapSalesforceProductToLocal` (`lib/products-service.ts`) to read `sfProduct.gtherp__Image_URL__c ?? sfProduct.Image_URL__c`, matching the namespace-stripped key the Apex endpoint actually returns. Resolves the "product image not showing" bug on `/products/[id]`.
- [ ] T012 [P] [US2] Manually verify `ProductGallery.tsx` against the new mapping for a product with exactly one Salesforce photo: the gallery's main image shows it directly, no placeholder — `quickstart.md` "Product Detail page" step 1. Depends on T009 and T010.
- [ ] T013 [P] [US2] Manually verify `ProductGallery.tsx` against the new mapping for a product with multiple Salesforce photos: all appear in the thumbnail strip, thumbnail-click selection works, and prev/next arrows cycle through them — `quickstart.md` "Product Detail page" step 2. Depends on T009 and T010.
- [ ] T014 [P] [US2] Manually verify a product with no Salesforce photo still shows the existing placeholder in the gallery with no broken-image icon — `quickstart.md` "Product Detail page" step 3. Depends on T009 and T010.
- [ ] T015 [P] [US2] Manually verify the broken-image fallback: point a known product's photo URL at an invalid path and confirm `ProductGallery.tsx`'s existing `onError` handler (~line 67) falls back cleanly rather than showing a broken-image icon — `quickstart.md` "Fallback / edge case check" step. Depends on T009.

**Checkpoint**: Detail page shows real Salesforce-sourced photos with working gallery navigation — independently testable and demoable (spec SC-002).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final type-safety and end-to-end verification across both stories.

- [X] T016 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors introduced by the `lib/products-service.ts` and `lib/product-load-service.ts` changes. Depends on T002 and T009. Ran clean — no errors in either file.
- [ ] T017 Run `quickstart.md` end-to-end (Catalog + Detail + fallback checks) once both stories are complete, confirming spec SC-001, SC-002, and SC-003 (same photo per product's own source, consistent placeholder fallback everywhere). Depends on T007, T008, and T012–T015. Not run — blocked on the same live-access gaps as the rest.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends on Setup only. No dependency on User Story 2.
- **User Story 2 (Phase 3)**: Depends on Setup only. No dependency on User Story 1.
- **Polish (Phase 4)**: Depends on both stories' implementation tasks (T002+T007+T008, T009) being in place.

### User Story Dependencies

- **User Story 1 (P1)**: Independent — touches `lib/product-load-service.ts` (Load pipeline) and, if verification finds an issue, `app/products/ProductClientPage.tsx`.
- **User Story 2 (P1)**: Independent — touches `lib/products-service.ts` only. Internally blocked on T010 (confirming the Apex response actually surfaces the field) before the fix can be considered verified end-to-end.

### Within Each User Story

- **US1**: T002 (Load pipeline fix, done) → T003–T006 (live verification) → T007 (fix-if-needed) and T008 (backfill existing rows), the latter two independent of each other.
- **US2**: T009 (mapping code, done) → T010 (confirm Apex response) → [T011 if the field isn't exposed yet] → T012–T015 (verification, independent of each other).

### Parallel Opportunities

- T003, T004, T005, T006 (all US1, read-only observations) can run in parallel with each other and with all of US2's tasks — no shared files.
- T012, T013, T014, T015 (all US2, read-only observations against the same completed mapping) can run in parallel with each other.
- T007 and T008 (US1) are independent of each other once T003–T006 complete.
- T016 can run any time after T002/T009 land, independent of the manual verification tasks.
- The two user stories as a whole can be staffed and executed fully in parallel by two different people, since they touch entirely disjoint files.

---

## Parallel Example: Both User Stories Together

```bash
# Once Setup (T001) is done and both code fixes (T002, T009) are in, these can proceed concurrently:
Task: "Verify Catalog card view shows real Algolia photo"                # T003 [US1]
Task: "Trigger a real Load Products run to backfill existing rows"       # T008 [US1]
Task: "Confirm gtherp__Image_URL__c appears in the Apex REST response"   # T010 [US2]
```

---

## Implementation Strategy

### Both stories are P1 — code is done, live verification is the remaining critical path

1. Complete Phase 1: Setup.
2. **User Story 1**: code fix (T002) is done. What's left is operational (T008 — re-run Load for real data) and verification (T003–T007).
3. **User Story 2**: code fix (T009) is done. What's left is verifying the Apex endpoint actually surfaces the field (T010) — this is the one remaining real unknown in the whole feature — and downstream verification (T012–T015).
4. Complete Phase 4: Polish once both stories' verification tasks land.

### Incremental Delivery

1. Setup → both stories' code already in place.
2. Re-run "Load Products" for US1 (T008), then verify (T003–T007) → demo Catalog photos.
3. Verify T010 for US2, resolve T011 if needed, then verify (T012–T015) → demo Detail gallery photos.
4. Run the full `quickstart.md` pass and close out Polish.

## Notes

- No task in this feature creates a new file — every task edits or verifies an existing one, consistent with `plan.md`'s Structure Decision (no new architectural surface area), even though the Structure Decision itself was revised mid-implementation to include `lib/product-load-service.ts`.
- The Salesforce field name risk (originally the single highest-risk item in this feature) is resolved — confirmed by the org owner, not guessed. T010 is the one meaningfully unverified assumption left: that the Apex endpoint's response actually includes the field.
- Commit after each task or logical group (e.g., after T002 and T009 land together, before starting the live-verification pass).
