# Contract: Forgot Password / Reset Password API

Both routes are unauthenticated `POST` JSON endpoints, consumed today by `components/ForgotPasswordForm.tsx`. Request/response shapes are **unchanged** by this feature except for the new generic-error case called out below.

## `POST /api/auth/forgot-password`

**Request body**: `{ "email": string }`

**Responses** (unchanged unless noted):

| Condition | Status | Body |
|---|---|---|
| Missing email | 400 | `{ "error": "Email is required" }` |
| Salesforce reports success | 200 | `{ "success": true, "message": string }` |
| Salesforce reports failure (e.g. unknown email) — **unchanged** | 400 | `{ "error": string }` (real SF/business message, e.g. "Email Address is not found") |
| **NEW** — resolved organization has no usable Salesforce config (no org matched the request host, or the matched org's `salesforceUrl`/`salesforceAuthUrl`/`clientId`/`clientSecret` aren't all set) | 503 | `{ "error": "Unable to process your request right now. Please contact support." }` |
| Unexpected internal error — unchanged | 500 | `{ "error": "Failed to process request. Please try again later." }` |

## `POST /api/auth/reset-password`

**Request body**: `{ "email": string, "code": string|number, "newPassword": string }`

**Responses** (unchanged unless noted):

| Condition | Status | Body |
|---|---|---|
| Missing fields | 400 | `{ "error": "Email, code, and new password are required" }` |
| Code not 6 digits | 400 | `{ "error": "Verification code must be exactly 6 digits" }` |
| Password fails strength rule | 400 | `{ "error": "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character" }` |
| Salesforce reports success | 200 | `{ "success": true, "message": string }` |
| Salesforce reports failure (e.g. wrong code) — **unchanged** | 400 | `{ "error": string }` (real SF/business message) |
| **NEW** — resolved organization has no usable Salesforce config | 503 | `{ "error": "Unable to process your request right now. Please contact support." }` |
| Unexpected internal error — unchanged | 500 | `{ "error": "An error occurred while resetting your password" }` |

## Distinguishing the new case at the route layer

Both routes' existing `catch (apiError: any)` block must check whether `apiError` is an `OrgSalesforceConfigError` (exported from `lib/salesforce-service.ts`) before falling back to `apiError.message`:

```text
catch (apiError) {
  console.error(<context>, apiError)
  if (apiError instanceof OrgSalesforceConfigError) {
    return NextResponse.json({ error: <fixed generic message> }, { status: 503 })
  }
  // existing behavior: surface apiError.message
}
```

No other branch of either route changes.
