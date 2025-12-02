

-- ============================================
-- 3. ALGOLIA SYNC QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS salesforce.algolia_sync_queue (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL, -- VARCHAR to support Salesforce IDs (18 chars)
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    last_retry_at TIMESTAMP,
    CONSTRAINT unique_pending_operation UNIQUE (table_name, record_id, operation, status)
);

-- Indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_algolia_queue_status ON salesforce.algolia_sync_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_algolia_queue_table_record ON salesforce.algolia_sync_queue(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_algolia_queue_cleanup ON salesforce.algolia_sync_queue(status, processed_at) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_algolia_queue_retry ON salesforce.algolia_sync_queue(status, last_retry_at) WHERE status = 'pending' AND retry_count > 0;

-- ============================================
-- 4. ALGOLIA SYNC LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS salesforce.algolia_sync_log (
    id BIGSERIAL PRIMARY KEY,
    queue_id BIGINT REFERENCES salesforce.algolia_sync_queue(id),
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

-- Indexes for monitoring and debugging
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON salesforce.algolia_sync_log(status, synced_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_record ON salesforce.algolia_sync_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_queue ON salesforce.algolia_sync_log(queue_id);

-- ============================================
-- 5. ALGOLIA CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS salesforce.algolia_index_config (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    batch_size INTEGER DEFAULT 100,
    transform_function VARCHAR(255), -- Name of PL/pgSQL function to transform data
    filter_condition TEXT, -- SQL WHERE clause to filter records
    max_retries INTEGER DEFAULT 5,
    retry_delay_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configurations
INSERT INTO salesforce.algolia_index_config (table_name, index_name, transform_function, filter_condition, batch_size) VALUES
('salesforce.product2', 'dev_woven_products', 'transform_sf_product_for_algolia', NULL, 100)
ON CONFLICT (table_name) DO UPDATE SET
    index_name = EXCLUDED.index_name,
    transform_function = EXCLUDED.transform_function,
    filter_condition = EXCLUDED.filter_condition,
    batch_size = EXCLUDED.batch_size;

-- ============================================
-- 6. DATA TRANSFORMATION FUNCTIONS
-- ============================================

-- Transform function for Salesforce Product2 to Algolia format
CREATE OR REPLACE FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2)
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_strip_nulls(jsonb_build_object(
        'objectID', product_row.sfid,
        'sku', product_row.productcode,
        'name', product_row.name,
        'description', product_row.description,
        'price', COALESCE(product_row.gtherp__price__c, 0),
        'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
        'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
        'discount', COALESCE(product_row.gtherp__discount__c, 0),
        
        -- Categories and Family
        'category', product_row.gtherp__category__c,
        'sub_category', product_row.gtherp__sub_category__c,
        'family', product_row.family,
        
        'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
        'is_active', product_row.isactive,
        
        'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
        'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
        
        -- Searchable tags (remove NULLs)
        '_tags', ARRAY_REMOVE(ARRAY[
            product_row.family, 
            product_row.gtherp__category__c, 
            product_row.gtherp__sub_category__c
        ], NULL)
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 7. QUEUE MANAGEMENT FUNCTIONS
-- ============================================

-- Enqueue records for Algolia sync
CREATE OR REPLACE FUNCTION salesforce.enqueue_algolia_sync(
    p_table_name VARCHAR,
    p_record_id VARCHAR,
    p_operation VARCHAR,
    p_payload JSONB DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    queue_id BIGINT;
    config_enabled BOOLEAN;
BEGIN
    -- Check if indexing is enabled for this table
    SELECT is_enabled INTO config_enabled 
    FROM salesforce.algolia_index_config 
    WHERE table_name = p_table_name;
    
    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Insert into queue (ON CONFLICT prevents duplicate pending operations)
    INSERT INTO salesforce.algolia_sync_queue (table_name, record_id, operation, payload, status)
    VALUES (p_table_name, p_record_id, p_operation, p_payload, 'pending')
    ON CONFLICT ON CONSTRAINT unique_pending_operation
    DO UPDATE SET 
        payload = EXCLUDED.payload,
        created_at = CURRENT_TIMESTAMP,
        retry_count = 0,
        error_message = NULL
    RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Get pending sync items (with locking for distributed workers)
CREATE OR REPLACE FUNCTION salesforce.get_pending_algolia_syncs(batch_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    id BIGINT,
    table_name VARCHAR,
    record_id VARCHAR,
    operation VARCHAR,
    payload JSONB,
    retry_count INTEGER
) AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    -- Get max retries from config (use 5 as default)
    SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries
    FROM salesforce.algolia_index_config c;

    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM salesforce.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.retry_count < max_retries
    ORDER BY q.created_at
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED; -- Prevents concurrent processing
END;
$$ LANGUAGE plpgsql;

-- Get pending syncs for a specific table (for batch operations)
CREATE OR REPLACE FUNCTION salesforce.get_pending_syncs_by_table(
    p_table_name VARCHAR,
    p_batch_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id BIGINT,
    table_name VARCHAR,
    record_id VARCHAR,
    operation VARCHAR,
    payload JSONB,
    retry_count INTEGER
) AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM salesforce.algolia_index_config c
    WHERE c.table_name = p_table_name;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM salesforce.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.table_name = p_table_name
    AND q.retry_count < COALESCE(max_retries, 5)
    ORDER BY q.created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Mark items as processing
CREATE OR REPLACE FUNCTION salesforce.mark_sync_processing(p_queue_ids BIGINT[])
RETURNS VOID AS $$
BEGIN
    UPDATE salesforce.algolia_sync_queue
    SET 
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = ANY(p_queue_ids)
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Mark sync as completed
CREATE OR REPLACE FUNCTION salesforce.mark_sync_completed(
    p_queue_id BIGINT,
    p_algolia_object_id VARCHAR DEFAULT NULL,
    p_sync_duration_ms INTEGER DEFAULT NULL,
    p_response_payload JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE salesforce.algolia_sync_queue
    SET 
        status = 'completed',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO salesforce.algolia_sync_log (
        queue_id, table_name, record_id, operation, 
        status, algolia_object_id, sync_duration_ms,
        response_payload, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'completed', p_algolia_object_id, p_sync_duration_ms,
        p_response_payload, CURRENT_TIMESTAMP
    FROM salesforce.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Mark sync as failed (with retry logic)
CREATE OR REPLACE FUNCTION salesforce.mark_sync_failed(
    p_queue_id BIGINT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    max_retries INTEGER;
    current_retry_count INTEGER;
    target_table_name VARCHAR;
BEGIN
    -- Get current state
    SELECT q.table_name, q.retry_count 
    INTO target_table_name, current_retry_count
    FROM salesforce.algolia_sync_queue q
    WHERE q.id = p_queue_id;
    
    -- Get max retries from config
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM salesforce.algolia_index_config c
    WHERE c.table_name = target_table_name;
    
    -- Update queue with retry logic
    UPDATE salesforce.algolia_sync_queue
    SET 
        status = CASE 
            WHEN retry_count + 1 >= max_retries THEN 'failed'
            ELSE 'pending'  -- Retry
        END,
        retry_count = retry_count + 1,
        error_message = p_error_message,
        last_retry_at = CURRENT_TIMESTAMP,
        processed_at = CASE 
            WHEN retry_count + 1 >= max_retries THEN CURRENT_TIMESTAMP
            ELSE NULL  -- Clear for retry
        END
    WHERE id = p_queue_id;
    
    -- Log the failure
    INSERT INTO salesforce.algolia_sync_log (
        queue_id, table_name, record_id, operation,
        status, error_details, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        CASE 
            WHEN retry_count >= max_retries THEN 'failed_permanent'
            ELSE 'failed_retry'
        END,
        jsonb_build_object(
            'error_message', p_error_message,
            'error_details', p_error_details,
            'retry_count', retry_count
        ),
        CURRENT_TIMESTAMP
    FROM salesforce.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Reset stuck processing items (run periodically)
CREATE OR REPLACE FUNCTION salesforce.reset_stuck_processing(timeout_minutes INTEGER DEFAULT 10)
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE salesforce.algolia_sync_queue
    SET 
        status = 'pending',
        processed_at = NULL,
        error_message = 'Reset from stuck processing state'
    WHERE status = 'processing'
    AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old completed syncs
-- 8. TRIGGER FUNCTIONS
-- ============================================

-- Generic Trigger Function for Algolia Sync
CREATE OR REPLACE FUNCTION salesforce.trigger_algolia_sync()
RETURNS TRIGGER AS $$
DECLARE
    transform_func VARCHAR;
    payload JSONB;
    operation_type VARCHAR;
    full_table_name VARCHAR;
    record_id VARCHAR;
BEGIN
    -- Construct full table name (schema.table)
    full_table_name := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;

    -- Get transform function for this table
    SELECT transform_function INTO transform_func
    FROM salesforce.algolia_index_config
    WHERE (table_name = full_table_name OR table_name = TG_TABLE_NAME) 
    AND is_enabled = TRUE
    LIMIT 1;
    
    IF transform_func IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Determine operation type and prepare payload
    IF (TG_OP = 'DELETE') THEN
        operation_type := 'DELETE';
        -- Handle different ID types (UUID vs String)
        BEGIN
            record_id := OLD.sfid::TEXT; -- Try sfid first for Salesforce
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                record_id := OLD.id::TEXT; -- Fallback to id
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not determine record ID for deletion';
                RETURN OLD;
            END;
        END;

        payload := jsonb_build_object('objectID', record_id);
        
        PERFORM salesforce.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        operation_type := 'INSERT';
        
        -- Handle different ID types
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        -- Execute transform function dynamically with schema qualification
        EXECUTE format('SELECT salesforce.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        PERFORM salesforce.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only sync if relevant fields changed
        IF (NEW IS DISTINCT FROM OLD) THEN
            operation_type := 'UPDATE';
            
            BEGIN
                record_id := NEW.sfid::TEXT;
            EXCEPTION WHEN OTHERS THEN
                record_id := NEW.id::TEXT;
            END;

            -- Execute transform function dynamically with schema qualification
            EXECUTE format('SELECT salesforce.%I($1)', transform_func)
            USING NEW
            INTO payload;
            
            PERFORM salesforce.enqueue_algolia_sync(
                full_table_name,
                record_id,
                operation_type,
                payload
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CREATE TRIGGERS
-- ============================================

-- Salesforce Product2 Trigger
-- Note: This assumes the salesforce schema and product2 table exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'salesforce' 
        AND table_name = 'product2'
    ) THEN
        DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON salesforce.product2;
        
        CREATE TRIGGER sf_product2_algolia_sync_trigger
            AFTER INSERT OR UPDATE OR DELETE ON salesforce.product2
            FOR EACH ROW
            EXECUTE FUNCTION salesforce.trigger_algolia_sync();
    END IF;
END $$;

-- ============================================
-- 10. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION salesforce.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_algolia_config_timestamp
    BEFORE UPDATE ON salesforce.algolia_index_config
    FOR EACH ROW
    EXECUTE FUNCTION salesforce.update_updated_at_column();

-- ============================================
-- 11. MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW salesforce.algolia_sync_stats AS
SELECT 
    table_name,
    operation,
    status,
    COUNT(*) as count,
    MAX(created_at) as last_created,
    MAX(processed_at) as last_processed,
    AVG(retry_count) as avg_retries
FROM salesforce.algolia_sync_queue
GROUP BY table_name, operation, status
ORDER BY table_name, operation, status;

CREATE OR REPLACE VIEW salesforce.algolia_sync_health AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') as stuck_pending_count,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed_count,
    COUNT(*) FILTER (WHERE status = 'processing' AND processed_at < NOW() - INTERVAL '10 minutes') as stuck_processing_count,
    COUNT(*) FILTER (WHERE status = 'pending') as total_pending_count,
    MAX(created_at) FILTER (WHERE status = 'completed') as last_success_time,
    MAX(processed_at) FILTER (WHERE status = 'failed') as last_failure_time,
    (SELECT COUNT(*) FROM salesforce.algolia_sync_log WHERE status = 'completed' AND synced_at > NOW() - INTERVAL '1 hour') as syncs_last_hour
FROM salesforce.algolia_sync_queue;

CREATE OR REPLACE VIEW salesforce.algolia_failed_syncs AS
SELECT 
    q.id,
    q.table_name,
    q.record_id,
    q.operation,
    q.error_message,
    q.retry_count,
    q.created_at,
    q.last_retry_at,
    q.processed_at
FROM salesforce.algolia_sync_queue q
WHERE q.status = 'failed'
ORDER BY q.processed_at DESC;

-- ============================================
-- 12. MAINTENANCE PROCEDURES
-- ============================================

-- Run this periodically (e.g., via cron job or scheduler)
CREATE OR REPLACE FUNCTION salesforce.run_algolia_maintenance()
RETURNS TABLE (
    task VARCHAR,
    items_affected INTEGER
) AS $$
DECLARE
    stuck_count INTEGER;
    cleanup_count INTEGER;
BEGIN
    -- Reset stuck processing items
    stuck_count := salesforce.reset_stuck_processing(10);
    RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;
    
    -- Cleanup old records (keep 7 days)
    cleanup_count := salesforce.cleanup_old_sync_records(7);
    RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;
    
    -- Vacuum analyze for performance
    EXECUTE 'VACUUM ANALYZE salesforce.algolia_sync_queue';
    EXECUTE 'VACUUM ANALYZE salesforce.algolia_sync_log';
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE salesforce.algolia_sync_queue IS 'Queue for tracking Algolia sync operations with retry logic';
COMMENT ON TABLE salesforce.algolia_sync_log IS 'Historical log of all Algolia sync operations for auditing';
COMMENT ON TABLE salesforce.algolia_index_config IS 'Configuration for Algolia indexes per table';
COMMENT ON FUNCTION salesforce.trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';
COMMENT ON FUNCTION salesforce.enqueue_algolia_sync(VARCHAR, VARCHAR, VARCHAR, JSONB) IS 'Enqueues a record for Algolia synchronization';
COMMENT ON FUNCTION salesforce.get_pending_algolia_syncs(INTEGER) IS 'Retrieves pending sync items for batch processing with row-level locking';
COMMENT ON FUNCTION salesforce.mark_sync_completed(BIGINT, VARCHAR, INTEGER, JSONB) IS 'Marks a sync operation as successfully completed';
COMMENT ON FUNCTION salesforce.mark_sync_failed(BIGINT, TEXT, JSONB) IS 'Marks a sync operation as failed with automatic retry logic';
COMMENT ON FUNCTION salesforce.reset_stuck_processing(INTEGER) IS 'Resets items stuck in processing state back to pending';
COMMENT ON FUNCTION salesforce.cleanup_old_sync_records(INTEGER) IS 'Removes old completed sync records to prevent table bloat';
COMMENT ON FUNCTION salesforce.run_algolia_maintenance() IS 'Runs all maintenance tasks - should be scheduled to run periodically';

-- ============================================
-- USAGE EXAMPLES
-- ============================================

/*
-- Fetch pending items for processing:
SELECT * FROM salesforce.get_pending_algolia_syncs(100);

-- Mark items as processing:
SELECT salesforce.mark_sync_processing(ARRAY[1, 2, 3]);

-- Mark as completed:
SELECT salesforce.mark_sync_completed(1, 'product_123', 150, '{"status": "ok"}'::jsonb);

-- Mark as failed:
SELECT salesforce.mark_sync_failed(1, 'Network timeout', '{"code": 500}'::jsonb);

-- Check sync health:
SELECT * FROM salesforce.algolia_sync_health;

-- View failed syncs:
SELECT * FROM salesforce.algolia_failed_syncs;

-- Run maintenance:
SELECT * FROM salesforce.run_algolia_maintenance();

-- Manual cleanup:
SELECT salesforce.cleanup_old_sync_records(7);
SELECT salesforce.reset_stuck_processing(10);

-- Check sync statistics:
SELECT * FROM salesforce.algolia_sync_stats;
*/