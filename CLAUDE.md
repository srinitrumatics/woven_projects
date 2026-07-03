# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WOVN Client & Partner Portal — a Next.js 15 web application that acts as a presentation/orchestration layer over a Salesforce (WOVN) backend. Three user types: **Client**, **Partner**, and **Client-Partner**. Currently in Phase 1 (Client Priority).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Apply migrations to PostgreSQL
npm run db:push      # Push schema directly (dev shortcut)
npm run db:studio    # Open Drizzle Studio UI
npm run test:rbac    # Run RBAC test script (tsx lib/rbac-test.ts)
npm run start:worker # Start Algolia sync background worker
```

Required env vars: `DATABASE_URL` (PostgreSQL), Salesforce credentials (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`), Algolia credentials (`ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`), and optionally `ADMIN_HOST` to restrict the admin portal to a specific hostname.

## Architecture

### App Router & Route Structure

`/app` uses the Next.js App Router. Pages for the main web app live at top-level routes (`/orders`, `/products`, `/invoices`, etc.). The admin portal lives under `/app/(admin-portal)/` and uses a completely separate layout and auth system from the main portal. The `/auth` route handles Salesforce-connected login; `/admin-login` is the admin portal entry point.

**Middleware** (`middleware.ts`): protects main webapp routes by checking for a `session` cookie, and restricts `/admin-login` and `/admin-portal` to a single allowed hostname via `ADMIN_HOST`.

### Two Separate Auth Systems

1. **Main Portal Auth** — Salesforce-connected. Session stored as an HTTP-only cookie named `session`. Unauthenticated access to protected routes redirects to `/auth?return=<path>`.

2. **Admin Portal Auth** — Independent local auth. Lives entirely under `/app/(admin-portal)/`. Managed via `lib/admin-auth-service.ts`. Access restricted to the host defined by `ADMIN_HOST`.

### Database & ORM

Drizzle ORM with PostgreSQL (`pg`). Schema defined in `db/schema.ts`. Key tables:
- `users`, `organizations` — core entities
- `roles`, `permissions`, `permissionGroups` — RBAC building blocks
- Junction tables wire users to roles within organizations for multi-tenant isolation
- `organizations` stores per-tenant Salesforce connection credentials

Run `npm run db:generate` after editing `db/schema.ts`, then `npm run db:migrate` to apply.

### RBAC & Permissions

Permission checks flow through two React contexts in `components/AppAuthProvider.tsx`:

1. **`UserSessionContext`** — holds the logged-in user object from the session API
2. **`PermissionContext`** — fetches permissions and roles from `/api/auth/session` on mount and when user changes; exposes `hasPermission(name)` and `hasPermissions(names[], anyPermission?)`

To gate UI by permission, use the `PermissionGate` component:
```tsx
<PermissionGate requiredPermissions={['create_order']} fallback={<p>Access denied</p>}>
  <CreateOrderButton />
</PermissionGate>
```

`isSuperAdmin` (stored in `localStorage` as `'isSuperAdmin'`) bypasses all permission checks.

### Salesforce Integration

`lib/salesforce-service.ts` is the main Salesforce client. It handles OAuth2 token fetching/caching and SOQL queries. All WOVN business data (orders, products, accounts, etc.) is mastered in Salesforce; the app never writes directly to its own DB for business objects. When Salesforce credentials are not configured, services fall back to mock data automatically.

### Algolia Sync Worker

`workers/algolia-sync-worker.js` runs as a separate Node.js process (`npm run start:worker`). It polls a PostgreSQL queue table every 5 seconds for pending sync jobs, batches records, and pushes them to Algolia. Deployed via `Procfile` on Heroku.

### Design System & Styling

Tailwind CSS with a custom palette defined in `tailwind.config.ts`:
- `primary.DEFAULT` = `#96C2DB` (brand blue)
- `primary.light` = `#E5EDF1`
- `primary.dark` = `#6B9DB8`
- Dark mode via `darkMode: 'class'`

CSS variables `--background` and `--foreground` are mapped to `bg-background` and `text-foreground` for theme-aware base styles. The `ThemeContext` provider (`components/ThemeContext.tsx`) manages the `dark` class on `<html>`.

### Key Lib Services

Each business domain has a dedicated service file in `lib/`:
- `auth-service.ts` / `salesforce-auth.ts` — auth and token management
- `*-service.ts` files — one per domain (orders, products, invoices, quotes, shipments, proposals, etc.)
- `permission-service.ts`, `role-service.ts` — RBAC data access
- `organization-service.ts`, `org-config.ts` — multi-tenant org management

## Patterns to Follow

**Next.js 15 dynamic params** — route params are Promises in Next.js 15. Unwrap with `React.use()` in client components or `await params` in server components.

**New page routes** — create `app/<route>/page.tsx`. Wrap with `ProtectedPageWrapper` if it needs auth.

**New API routes** — create `app/api/<route>/route.ts`. Import the relevant `lib/*-service.ts`. Return `NextResponse.json(...)`.

**Permission-gating** — use `PermissionGate` for UI and call `lib/permission-service.ts` helpers on the server side for API routes.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/029-shipping-manifest-line-corrections/plan.md
<!-- SPECKIT END -->
