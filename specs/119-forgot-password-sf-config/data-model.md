# Phase 1 Data Model: Forgot Password Uses Org Salesforce Config, Not .env

No schema change. No migration. This feature reads existing columns only.

## Entities

### Organization (existing — `organizations` table, `db/schema.ts:21-43`)

Already stores the Salesforce connection details this feature requires. Relevant fields:

| Field (TS) | Column | Type | Role in this feature |
|---|---|---|---|
| `salesforceUrl` | `salesforce_url` | `text`, nullable | Salesforce instance/data URL. Required to be non-empty for a resolved org to be "usable" for forgot-password/reset-password. |
| `salesforceAuthUrl` | `salesforce_auth_url` | `text`, nullable | OAuth token endpoint URL. Required non-empty. |
| `clientId` | `client_id` | `text`, nullable | OAuth client_credentials client ID. Required non-empty. |
| `clientSecret` | `client_secret` | `text`, nullable | OAuth client_credentials secret. Required non-empty. Existing schema comment already flags this should be encrypted in production — unchanged, out of scope here. |
| `siteUrl` | `site_url` | `text`, nullable | Used (unchanged) by `getOrgConfig()` to match the request's `host` header to an organization row. |

**Validation rule introduced by this feature**: an organization is "usable" for the strict forgot-password/reset-password resolver only if `salesforceUrl`, `salesforceAuthUrl`, `clientId`, and `clientSecret` are all non-empty. This is an in-memory check inside `getSalesforceSessionForOrg()`, not a database constraint — existing rows with partial config remain valid for every other feature (which still uses the tolerant `getSalesforceSession()`).

### Password Reset Request (transient, not persisted locally)

Not a database entity. The reset-code lifecycle (generation, expiry, verification) is owned entirely by the Salesforce Apex REST endpoint (`{instanceUrl}/services/apexrest/gtherp/auth`) that `salesforceForgotPassword`/`salesforceResetPassword` call. The app holds no local state for it beyond the in-flight HTTP request — the resolved organization for a given request is not stored anywhere beyond that request's lifetime.

Note: `users.resetPasswordCode` / `users.resetPasswordExpires` (`db/schema.ts:10-11`) exist in the local schema but are not read or written by the current forgot-password/reset-password code path (verification is delegated to Salesforce). This feature does not touch those columns.

## No new entities, no state transitions, no migration required.
