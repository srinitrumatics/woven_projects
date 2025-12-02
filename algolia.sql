-- ============================================
-- PostgreSQL to Algolia Integration Schema
-- Production-Ready Implementation
-- ============================================

-- 1. CREATE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search fallback

-- ============================================
-- 2. MAIN BUSINESS TABLES
-- ============================================

-- Products Table (Example)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    categories TEXT[] DEFAULT '{}',  -- Multiple categories as array
    brand VARCHAR(100),
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    tags TEXT[], -- Array of tags
    attributes JSONB, -- Flexible attributes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete
);

-- Create indexes for array searching
CREATE INDEX IF NOT EXISTS idx_products_categories_gin ON products USING gin(categories);

-- ============================================
-- 3. ALGOLIA SYNC QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS algolia_sync_queue (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    CONSTRAINT unique_pending_operation UNIQUE (table_name, record_id, operation, status)
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_algolia_queue_status ON algolia_sync_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_algolia_queue_table_record ON algolia_sync_queue(table_name, record_id);

-- ============================================
-- 4. ALGOLIA SYNC LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS algolia_sync_log (
    id BIGSERIAL PRIMARY KEY,
    queue_id BIGINT REFERENCES algolia_sync_queue(id),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    algolia_object_id VARCHAR(255),
    request_payload JSONB,
    response_payload JSONB,
    error_details TEXT,
    sync_duration_ms INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for monitoring and debugging
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON algolia_sync_log(status, synced_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_record ON algolia_sync_log(table_name, record_id);

-- ============================================
-- 5. ALGOLIA CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS algolia_index_config (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    batch_size INTEGER DEFAULT 100,
    transform_function VARCHAR(255), -- Name of PL/pgSQL function to transform data
    filter_condition TEXT, -- SQL WHERE clause to filter records
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configurations
INSERT INTO algolia_index_config (table_name, index_name, transform_function, filter_condition) VALUES
('products', 'products', 'transform_product_for_algolia', 'status = ''active'' AND deleted_at IS NULL')
ON CONFLICT (table_name) DO NOTHING;

-- ============================================
-- 6. DATA TRANSFORMATION FUNCTIONS
-- ============================================

-- Transform function for products to Algolia format
-- MUST be defined BEFORE triggers that use it
CREATE OR REPLACE FUNCTION transform_product_for_algolia(product_row products)
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'objectID', product_row.id::TEXT,
        'sku', product_row.sku,
        'name', product_row.name,
        'description', product_row.description,
        'price', product_row.price,
        'stock_quantity', product_row.stock_quantity,
        
        -- Multiple categories
        'categories', product_row.categories,  -- Array for faceting
        'category', product_row.categories[1], -- Primary category for backward compatibility
        
        'brand', product_row.brand,
        'image_url', product_row.image_url,
        'status', product_row.status,
        'tags', product_row.tags,
        'attributes', product_row.attributes,
        'created_at', EXTRACT(EPOCH FROM product_row.created_at)::BIGINT,
        'updated_at', EXTRACT(EPOCH FROM product_row.updated_at)::BIGINT,
        
        -- Special Algolia fields
        '_tags', array_cat(COALESCE(product_row.tags, '{}'), COALESCE(product_row.categories, '{}')) -- Combine tags and categories
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 7. QUEUE MANAGEMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION enqueue_algolia_sync(
    p_table_name VARCHAR,
    p_record_id UUID,
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
    FROM algolia_index_config 
    WHERE table_name = p_table_name;
    
    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Insert into queue (ON CONFLICT prevents duplicate pending operations)
    INSERT INTO algolia_sync_queue (table_name, record_id, operation, payload)
    VALUES (p_table_name, p_record_id, p_operation, p_payload)
    ON CONFLICT ON CONSTRAINT unique_pending_operation
    DO UPDATE SET 
        payload = EXCLUDED.payload,
        created_at = CURRENT_TIMESTAMP
    RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER FUNCTIONS
-- ============================================

-- Generic Trigger Function for Algolia Sync
CREATE OR REPLACE FUNCTION trigger_algolia_sync()
RETURNS TRIGGER AS $$
DECLARE
    transform_func VARCHAR;
    payload JSONB;
    operation_type VARCHAR;
BEGIN
    -- Get transform function for this table
    SELECT transform_function INTO transform_func
    FROM algolia_index_config
    WHERE table_name = TG_TABLE_NAME AND is_enabled = TRUE;
    
    IF transform_func IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Determine operation type and prepare payload
    IF (TG_OP = 'DELETE') THEN
        operation_type := 'DELETE';
        payload := jsonb_build_object('objectID', OLD.id::TEXT);
        
        PERFORM enqueue_algolia_sync(
            TG_TABLE_NAME::VARCHAR,
            OLD.id,
            operation_type,
            payload
        );
        
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        operation_type := 'INSERT';
        
        -- Execute transform function dynamically
        EXECUTE format('SELECT %I($1)', transform_func)
        USING NEW
        INTO payload;
        
        PERFORM enqueue_algolia_sync(
            TG_TABLE_NAME::VARCHAR,
            NEW.id,
            operation_type,
            payload
        );
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only sync if relevant fields changed
        IF (NEW IS DISTINCT FROM OLD) THEN
            operation_type := 'UPDATE';
            
            EXECUTE format('SELECT %I($1)', transform_func)
            USING NEW
            INTO payload;
            
            PERFORM enqueue_algolia_sync(
                TG_TABLE_NAME::VARCHAR,
                NEW.id,
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS products_algolia_sync_trigger ON products;

-- Products Triggers
CREATE TRIGGER products_algolia_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_algolia_sync();

-- ============================================
-- 10. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_timestamp ON products;

CREATE TRIGGER update_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. UTILITY FUNCTIONS
-- ============================================

-- Get pending sync items
CREATE OR REPLACE FUNCTION get_pending_algolia_syncs(batch_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    id BIGINT,
    table_name VARCHAR,
    record_id UUID,
    operation VARCHAR,
    payload JSONB,
    retry_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.retry_count < 5 -- Max retries
    ORDER BY q.created_at
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED; -- Prevents concurrent processing
END;
$$ LANGUAGE plpgsql;

-- Mark sync as completed
CREATE OR REPLACE FUNCTION mark_sync_completed(
    p_queue_id BIGINT,
    p_algolia_object_id VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE algolia_sync_queue
    SET 
        status = 'completed',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO algolia_sync_log (
        queue_id, table_name, record_id, operation, 
        status, algolia_object_id, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'completed', p_algolia_object_id, CURRENT_TIMESTAMP
    FROM algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Mark sync as failed
CREATE OR REPLACE FUNCTION mark_sync_failed(
    p_queue_id BIGINT,
    p_error_message TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE algolia_sync_queue
    SET 
        status = CASE 
            WHEN retry_count >= 4 THEN 'failed'::VARCHAR
            ELSE 'pending'::VARCHAR
        END,
        retry_count = retry_count + 1,
        error_message = p_error_message,
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO algolia_sync_log (
        queue_id, table_name, record_id, operation,
        status, error_details, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'failed', p_error_message, CURRENT_TIMESTAMP
    FROM algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old completed syncs
CREATE OR REPLACE FUNCTION cleanup_old_sync_records(days_to_keep INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM algolia_sync_queue
    WHERE status = 'completed'
    AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW algolia_sync_stats AS
SELECT 
    table_name,
    operation,
    status,
    COUNT(*) as count,
    MAX(created_at) as last_created,
    MAX(processed_at) as last_processed
FROM algolia_sync_queue
GROUP BY table_name, operation, status
ORDER BY table_name, operation, status;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE algolia_sync_queue IS 'Queue for tracking Algolia sync operations';
COMMENT ON TABLE algolia_sync_log IS 'Historical log of all Algolia sync operations';
COMMENT ON TABLE algolia_index_config IS 'Configuration for Algolia indexes per table';
COMMENT ON FUNCTION trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';
COMMENT ON FUNCTION enqueue_algolia_sync(VARCHAR, UUID, VARCHAR, JSONB) IS 'Enqueues a record for Algolia synchronization';
COMMENT ON FUNCTION get_pending_algolia_syncs(INTEGER) IS 'Retrieves pending sync items for batch processing';
COMMENT ON FUNCTION mark_sync_completed(BIGINT, VARCHAR) IS 'Marks a sync operation as successfully completed';
COMMENT ON FUNCTION mark_sync_failed(BIGINT, TEXT) IS 'Marks a sync operation as failed and increments retry count';