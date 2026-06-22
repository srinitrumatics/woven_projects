<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1 (PATCH)

Bump rationale: Added UI Component Conventions bullet to Technology Stack section,
  documenting the project-wide table pattern (SortableHeader, useSortableData,
  useResizableColumns, Pagination) now uniformly applied across all 7 menu landing
  pages, and the Algolia / client-side pagination split for the Products catalog.
  No governance rule changed; this is a codification of established practice.

Modified principles: None

Added content:
  - Technology Stack → "UI Component Conventions" bullet (new)

Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check generic; no changes needed
  ✅ .specify/templates/spec-template.md — no outdated references
  ✅ .specify/templates/tasks-template.md — task phases align with principles
  ✅ .specify/memory/constitution.md — this file

Follow-up TODOs:
  - RATIFICATION_DATE 2026-06-22 is the date of first population; update if an earlier
    team decision date is known.
-->

# WOVN Client & Partner Portal Constitution

## Core Principles

### I. Salesforce as Single Source of Truth

All WOVN business data (orders, products, accounts, invoices, quotes, shipments, proposals)
is mastered in Salesforce and MUST be read exclusively through `lib/salesforce-service.ts`.

- The application MUST NOT write business objects to its own PostgreSQL database.
- PostgreSQL stores only platform-managed data: users, organizations, roles, permissions,
  junction tables, and Algolia sync queue entries.
- Services MUST fall back to mock data automatically when Salesforce credentials are absent
  so the app remains runnable in non-production environments without a live SF connection.
- SOQL queries MUST be encapsulated inside domain-specific service files (`lib/*-service.ts`);
  pages and API routes MUST NOT construct raw queries.

### II. RBAC-First Feature Design

Every new feature MUST implement permission gates before exposing any functionality to users.

- UI gating: use the `PermissionGate` component (`components/AppAuthProvider.tsx`).
- Server-side gating: call `lib/permission-service.ts` helpers inside API route handlers.
- `isSuperAdmin` (stored in `localStorage`) is an intentional design bypass — it MUST NOT be
  removed or circumvented for ordinary users.
- All permission checks are org-scoped; junction tables wire users to roles within their
  organization. Cross-org permission queries are forbidden.

### III. Next.js 15 App Router Patterns (NON-NEGOTIABLE)

Route params are Promises in Next.js 15 and MUST be unwrapped correctly.

- Client components MUST use `React.use(params)` to unwrap dynamic route params.
- Server components and API routes MUST use `await params`.
- New page routes MUST follow `app/<route>/page.tsx` and wrap with `ProtectedPageWrapper`
  when the route requires authentication.
- New API routes MUST follow `app/api/<route>/route.ts` and return `NextResponse.json(...)`.
- The two auth systems MUST remain fully isolated:
  - **Main portal**: Salesforce-connected; session stored in HTTP-only `session` cookie.
  - **Admin portal**: Independent local auth under `app/(admin-portal)/`; restricted to the
    hostname defined by `ADMIN_HOST`.
- Middleware (`middleware.ts`) is the sole enforcement point for route protection; ad-hoc
  redirect logic inside pages is forbidden.

### IV. Multi-Tenant Isolation

No data from one organization MUST ever be accessible to another.

- Every database query MUST be scoped to the requesting user's organization ID.
- Each organization's Salesforce credentials are stored in the `organizations` table and MUST
  be fetched per-request; credentials MUST NOT be shared across orgs or cached globally
  without org-keyed invalidation.
- API routes MUST derive the org context from the authenticated session, never from a
  client-supplied parameter that could be spoofed.

### V. Simplicity & Phase-Driven Scope

The portal is in Phase 1 (Client Priority). Partner and Client-Partner features are deferred.

- Features MUST NOT exceed the scope of the active phase. No speculative abstractions for
  future phases.
- YAGNI principle is enforced: three similar lines are preferred over a premature abstraction.
- Error handling and validation MUST only be added at system boundaries (user input, external
  APIs). Trust internal framework guarantees.
- No half-finished implementations; no feature flags for work that can simply be omitted
  until the relevant phase begins.

## Technology Stack Constraints

The following stack is fixed for the current lifecycle of the project. Additions require
documented justification in the relevant feature spec.

- **Runtime**: Next.js 15 (App Router), React, TypeScript
- **Database**: PostgreSQL via Drizzle ORM; schema changes MUST go through `db:generate` →
  `db:migrate` (never raw SQL against production)
- **Styling**: Tailwind CSS; custom palette defined in `tailwind.config.ts`
  (`primary.DEFAULT = #96C2DB`); dark mode via `darkMode: 'class'`
- **Search**: Algolia, fed by the background sync worker (`workers/algolia-sync-worker.js`)
- **Deployment**: Heroku (Procfile); web process and worker process are separate dynos
- **External data master**: Salesforce (WOVN); all business data flows from SF, never to it
- **UI Component Conventions**: All data-table landing pages MUST use `SortableHeader` +
  `useSortableData` for sortable columns and `useResizableColumns` for column resizing.
  Paginated list views MUST use the `Pagination` component (default 10 items per page).
  Catalog/card grid views (e.g. Products) use Algolia `useInfiniteHits` with infinite scroll;
  their list-view counterparts use client-side pagination over the currently loaded hits.

## Development Workflow

Features follow a spec-driven, phase-ordered delivery process.

- Every feature begins with a spec (`/speckit-specify`) before any implementation.
- Implementation planning (`/speckit-plan`) happens after spec approval; tasks (`/speckit-tasks`)
  are generated from the plan.
- Branches are named by ticket/feature identifier (e.g., `wovn_<feature>`).
- Each Phase 1 feature MUST be fully functional and demonstrable as a standalone increment
  before Phase 2 work begins on the same surface area.
- All PRs touching auth, permissions, or Salesforce integration MUST be reviewed against
  Principles II, III, and IV before merge.
- Drizzle schema changes require a migration file committed alongside the code change.

## Governance

This constitution supersedes all local conventions, ad-hoc decisions, and prior verbal agreements.
Principles II (RBAC) and IV (Tenant Isolation) are NON-NEGOTIABLE and MUST NOT be amended
without explicit sign-off from the project lead and a documented migration plan for existing data.

Amendment procedure:
1. Open a PR updating this file with the proposed change and version bump rationale.
2. Update all dependent templates (plan, spec, tasks) in the same PR.
3. Increment the version following semantic versioning:
   - MAJOR — principle removed, renamed, or governance rule redefined incompatibly.
   - MINOR — new principle or section added, or materially expanded guidance.
   - PATCH — clarification, wording, or typo fix with no semantic change.
4. Record the amendment date in `LAST_AMENDED_DATE`.

All PR reviews MUST verify compliance with the five Core Principles. Complexity violations
MUST be documented in the plan's Complexity Tracking table with explicit justification.

Use `CLAUDE.md` for runtime development guidance; this constitution governs design intent.

**Version**: 1.0.1 | **Ratified**: 2026-06-22 | **Last Amended**: 2026-06-22
