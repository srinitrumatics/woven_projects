-- ============================================
-- Migration Script: Split Product Load / Search-Index Sync
-- ============================================
--
-- Adds the run-tracking tables needed for the separate "Load Products" and
-- "Index Products" admin actions to an ALREADY-PROVISIONED organization schema.
-- Newly provisioned organizations get this from db/algolia.sql automatically
-- (see app/api/admin/organizations/provision/route.ts); this script brings
-- existing organizations up to the same shape.
--
-- Usage: connect to the target database, then either
--   SET search_path TO <org_schema>;
-- and run this script, or run it via psql with -v schema=<org_schema> and a
-- templating step, matching the manual, per-org convention already used by
-- db/algolia_migration.sql.

-- 1. Allow the 'dead' status that workers/algolia-sync-worker.js already writes
--    once retries are exhausted (markFailed), which the original CHECK constraint
--    did not include.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'algolia_sync_queue_status_check'
    ) THEN
        ALTER TABLE algolia_sync_queue DROP CONSTRAINT algolia_sync_queue_status_check;
    END IF;

    ALTER TABLE algolia_sync_queue
        ADD CONSTRAINT algolia_sync_queue_status_check
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead'));
END $$;

-- 2. Tag queue rows with the "Index Products" run that enqueued them.
ALTER TABLE algolia_sync_queue ADD COLUMN IF NOT EXISTS batch_id UUID;
CREATE INDEX IF NOT EXISTS idx_algolia_queue_batch ON algolia_sync_queue(batch_id) WHERE batch_id IS NOT NULL;

-- 3. Load run tracking ("Load Products": Salesforce -> product2).
CREATE TABLE IF NOT EXISTS product_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'completed_with_errors', 'failed')),
    salesforce_total INTEGER DEFAULT 0,
    upserted_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_running_load_idx ON product_sync_runs ((1)) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_product_sync_runs_started ON product_sync_runs(started_at DESC);

-- 4. Index run tracking ("Index Products": product2 -> algolia_sync_queue).
CREATE TABLE IF NOT EXISTS algolia_index_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'completed_with_errors', 'failed')),
    total_enqueued INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_running_index_idx ON algolia_index_runs ((1)) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_algolia_index_runs_started ON algolia_index_runs(started_at DESC);
