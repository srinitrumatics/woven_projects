# Implementation Plan: Product Images Sourced from Algolia (Catalog) and Salesforce (Detail)

**Branch**: `124-product-image-sources` | **Date**: 2026-08-11 (re-planned; no spec or code changes since original plan) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/124-product-image-sources/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace generic placeholder icons/images on two existing pages with real product photos, each drawn from `Product2.gtherp__Image_URL__c` in Salesforce but reaching the UI via two different existing paths: the Detail page (`app/products/[id]/page.tsx`) reads it directly through the existing Apex REST product-details call, mapped via `mapSalesforceProductToLocal` into the already-built `ProductGallery` component; the Catalog page (`app/products/page.tsx` → `ProductClientPage.tsx`) reads it indirectly via the existing Salesforce→Postgres Load pipeline → `product2.image_url` → an existing DB trigger that auto-syncs to Algolia. No new endpoints, no schema changes, no new sync mechanism — every piece of infrastructure this touches already existed; the actual work was (1) getting the real field name (`gtherp__Image_URL__c`, confirmed by the org owner) and (2) discovering and fixing that the Load pipeline had never actually populated `product2.image_url` at all, despite the Algolia-side read/transform code already assuming it would be.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19

**Primary Dependencies**: `algoliasearch` v4 / `react-instantsearch` (Catalog read path — already in place); existing Salesforce Apex REST integration via `lib/salesforce-service.ts` + `lib/product-salesforce-service.ts` (Detail read path — already in place)

**Storage**: N/A for this feature — no PostgreSQL schema changes; the Algolia sync pipeline's existing `product2.image_url` mirror column is out of scope

**Testing**: No automated UI/component test framework is configured for `app/products/**` in this repo (only an unrelated `npm run test:rbac` script) — verification is manual, per `quickstart.md`

**Target Platform**: Web (Next.js SSR/CSR), deployed to Heroku

**Project Type**: Single Next.js web application (no separate frontend/backend split)

**Performance Goals**: No new goal beyond not regressing existing Catalog/Detail render performance; images load via standard `<img>` tags already in place with existing `onError` fallback handling

**Constraints**: Must preserve existing placeholder fallback behavior (spec FR-004) on both pages; must not introduce a Salesforce write path or bypass the existing service-layer encapsulation (Constitution Principle I)

**Scale/Scope**: Two page surfaces (Catalog card/list view, Detail gallery); one new Salesforce field read (`Product2` photo URL); zero new Salesforce writes; zero database schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Salesforce as Single Source of Truth | PASS | Detail page reads the new photo field exclusively through the existing `getProductDetailsFromSalesforce` → Apex REST (`gtherp/product/details`) path, encapsulated in `lib/product-salesforce-service.ts`; no raw SOQL added to pages/API routes, no writes. The exact field key is unconfirmed (see `research.md` §3) — this is an implementation-time verification task, not a pattern violation. |
| II. RBAC-First Feature Design | PASS | No new user-facing action or write endpoint. Both pages are already permission-gated as existing routes; this feature only adds a read of data the user is already authorized to view. |
| III. Next.js 15 App Router Patterns | PASS | No change to route structure or param handling; both pages already exist and already follow the project's App Router conventions. |
| IV. Multi-Tenant Isolation | PASS | No new query introduced outside the existing `accountId`/`contactId`-scoped Apex endpoint call; Algolia read path is unchanged. |
| V. Simplicity & Phase-Driven Scope | PASS | Reuses existing `ProductGallery` component and existing Algolia hit fields; no new abstraction, no speculative multi-source unification beyond what the spec asks for. |

No violations — Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/124-product-image-sources/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── products/
│   ├── page.tsx                          # Server wrapper — no change anticipated
│   ├── ProductClientPage.tsx              # Catalog card/list rendering — verify existing image_url/images read path (~lines 548, 680)
│   └── [id]/
│       ├── page.tsx                       # Detail page — no change anticipated
│       └── components/
│           └── ProductGallery.tsx         # Existing multi-image gallery component — no change anticipated

lib/
├── products-service.ts                    # mapSalesforceProductToLocal — reads gtherp__Image_URL__c via parsePhotoUrls() [DONE]
├── product-load-service.ts                # fetchAllProducts/toRow/buildUpsertQuery — SOQL + Postgres upsert of image_url [DONE — found and fixed a real gap, not just verification]
├── product-salesforce-service.ts          # getProductDetailsFromSalesforce — no change, response passthrough only
├── product-index-service.ts               # buildAlgoliaPayload — existing image_url/images population, no change needed
└── product-sync-service.ts                # existing image_url/images passthrough, no change needed
```

**Structure Decision**: Existing single Next.js application layout (`app/` + `lib/`). No new directories. Revised from the original plan: this feature required real changes in **two** files (`lib/products-service.ts` for the Detail page, `lib/product-load-service.ts` for the Catalog/Algolia pipeline), not one — the original plan assumed the Catalog side needed no code change, but the Salesforce→Postgres Load pipeline had never actually populated `product2.image_url` at all (see `research.md` §1). No new architectural surface area either way — both changes extend existing pipeline stages.

## Complexity Tracking

No violations — Constitution Check passed cleanly for all five principles. This section is not applicable.
