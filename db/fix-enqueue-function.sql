-- Fix the enqueue_algolia_sync function to use column names instead of constraint name
-- This is needed because we converted the constraint to a partial unique index

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
    -- Use column names instead of constraint name since we now have a partial index
    INSERT INTO salesforce.algolia_sync_queue (table_name, record_id, operation, payload, status)
    VALUES (p_table_name, p_record_id, p_operation, p_payload, 'pending')
    ON CONFLICT (table_name, record_id, operation) WHERE status = 'pending'
    DO UPDATE SET 
        payload = EXCLUDED.payload,
        created_at = CURRENT_TIMESTAMP,
        retry_count = 0,
        error_message = NULL
    RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql;
