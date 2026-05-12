-- ============================================================================
-- External API — tenant registry + audit log
-- ============================================================================
-- Cross-schema tables. Live in `public` so the API can resolve a tenant
-- BEFORE it knows which schema to talk to.
--
-- Apply once:   psql "$DATABASE_URL" -f db/external_api_setup.sql
-- Re-runnable:  yes (all DDL is idempotent).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- tenant_api_keys
--   One row per issued API key. The KEY itself is never stored — only its
--   sha256(key + pepper) hash. The first 8 chars (`key_prefix`) are stored
--   in clear so we can label log lines / dashboards without exposing secrets.
--
-- Lookup pattern:
--   1. Hash the presented key (sha256(key + pepper)).
--   2. SELECT ... WHERE key_hash = $1 AND is_active AND (expires_at IS NULL OR expires_at > now())
--      Single index scan, O(log n).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_api_keys (
    id              BIGSERIAL   PRIMARY KEY,
    tenant_id       TEXT        NOT NULL,                        -- 'salesforce' | 'salesforce2' | ...
    schema_name     TEXT        NOT NULL,                        -- target Postgres schema (must match tenant_id in practice)
    key_prefix      TEXT        NOT NULL UNIQUE,                 -- 8-char public prefix, e.g. 'wovn_a1b2'
    key_hash        TEXT        NOT NULL UNIQUE,                 -- sha256(secret + pepper), hex
    name            TEXT        NOT NULL,                        -- human-readable label
    scopes          TEXT[]      NOT NULL DEFAULT ARRAY['products:write']::TEXT[],
    rate_limit_rpm  INTEGER     NOT NULL DEFAULT 600,            -- per-key rate cap, requests/min
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    expires_at      TIMESTAMPTZ,                                  -- optional auto-expiry
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT,
    revoked_at      TIMESTAMPTZ,
    revoked_reason  TEXT,
    CONSTRAINT chk_schema_name_safe CHECK (schema_name ~ '^[a-z][a-z0-9_]{0,62}$')
);
COMMENT ON TABLE  public.tenant_api_keys IS 'External API credentials. One row = one issued key bound to one schema.';
COMMENT ON COLUMN public.tenant_api_keys.key_hash IS 'sha256(secret_part_of_key + pepper_env_var), hex-encoded.';
COMMENT ON COLUMN public.tenant_api_keys.scopes IS 'Permission strings e.g. products:write, products:read.';

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_lookup
    ON public.tenant_api_keys (key_hash)
    WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant
    ON public.tenant_api_keys (tenant_id);


-- ----------------------------------------------------------------------------
-- tenant_api_audit
--   Append-only request log. Indexed for "show me the last N requests for
--   tenant X" and "what's the error rate by status code in the last hour".
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_api_audit (
    id              BIGSERIAL   PRIMARY KEY,
    request_id      TEXT        NOT NULL,
    tenant_id       TEXT,                                         -- nullable: auth failures have no tenant yet
    schema_name     TEXT,
    api_key_id      BIGINT,
    method          TEXT        NOT NULL,
    path            TEXT        NOT NULL,
    status_code     INTEGER     NOT NULL,
    duration_ms     INTEGER,
    request_size    INTEGER,
    response_size   INTEGER,
    error_code      TEXT,
    error_message   TEXT,
    ip              INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.tenant_api_audit IS 'Append-only access log for the external API. Retain ~90 days, then trim.';

CREATE INDEX IF NOT EXISTS idx_tenant_api_audit_tenant_time
    ON public.tenant_api_audit (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_api_audit_status
    ON public.tenant_api_audit (status_code, created_at DESC)
    WHERE status_code >= 400;

CREATE INDEX IF NOT EXISTS idx_tenant_api_audit_request
    ON public.tenant_api_audit (request_id);


-- ----------------------------------------------------------------------------
-- Housekeeping helper
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_purge_old_api_audit(p_retention_days INT DEFAULT 90)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_purged BIGINT;
BEGIN
    WITH del AS (
        DELETE FROM public.tenant_api_audit
         WHERE created_at < now() - (p_retention_days || ' days')::interval
        RETURNING 1
    )
    SELECT count(*) INTO v_purged FROM del;
    RETURN v_purged;
END;
$$;


COMMIT;

-- ============================================================================
-- POST-IMPORT
-- ============================================================================
-- 1. Set the pepper env var on every dyno that runs the API:
--      heroku config:set EXTERNAL_API_KEY_PEPPER="$(openssl rand -hex 32)"
--    DO NOT change this value after keys are issued — it would invalidate
--    every existing key. Treat it like a database password.
--
-- 2. Provision your first key:
--      pnpm tsx scripts/generate-tenant-key.ts \
--          --tenant salesforce2 --schema salesforce2 --name "ACME prod"
--    The script prints the secret ONCE. Hand it to the caller securely.
--
-- 3. Schedule audit log trimming (optional):
--      SELECT public.fn_purge_old_api_audit(90);
-- ============================================================================