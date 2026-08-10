# Quickstart: Validating Forgot Password Uses Org Salesforce Config

## Prerequisites

- Local dev environment running (`npm run dev`), `DATABASE_URL` pointing at a Postgres instance with the `organizations` table migrated.
- Two organization rows to exercise the "usable" vs "not usable" paths — see setup below.
- Optionally, real or sandbox Salesforce credentials for one organization to see a full success round-trip; a fake/unreachable `salesforceAuthUrl` is enough to prove *which* credentials were attempted (check server logs for the outbound `tokenUrl`).

## Setup

Using `npm run db:studio` (or direct SQL), ensure:

1. **Org A — usable config**: a row in `organizations` with `site_url` matching the host you'll send requests to (e.g. `localhost:3000`), and all four of `salesforce_url`, `salesforce_auth_url`, `client_id`, `client_secret` populated (values can be a sandbox org, or intentionally-wrong-but-non-empty values if you just want to confirm *which* URL/credentials get used, per Acceptance Scenario 1/2).
2. **Org B — incomplete config**: a second row whose `site_url` matches a *different* host you can send requests to (e.g. via a `Host` header override or a second local hostname), with `client_secret` left blank/null (everything else populated) — exercises the Edge Case ("partially filled in" config).
3. **No-match case**: send a request with a `Host` header that matches neither row.

## Validation steps

### 1. Org with usable config (User Story 1, Scenarios 1–3)

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Host: <org-a-site-url>" \
  -d '{"email":"someone@example.com"}'
```

**Expected**: request proceeds to Salesforce using Org A's stored `client_id`/`client_secret`/`salesforce_auth_url` — confirm via server log (the `getSalesforceSessionForOrg` call path, not the `.env`-sourced `SF_*` values). Response is whatever Salesforce's Apex endpoint returns (success or a real business error like "Email Address is not found") — not the new generic 503.

Repeat against Org B's host to confirm Org B's *own* (different) credentials are attempted, never Org A's or the `.env` ones — proves no cross-org bleed (Scenario 3).

### 2. Org with incomplete config (User Story 2, Edge Case)

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Host: <org-b-site-url>" \
  -d '{"email":"someone@example.com"}'
```

**Expected**: HTTP 503, body `{"error":"Unable to process your request right now. Please contact support."}`. Server log shows the real cause (which field(s) were missing) via `console.error`. Confirm via logs/network inspection that **no** outbound request was made using `process.env.SF_*` values.

### 3. No matching organization (User Story 2, Acceptance Scenario 1–2)

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Host: unregistered.example.test" \
  -d '{"email":"someone@example.com"}'
```

**Expected**: same 503 generic response as above. Server log shows "no organization found for host" as the logged cause.

### 4. Reset-password mirrors the same behavior

Repeat steps 1–3 against `POST /api/auth/reset-password` with a valid-shaped body (`email`, 6-digit `code`, a password matching the strength regex) — same three outcomes apply (real SF response for usable config, generic 503 otherwise).

### 5. Unaffected flows still use the tolerant fallback (spec Assumptions)

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Host: unregistered.example.test" \
  -d '{"email":"someone@example.com","password":"whatever"}'
```

**Expected**: unchanged from today — falls through to `.env`-sourced credentials (or fails for its own reasons), confirming login was *not* touched by this feature.

## Static check

```bash
npx tsc --noEmit
```

No new automated tests are introduced (consistent with Constitution Principle V — no existing suite covers this area); the steps above are the acceptance evidence for this feature.
