-- ============================================================================
-- Algolia sync pipeline for sf_00dgk000007zmr7uam (Pattern A)
-- ============================================================================
-- Schema name corrected from the broken `00DWI00000CadaD2AR_salesforce`:
--   - Postgres identifiers can't start with a digit (parser sees `00` as numeric)
--   - Mixed case must be quoted forever after — easier to use lowercase
--   - sf_00dgk000007zmr7uam already exists (HC-owned), so the trigger has a
--     real product2 to attach to without any extra setup.
--
-- Column names corrected from `__c` (Salesforce raw) to `_c` (Heroku Connect's
-- Postgres convention, single trailing underscore). VERIFY by running:
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema='sf_00dgk000007zmr7uam' AND table_name='product2'
--      AND column_name LIKE '%gtherp%';
-- If your columns end in `__c` instead of `_c`, do a find/replace in this file
-- (`_c` → `__c`) before running.
--
-- Index name set to `woven_products_sf_00dgk000007zmr7uam` to match
-- Pattern A naming. Each tenant schema gets its own Algolia index.
--
-- DBeaver-safe: every reference to a function body uses a unique dollar-quote
-- tag ($fn$). Run with Alt+X.
-- ============================================================================


-- ============================================
-- 1. SCHEMA — already exists (HC), this is just defensive
-- ============================================
CREATE SCHEMA IF NOT EXISTS sf_00dgk000007zmr7uam;


-- ============================================
-- 3. ALGOLIA SYNC QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sf_00dgk000007zmr7uam.algolia_sync_queue (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    last_retry_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_operation_idx
    ON sf_00dgk000007zmr7uam.algolia_sync_queue (table_name, record_id, operation) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_algolia_queue_status
    ON sf_00dgk000007zmr7uam.algolia_sync_queue (status, created_at);
CREATE INDEX IF NOT EXISTS idx_algolia_queue_table_record
    ON sf_00dgk000007zmr7uam.algolia_sync_queue (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_algolia_queue_cleanup
    ON sf_00dgk000007zmr7uam.algolia_sync_queue (status, processed_at) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_algolia_queue_retry
    ON sf_00dgk000007zmr7uam.algolia_sync_queue (status, last_retry_at) WHERE status = 'pending' AND retry_count > 0;


-- ============================================
-- 4. ALGOLIA SYNC LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sf_00dgk000007zmr7uam.algolia_sync_log (
    id BIGSERIAL PRIMARY KEY,
    queue_id BIGINT REFERENCES sf_00dgk000007zmr7uam.algolia_sync_queue(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    algolia_object_id VARCHAR(255),
    request_payload JSONB,
    response_payload JSONB,
    error_details TEXT,
    sync_duration_ms INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_log_status
    ON sf_00dgk000007zmr7uam.algolia_sync_log (status, synced_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_record
    ON sf_00dgk000007zmr7uam.algolia_sync_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_queue
    ON sf_00dgk000007zmr7uam.algolia_sync_log (queue_id);


-- ============================================
-- 5. ALGOLIA CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sf_00dgk000007zmr7uam.algolia_index_config (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    batch_size INTEGER DEFAULT 100,
    transform_function VARCHAR(255),
    filter_condition TEXT,
    max_retries INTEGER DEFAULT 5,
    retry_delay_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pattern A: per-tenant index name.
INSERT INTO sf_00dgk000007zmr7uam.algolia_index_config (table_name, index_name, transform_function, filter_condition, batch_size) VALUES
('sf_00dgk000007zmr7uam.product2', 'woven_products_sf_00dgk000007zmr7uam', 'transform_sf_product_for_algolia', NULL, 100)
ON CONFLICT (table_name) DO UPDATE SET
    index_name         = EXCLUDED.index_name,
    transform_function = EXCLUDED.transform_function,
    filter_condition   = EXCLUDED.filter_condition,
    batch_size         = EXCLUDED.batch_size;


-- ============================================
-- 6. DATA TRANSFORMATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.transform_sf_product_for_algolia(product_row sf_00dgk000007zmr7uam.product2)
RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE
AS $fn$
BEGIN
    RETURN jsonb_strip_nulls(jsonb_build_object(
        'objectID',           product_row.sfid,
        'sku',                product_row.productcode,
        'name',               product_row.name,
        'description',        product_row.description,
        'price',              COALESCE(product_row.gtherp__price_c, 0),
        'stock_quantity',     COALESCE(product_row.gtherp__stock_quantity_c, 0),
        'available_quantity', COALESCE(product_row.gtherp__available_quantity_c, 0),
        'discount',           COALESCE(product_row.gtherp__discount_c, 0),

        'image_url', CASE
            WHEN product_row.image_url IS NOT NULL
                AND product_row.image_url->'images' IS NOT NULL
                AND jsonb_array_length(product_row.image_url->'images') > 0
                THEN product_row.image_url#>>'{images,0,url}'
            ELSE NULL
        END,

        'images', CASE
            WHEN product_row.image_url IS NOT NULL
                AND product_row.image_url->'images' IS NOT NULL
                THEN product_row.image_url->'images'
            ELSE '[]'::jsonb
        END,

        'category',             product_row.family,
        'sub_category',         product_row.gtherp__sub_category_c,
        'manufacturer',         product_row.manufacturer_name_c,

        'status',               CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
        'is_active',            product_row.isactive,
        'product_availability', product_row.product_availability_c,
        'Availability_Status__c', product_row.product_availability_c,

        'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
        'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,

        'tenant', 'sf_00dgk000007zmr7uam',

        '_tags', ARRAY_REMOVE(ARRAY[
            product_row.family,
            product_row.gtherp__category_c,
            product_row.gtherp__sub_category_c,
            product_row.manufacturer_name_c,
            product_row.product_availability_c
        ], NULL)
    ));
END;
$fn$;


-- ============================================
-- 7. QUEUE MANAGEMENT FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.enqueue_algolia_sync(
    p_table_name VARCHAR,
    p_record_id  VARCHAR,
    p_operation  VARCHAR,
    p_payload    JSONB DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $fn$
DECLARE
    queue_id       BIGINT;
    config_enabled BOOLEAN;
BEGIN
    SELECT is_enabled INTO config_enabled
      FROM sf_00dgk000007zmr7uam.algolia_index_config
     WHERE table_name = p_table_name;

    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;

    INSERT INTO sf_00dgk000007zmr7uam.algolia_sync_queue (table_name, record_id, operation, payload, status)
    VALUES (p_table_name, p_record_id, p_operation, p_payload, 'pending')
    ON CONFLICT (table_name, record_id, operation) WHERE status = 'pending'
    DO UPDATE SET
        payload       = EXCLUDED.payload,
        created_at    = CURRENT_TIMESTAMP,
        retry_count   = 0,
        error_message = NULL
    RETURNING id INTO queue_id;

    RETURN queue_id;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.get_pending_algolia_syncs(batch_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    id          BIGINT,
    table_name  VARCHAR,
    record_id   VARCHAR,
    operation   VARCHAR,
    payload     JSONB,
    retry_count INTEGER
)
LANGUAGE plpgsql
AS $fn$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries
      FROM sf_00dgk000007zmr7uam.algolia_index_config c;

    RETURN QUERY
    SELECT q.id, q.table_name, q.record_id, q.operation, q.payload, q.retry_count
      FROM sf_00dgk000007zmr7uam.algolia_sync_queue q
     WHERE q.status = 'pending'
       AND q.retry_count < max_retries
     ORDER BY q.created_at
     LIMIT batch_limit
     FOR UPDATE SKIP LOCKED;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.get_pending_syncs_by_table(
    p_table_name  VARCHAR,
    p_batch_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id          BIGINT,
    table_name  VARCHAR,
    record_id   VARCHAR,
    operation   VARCHAR,
    payload     JSONB,
    retry_count INTEGER
)
LANGUAGE plpgsql
AS $fn$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
      FROM sf_00dgk000007zmr7uam.algolia_index_config c
     WHERE c.table_name = p_table_name;

    RETURN QUERY
    SELECT q.id, q.table_name, q.record_id, q.operation, q.payload, q.retry_count
      FROM sf_00dgk000007zmr7uam.algolia_sync_queue q
     WHERE q.status     = 'pending'
       AND q.table_name = p_table_name
       AND q.retry_count < COALESCE(max_retries, 5)
     ORDER BY q.created_at
     LIMIT p_batch_limit
     FOR UPDATE SKIP LOCKED;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.mark_sync_processing(p_queue_ids BIGINT[])
RETURNS VOID
LANGUAGE plpgsql
AS $fn$
BEGIN
    UPDATE sf_00dgk000007zmr7uam.algolia_sync_queue
       SET status       = 'processing',
           processed_at = CURRENT_TIMESTAMP
     WHERE id = ANY(p_queue_ids)
       AND status = 'pending';
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.mark_sync_completed(
    p_queue_id          BIGINT,
    p_algolia_object_id VARCHAR DEFAULT NULL,
    p_sync_duration_ms  INTEGER DEFAULT NULL,
    p_response_payload  JSONB   DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $fn$
BEGIN
    UPDATE sf_00dgk000007zmr7uam.algolia_sync_queue
       SET status       = 'completed',
           processed_at = CURRENT_TIMESTAMP
     WHERE id = p_queue_id;

    INSERT INTO sf_00dgk000007zmr7uam.algolia_sync_log (
        queue_id, table_name, record_id, operation,
        status, algolia_object_id, sync_duration_ms,
        response_payload, synced_at
    )
    SELECT id, table_name, record_id, operation,
           'completed', p_algolia_object_id, p_sync_duration_ms,
           p_response_payload, CURRENT_TIMESTAMP
      FROM sf_00dgk000007zmr7uam.algolia_sync_queue
     WHERE id = p_queue_id;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.mark_sync_failed(
    p_queue_id      BIGINT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $fn$
DECLARE
    max_retries         INTEGER;
    current_retry_count INTEGER;
    target_table_name   VARCHAR;
BEGIN
    SELECT q.table_name, q.retry_count
      INTO target_table_name, current_retry_count
      FROM sf_00dgk000007zmr7uam.algolia_sync_queue q
     WHERE q.id = p_queue_id;

    SELECT COALESCE(c.max_retries, 5) INTO max_retries
      FROM sf_00dgk000007zmr7uam.algolia_index_config c
     WHERE c.table_name = target_table_name;

    UPDATE sf_00dgk000007zmr7uam.algolia_sync_queue
       SET status = CASE
               WHEN retry_count + 1 >= max_retries THEN 'failed'
               ELSE 'pending'
           END,
           retry_count   = retry_count + 1,
           error_message = p_error_message,
           last_retry_at = CURRENT_TIMESTAMP,
           processed_at  = CASE
               WHEN retry_count + 1 >= max_retries THEN CURRENT_TIMESTAMP
               ELSE NULL
           END
     WHERE id = p_queue_id;

    INSERT INTO sf_00dgk000007zmr7uam.algolia_sync_log (
        queue_id, table_name, record_id, operation,
        status, error_details, synced_at
    )
    SELECT id, table_name, record_id, operation,
           CASE WHEN retry_count >= max_retries THEN 'failed_permanent'
                ELSE 'failed_retry' END,
           jsonb_build_object(
               'error_message', p_error_message,
               'error_details', p_error_details,
               'retry_count',   retry_count
           ),
           CURRENT_TIMESTAMP
      FROM sf_00dgk000007zmr7uam.algolia_sync_queue
     WHERE id = p_queue_id;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.reset_stuck_processing(timeout_minutes INTEGER DEFAULT 10)
RETURNS INTEGER
LANGUAGE plpgsql
AS $fn$
DECLARE reset_count INTEGER;
BEGIN
    UPDATE sf_00dgk000007zmr7uam.algolia_sync_queue
       SET status        = 'pending',
           processed_at  = NULL,
           error_message = 'Reset from stuck processing state'
     WHERE status = 'processing'
       AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$fn$;


CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.cleanup_old_sync_records(days_to_keep INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE plpgsql
AS $fn$
DECLARE deleted_count INTEGER;
BEGIN
    DELETE FROM sf_00dgk000007zmr7uam.algolia_sync_queue
     WHERE status = 'completed'
       AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$fn$;


-- ============================================
-- 8. TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.trigger_algolia_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
DECLARE
    transform_func   VARCHAR;
    payload          JSONB;
    operation_type   VARCHAR;
    full_table_name  VARCHAR;
    record_id        VARCHAR;
BEGIN
    full_table_name := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;

    SELECT transform_function INTO transform_func
      FROM sf_00dgk000007zmr7uam.algolia_index_config
     WHERE (table_name = full_table_name OR table_name = TG_TABLE_NAME)
       AND is_enabled = TRUE
     LIMIT 1;

    IF transform_func IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF (TG_OP = 'DELETE') THEN
        operation_type := 'DELETE';
        BEGIN
            record_id := OLD.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                record_id := OLD.id::TEXT;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not determine record ID for deletion';
                RETURN OLD;
            END;
        END;

        payload := jsonb_build_object('objectID', record_id);

        PERFORM sf_00dgk000007zmr7uam.enqueue_algolia_sync(
            full_table_name, record_id, operation_type, payload
        );
        RETURN OLD;

    ELSIF (TG_OP = 'INSERT') THEN
        operation_type := 'INSERT';
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        EXECUTE format('SELECT sf_00dgk000007zmr7uam.%I($1)', transform_func)
            USING NEW INTO payload;

        PERFORM sf_00dgk000007zmr7uam.enqueue_algolia_sync(
            full_table_name, record_id, operation_type, payload
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        operation_type := 'UPDATE';
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        EXECUTE format('SELECT sf_00dgk000007zmr7uam.%I($1)', transform_func)
            USING NEW INTO payload;

        BEGIN
            PERFORM sf_00dgk000007zmr7uam.enqueue_algolia_sync(
                full_table_name, record_id, operation_type, payload
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to enqueue sync for record %: %', record_id, SQLERRM;
        END;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$fn$;


-- ============================================
-- 9. ATTACH TRIGGER TO product2
-- ============================================
-- product2 is HC-owned. This will fail if your user lacks CREATE TRIGGER
-- on the HC schema. If so, ask the HC admin to run this section, or use
-- a separate schema for the Algolia layer with a manual UPDATE pump.

DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON sf_00dgk000007zmr7uam.product2;

CREATE TRIGGER sf_product2_algolia_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sf_00dgk000007zmr7uam.product2
    FOR EACH ROW
    EXECUTE FUNCTION sf_00dgk000007zmr7uam.trigger_algolia_sync();


-- ============================================
-- 10. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS update_algolia_config_timestamp ON sf_00dgk000007zmr7uam.algolia_index_config;
CREATE TRIGGER update_algolia_config_timestamp
    BEFORE UPDATE ON sf_00dgk000007zmr7uam.algolia_index_config
    FOR EACH ROW
    EXECUTE FUNCTION sf_00dgk000007zmr7uam.update_updated_at_column();


-- ============================================
-- 11. MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW sf_00dgk000007zmr7uam.algolia_sync_stats AS
SELECT table_name, operation, status,
       COUNT(*)                  AS count,
       MAX(created_at)           AS last_created,
       MAX(processed_at)         AS last_processed,
       AVG(retry_count)::numeric AS avg_retries
  FROM sf_00dgk000007zmr7uam.algolia_sync_queue
 GROUP BY table_name, operation, status
 ORDER BY table_name, operation, status;

CREATE OR REPLACE VIEW sf_00dgk000007zmr7uam.algolia_sync_health AS
SELECT
    COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes')        AS stuck_pending_count,
    COUNT(*) FILTER (WHERE status = 'failed')                                                       AS total_failed_count,
    COUNT(*) FILTER (WHERE status = 'processing' AND processed_at < NOW() - INTERVAL '10 minutes')  AS stuck_processing_count,
    COUNT(*) FILTER (WHERE status = 'pending')                                                      AS total_pending_count,
    MAX(created_at)   FILTER (WHERE status = 'completed')                                           AS last_success_time,
    MAX(processed_at) FILTER (WHERE status = 'failed')                                              AS last_failure_time,
    (SELECT COUNT(*) FROM sf_00dgk000007zmr7uam.algolia_sync_log
      WHERE status = 'completed' AND synced_at > NOW() - INTERVAL '1 hour')                         AS syncs_last_hour
  FROM sf_00dgk000007zmr7uam.algolia_sync_queue;

CREATE OR REPLACE VIEW sf_00dgk000007zmr7uam.algolia_failed_syncs AS
SELECT q.id, q.table_name, q.record_id, q.operation,
       q.error_message, q.retry_count, q.created_at, q.last_retry_at, q.processed_at
  FROM sf_00dgk000007zmr7uam.algolia_sync_queue q
 WHERE q.status = 'failed'
 ORDER BY q.processed_at DESC;


-- ============================================
-- 12. MAINTENANCE PROCEDURE
-- ============================================

CREATE OR REPLACE FUNCTION sf_00dgk000007zmr7uam.run_algolia_maintenance()
RETURNS TABLE (task VARCHAR, items_affected INTEGER)
LANGUAGE plpgsql
AS $fn$
DECLARE
    stuck_count   INTEGER;
    cleanup_count INTEGER;
BEGIN
    stuck_count := sf_00dgk000007zmr7uam.reset_stuck_processing(10);
    RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;

    cleanup_count := sf_00dgk000007zmr7uam.cleanup_old_sync_records(7);
    RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;

    EXECUTE 'VACUUM ANALYZE sf_00dgk000007zmr7uam.algolia_sync_queue';
    EXECUTE 'VACUUM ANALYZE sf_00dgk000007zmr7uam.algolia_sync_log';

    RETURN;
END;
$fn$;


-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON TABLE sf_00dgk000007zmr7uam.algolia_sync_queue  IS 'Queue for tracking Algolia sync operations with retry logic';
COMMENT ON TABLE sf_00dgk000007zmr7uam.algolia_sync_log    IS 'Historical log of all Algolia sync operations for auditing';
COMMENT ON TABLE sf_00dgk000007zmr7uam.algolia_index_config IS 'Configuration for Algolia indexes per table';


-- ============================================
-- VERIFICATION — runs at the end, no side effects
-- ============================================

-- 1. Confirm tables exist
SELECT 'algolia_index_config' AS table_name, count(*) AS rows FROM sf_00dgk000007zmr7uam.algolia_index_config
UNION ALL
SELECT 'algolia_sync_queue',                count(*)           FROM sf_00dgk000007zmr7uam.algolia_sync_queue
UNION ALL
SELECT 'algolia_sync_log',                  count(*)           FROM sf_00dgk000007zmr7uam.algolia_sync_log;

-- 2. Confirm functions are installed
SELECT proname, pg_get_function_arguments(oid) AS args
  FROM pg_proc
 WHERE pronamespace = 'sf_00dgk000007zmr7uam'::regnamespace
   AND proname LIKE '%algolia%' OR proname LIKE 'transform_sf_product%' OR proname LIKE 'trigger_algolia%'
 ORDER BY proname;

-- 3. Confirm trigger is attached
SELECT trigger_name, event_manipulation, action_timing
  FROM information_schema.triggers
 WHERE event_object_schema = 'sf_00dgk000007zmr7uam'
   AND event_object_table  = 'product2';

-- 4. Sanity check the index config row
SELECT table_name, index_name, is_enabled, transform_function
  FROM sf_00dgk000007zmr7uam.algolia_index_config;





  REM Window 1
set ALGOLIA_SYNC_SCHEMA=sf_00dec00000e1fjdmaa node workers\algolia-sync-worker.js

REM Window 2
set ALGOLIA_SYNC_SCHEMA=sf_00dgk000007zmr7uam
node workers\algolia-sync-worker.js

REM Window 3
set ALGOLIA_SYNC_SCHEMA=sf_00dwi00000cadad2ar
node workers\algolia-sync-worker.js


SELECT 'sf_00dec00000e1fjdmaa' AS schema, table_name, index_name FROM sf_00dec00000e1fjdmaa.algolia_index_config
UNION ALL
SELECT 'sf_00dgk000007zmr7uam',           table_name, index_name FROM sf_00dgk000007zmr7uam.algolia_index_config
UNION ALL
SELECT 'sf_00dwi00000cadad2ar',           table_name, index_name FROM sf_00dwi00000cadad2ar.algolia_index_config
UNION ALL
SELECT 'salesforce',                       table_name, index_name FROM salesforce.algolia_index_config
ORDER BY 1;



UPDATE sf_00dec00000e1fjdmaa.algolia_index_config
   SET index_name = 'woven_products_sf_00dec00000e1fjdmaa'
 WHERE table_name = 'sf_00dec00000e1fjdmaa.product2';

UPDATE sf_00dgk000007zmr7uam.algolia_index_config
   SET index_name = 'woven_products_sf_00dgk000007zmr7uam'
 WHERE table_name = 'sf_00dgk000007zmr7uam.product2';

UPDATE sf_00dwi00000cadad2ar.algolia_index_config
   SET index_name = 'woven_products_sf_00dwi00000cadad2ar'
 WHERE table_name = 'sf_00dwi00000cadad2ar.product2';



 set ALGOLIA_SYNC_SCHEMA=sf_00dgk000007zmr7uam && node workers\algolia-sync-worker.js
