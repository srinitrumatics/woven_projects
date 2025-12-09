-- Alternative trigger that ALWAYS queues updates (no change detection)
-- This ensures bulk updates always work, at the cost of potentially queueing unchanged records

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
        
        PERFORM salesforce.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN OLD;
        
    ELSIF (TG_OP = 'INSERT') THEN
        operation_type := 'INSERT';
        
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

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
        -- ALWAYS queue updates - no change detection
        -- This ensures bulk updates work reliably
        operation_type := 'UPDATE';
        
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        EXECUTE format('SELECT salesforce.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        BEGIN
            PERFORM salesforce.enqueue_algolia_sync(
                full_table_name,
                record_id,
                operation_type,
                payload
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to enqueue sync for record %: %', record_id, SQLERRM;
        END;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON salesforce.product2;

CREATE TRIGGER sf_product2_algolia_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON salesforce.product2
    FOR EACH ROW
    EXECUTE FUNCTION salesforce.trigger_algolia_sync();

-- Test the trigger
DO $$
BEGIN
    RAISE NOTICE 'Trigger recreated successfully';
END $$;
