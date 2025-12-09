-- Enhanced trigger with logging for debugging bulk updates
CREATE OR REPLACE FUNCTION salesforce.trigger_algolia_sync()
RETURNS TRIGGER AS $$
DECLARE
    transform_func VARCHAR;
    payload JSONB;
    operation_type VARCHAR;
    full_table_name VARCHAR;
    record_id VARCHAR;
    records_changed BOOLEAN;
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
        -- Check if records actually changed
        BEGIN
            records_changed := (to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD));
        EXCEPTION WHEN OTHERS THEN
            -- Fallback: if to_jsonb fails, assume changed
            RAISE WARNING 'to_jsonb comparison failed for %, assuming changed', TG_TABLE_NAME;
            records_changed := TRUE;
        END;
        
        -- Only sync if relevant fields changed
        IF records_changed THEN
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
            
            -- Enqueue with error handling
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
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON salesforce.product2;

CREATE TRIGGER sf_product2_algolia_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON salesforce.product2
    FOR EACH ROW
    EXECUTE FUNCTION salesforce.trigger_algolia_sync();
