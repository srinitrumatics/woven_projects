--
-- PostgreSQL database dump
--

\restrict 39h8HlzMF9fQOh8wuJCHQ6UiFhH2MrccxpuqfR5Kxh4CV4weDNC4Zqsz0kTeG08

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: salesforce; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA salesforce;


ALTER SCHEMA salesforce OWNER TO postgres;

--
-- Name: sf_00dcb00000deud4eah; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA sf_00dcb00000deud4eah;


ALTER SCHEMA sf_00dcb00000deud4eah OWNER TO postgres;

--
-- Name: sf_546546ffdfdsfd; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA sf_546546ffdfdsfd;


ALTER SCHEMA sf_546546ffdfdsfd OWNER TO postgres;

--
-- Name: sf_tyu57865785dgdds; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA sf_tyu57865785dgdds;


ALTER SCHEMA sf_tyu57865785dgdds OWNER TO postgres;

--
-- Name: cleanup_old_sync_records(integer); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.cleanup_old_sync_records(days_to_keep integer DEFAULT 7) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM salesforce.algolia_sync_queue
    WHERE status = 'completed'
    AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION salesforce.cleanup_old_sync_records(days_to_keep integer) OWNER TO postgres;

--
-- Name: FUNCTION cleanup_old_sync_records(days_to_keep integer); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.cleanup_old_sync_records(days_to_keep integer) IS 'Removes old completed sync records to prevent table bloat';


--
-- Name: enqueue_algolia_sync(character varying, character varying, character varying, jsonb); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
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
    ON CONFLICT (table_name, record_id, operation) WHERE status = 'pending'
    DO UPDATE SET 
        payload = EXCLUDED.payload,
        created_at = CURRENT_TIMESTAMP,
        retry_count = 0,
        error_message = NULL
    RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$$;


ALTER FUNCTION salesforce.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) IS 'Enqueues a record for Algolia synchronization';


--
-- Name: get_pending_algolia_syncs(integer); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.get_pending_algolia_syncs(batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.get_pending_algolia_syncs(batch_limit integer) OWNER TO postgres;

--
-- Name: FUNCTION get_pending_algolia_syncs(batch_limit integer); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.get_pending_algolia_syncs(batch_limit integer) IS 'Retrieves pending sync items for batch processing with row-level locking';


--
-- Name: get_pending_syncs_by_table(character varying, integer); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) OWNER TO postgres;

--
-- Name: mark_sync_completed(bigint, character varying, integer, jsonb); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying DEFAULT NULL::character varying, p_sync_duration_ms integer DEFAULT NULL::integer, p_response_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) IS 'Marks a sync operation as successfully completed';


--
-- Name: mark_sync_failed(bigint, text, jsonb); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) IS 'Marks a sync operation as failed with automatic retry logic';


--
-- Name: mark_sync_processing(bigint[]); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.mark_sync_processing(p_queue_ids bigint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE salesforce.algolia_sync_queue
    SET 
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = ANY(p_queue_ids)
    AND status = 'pending';
END;
$$;


ALTER FUNCTION salesforce.mark_sync_processing(p_queue_ids bigint[]) OWNER TO postgres;

--
-- Name: reset_stuck_processing(integer); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.reset_stuck_processing(timeout_minutes integer DEFAULT 10) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.reset_stuck_processing(timeout_minutes integer) OWNER TO postgres;

--
-- Name: FUNCTION reset_stuck_processing(timeout_minutes integer); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.reset_stuck_processing(timeout_minutes integer) IS 'Resets items stuck in processing state back to pending';


--
-- Name: run_algolia_maintenance(); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.run_algolia_maintenance() RETURNS TABLE(task character varying, items_affected integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION salesforce.run_algolia_maintenance() OWNER TO postgres;

--
-- Name: FUNCTION run_algolia_maintenance(); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.run_algolia_maintenance() IS 'Runs all maintenance tasks - should be scheduled to run periodically';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: product2; Type: TABLE; Schema: salesforce; Owner: postgres
--

CREATE TABLE salesforce.product2 (
    sfid character varying(18) NOT NULL,
    productcode character varying(255),
    name character varying(255),
    description text,
    isactive boolean,
    family character varying(255),
    image_url jsonb,
    gtherp__price__c numeric,
    gtherp__stock_quantity__c numeric,
    gtherp__available_quantity__c numeric,
    gtherp__discount__c numeric,
    gtherp__category__c character varying(255),
    gtherp__sub_category__c character varying(255),
    manufacturer_name__c character varying(255),
    createddate timestamp without time zone,
    systemmodstamp timestamp without time zone,
    product_availability__c character varying(255),
    list_price__c numeric
);


ALTER TABLE salesforce.product2 OWNER TO postgres;

--
-- Name: transform_sf_product_for_algolia(salesforce.product2); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
 BEGIN
     RETURN jsonb_strip_nulls(jsonb_build_object(
         'objectID', product_row.sfid,
         'sku', product_row.productcode,
         'name', product_row.name,
         'description', product_row.description,
         'price', COALESCE(product_row.gtherp__price__c, 0),
         'listPrice', COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
         'list_price__c', product_row.list_price__c,
         'unitPrice', COALESCE(product_row.gtherp__price__c, 0),
         'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
         'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
         'discount', COALESCE(product_row.gtherp__discount__c, 0),

         -- Primary image URL (first image for backward compatibility)
         'image_url', CASE
             WHEN product_row.image_url IS NOT NULL
                 AND product_row.image_url->'images' IS NOT NULL
                 AND jsonb_array_length(product_row.image_url->'images') > 0
                 THEN product_row.image_url#>>'{images,0,url}'
             ELSE NULL
         END,

         -- All images array (for gallery/carousel)
         'images', CASE
             WHEN product_row.image_url IS NOT NULL
                 AND product_row.image_url->'images' IS NOT NULL
                 THEN product_row.image_url->'images'
             ELSE '[]'::jsonb
         END,

         -- Categories and Family
         'category', product_row.gtherp__category__c,
         'sub_category', product_row.gtherp__sub_category__c,
         'family', product_row.family,
         'manufacturer', product_row.manufacturer_name__c,

         'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
         'is_active', product_row.isactive,
         'product_availability', product_row.product_availability__c,

         'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
         'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,

         -- Searchable tags (remove NULLs)
         '_tags', ARRAY_REMOVE(ARRAY[
             product_row.family,
             product_row.gtherp__category__c,
             product_row.gtherp__sub_category__c,
             product_row.manufacturer_name__c,
             product_row.product_availability__c
         ], NULL)
     ));
 END;
 $$;


ALTER FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2) OWNER TO postgres;

--
-- Name: trigger_algolia_sync(); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.trigger_algolia_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
        -- ALWAYS queue updates - no change detection
        -- This ensures bulk updates work reliably
        -- The ON CONFLICT in enqueue_algolia_sync will handle duplicates
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
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$_$;


ALTER FUNCTION salesforce.trigger_algolia_sync() OWNER TO postgres;

--
-- Name: FUNCTION trigger_algolia_sync(); Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON FUNCTION salesforce.trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: salesforce; Owner: postgres
--

CREATE FUNCTION salesforce.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION salesforce.update_updated_at_column() OWNER TO postgres;

--
-- Name: cleanup_old_sync_records(integer); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.cleanup_old_sync_records(days_to_keep integer DEFAULT 7) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sf_00dcb00000deud4eah.algolia_sync_queue
    WHERE status = 'completed'
    AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.cleanup_old_sync_records(days_to_keep integer) OWNER TO postgres;

--
-- Name: FUNCTION cleanup_old_sync_records(days_to_keep integer); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.cleanup_old_sync_records(days_to_keep integer) IS 'Removes old completed sync records to prevent table bloat';


--
-- Name: enqueue_algolia_sync(character varying, character varying, character varying, jsonb); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    queue_id BIGINT;
    config_enabled BOOLEAN;
BEGIN
    -- Check if indexing is enabled for this table
    SELECT is_enabled INTO config_enabled 
    FROM sf_00dcb00000deud4eah.algolia_index_config 
    WHERE table_name = p_table_name;
    
    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Insert into queue (ON CONFLICT prevents duplicate pending operations)
    INSERT INTO sf_00dcb00000deud4eah.algolia_sync_queue (table_name, record_id, operation, payload, status)
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
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) IS 'Enqueues a record for Algolia synchronization';


--
-- Name: get_pending_algolia_syncs(integer); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.get_pending_algolia_syncs(batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    -- Get max retries from config (use 5 as default)
    SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries
    FROM sf_00dcb00000deud4eah.algolia_index_config c;

    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_00dcb00000deud4eah.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.retry_count < max_retries
    ORDER BY q.created_at
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED; -- Prevents concurrent processing
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.get_pending_algolia_syncs(batch_limit integer) OWNER TO postgres;

--
-- Name: FUNCTION get_pending_algolia_syncs(batch_limit integer); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.get_pending_algolia_syncs(batch_limit integer) IS 'Retrieves pending sync items for batch processing with row-level locking';


--
-- Name: get_pending_syncs_by_table(character varying, integer); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_00dcb00000deud4eah.algolia_index_config c
    WHERE c.table_name = p_table_name;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_00dcb00000deud4eah.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.table_name = p_table_name
    AND q.retry_count < COALESCE(max_retries, 5)
    ORDER BY q.created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) OWNER TO postgres;

--
-- Name: mark_sync_completed(bigint, character varying, integer, jsonb); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying DEFAULT NULL::character varying, p_sync_duration_ms integer DEFAULT NULL::integer, p_response_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_00dcb00000deud4eah.algolia_sync_queue
    SET 
        status = 'completed',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO sf_00dcb00000deud4eah.algolia_sync_log (
        queue_id, table_name, record_id, operation, 
        status, algolia_object_id, sync_duration_ms,
        response_payload, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'completed', p_algolia_object_id, p_sync_duration_ms,
        p_response_payload, CURRENT_TIMESTAMP
    FROM sf_00dcb00000deud4eah.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) IS 'Marks a sync operation as successfully completed';


--
-- Name: mark_sync_failed(bigint, text, jsonb); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
    current_retry_count INTEGER;
    target_table_name VARCHAR;
BEGIN
    -- Get current state
    SELECT q.table_name, q.retry_count 
    INTO target_table_name, current_retry_count
    FROM sf_00dcb00000deud4eah.algolia_sync_queue q
    WHERE q.id = p_queue_id;
    
    -- Get max retries from config
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_00dcb00000deud4eah.algolia_index_config c
    WHERE c.table_name = target_table_name;
    
    -- Update queue with retry logic
    UPDATE sf_00dcb00000deud4eah.algolia_sync_queue
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
    INSERT INTO sf_00dcb00000deud4eah.algolia_sync_log (
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
    FROM sf_00dcb00000deud4eah.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) IS 'Marks a sync operation as failed with automatic retry logic';


--
-- Name: mark_sync_processing(bigint[]); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.mark_sync_processing(p_queue_ids bigint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_00dcb00000deud4eah.algolia_sync_queue
    SET 
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = ANY(p_queue_ids)
    AND status = 'pending';
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.mark_sync_processing(p_queue_ids bigint[]) OWNER TO postgres;

--
-- Name: reset_stuck_processing(integer); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.reset_stuck_processing(timeout_minutes integer DEFAULT 10) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE sf_00dcb00000deud4eah.algolia_sync_queue
    SET 
        status = 'pending',
        processed_at = NULL,
        error_message = 'Reset from stuck processing state'
    WHERE status = 'processing'
    AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.reset_stuck_processing(timeout_minutes integer) OWNER TO postgres;

--
-- Name: FUNCTION reset_stuck_processing(timeout_minutes integer); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.reset_stuck_processing(timeout_minutes integer) IS 'Resets items stuck in processing state back to pending';


--
-- Name: run_algolia_maintenance(); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.run_algolia_maintenance() RETURNS TABLE(task character varying, items_affected integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    stuck_count INTEGER;
    cleanup_count INTEGER;
BEGIN
    -- Reset stuck processing items
    stuck_count := sf_00dcb00000deud4eah.reset_stuck_processing(10);
    RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;
    
    -- Cleanup old records (keep 7 days)
    cleanup_count := sf_00dcb00000deud4eah.cleanup_old_sync_records(7);
    RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;
    
    -- Vacuum analyze for performance
    EXECUTE 'VACUUM ANALYZE sf_00dcb00000deud4eah.algolia_sync_queue';
    EXECUTE 'VACUUM ANALYZE sf_00dcb00000deud4eah.algolia_sync_log';
    
    RETURN;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.run_algolia_maintenance() OWNER TO postgres;

--
-- Name: FUNCTION run_algolia_maintenance(); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.run_algolia_maintenance() IS 'Runs all maintenance tasks - should be scheduled to run periodically';


--
-- Name: product2; Type: TABLE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE TABLE sf_00dcb00000deud4eah.product2 (
    sfid character varying(18) NOT NULL,
    productcode character varying(255),
    name character varying(255),
    description text,
    isactive boolean,
    family character varying(255),
    image_url jsonb,
    gtherp__price__c numeric,
    gtherp__stock_quantity__c numeric,
    gtherp__available_quantity__c numeric,
    gtherp__discount__c numeric,
    gtherp__category__c character varying(255),
    gtherp__sub_category__c character varying(255),
    manufacturer_name__c character varying(255),
    product_availability__c character varying(255),
    createddate timestamp without time zone,
    systemmodstamp timestamp without time zone,
    list_price__c numeric
);


ALTER TABLE sf_00dcb00000deud4eah.product2 OWNER TO postgres;

--
-- Name: transform_sf_product_for_algolia(sf_00dcb00000deud4eah.product2); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.transform_sf_product_for_algolia(product_row sf_00dcb00000deud4eah.product2) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
 BEGIN
     RETURN jsonb_strip_nulls(jsonb_build_object(
         'objectID', product_row.sfid,
         'sku', product_row.productcode,
         'name', product_row.name,
         'description', product_row.description,
         'price', COALESCE(product_row.gtherp__price__c, 0),
         'listPrice', COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
         'list_price__c', product_row.list_price__c,
         'unitPrice', COALESCE(product_row.gtherp__price__c, 0),
         'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
         'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
         'discount', COALESCE(product_row.gtherp__discount__c, 0),
         'image_url', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  AND jsonb_array_length(product_row.image_url->'images') > 0
                  THEN product_row.image_url#>>'{images,0,url}'
             ELSE NULL
         END,
         'images', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  THEN product_row.image_url->'images'
             ELSE '[]'::jsonb
         END,
         'category', product_row.gtherp__category__c,
         'sub_category', product_row.gtherp__sub_category__c,
         'family', product_row.family,
         'manufacturer', product_row.manufacturer_name__c,
         'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
         'is_active', product_row.isactive,
         'product_availability', product_row.product_availability__c,
         'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
         'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
         '_tags', ARRAY_REMOVE(ARRAY[
             product_row.family, product_row.gtherp__category__c,
             product_row.gtherp__sub_category__c, product_row.manufacturer_name__c,
             product_row.product_availability__c
         ], NULL)
     ));
 END;
 $$;


ALTER FUNCTION sf_00dcb00000deud4eah.transform_sf_product_for_algolia(product_row sf_00dcb00000deud4eah.product2) OWNER TO postgres;

--
-- Name: trigger_algolia_sync(); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.trigger_algolia_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
    FROM sf_00dcb00000deud4eah.algolia_index_config
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
            record_id := OLD.sfid::TEXT; -- Try sfid first for sf_00dgk000007zmr7uam
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                record_id := OLD.id::TEXT; -- Fallback to id
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not determine record ID for deletion';
                RETURN OLD;
            END;
        END;

        payload := jsonb_build_object('objectID', record_id);
        
        PERFORM sf_00dcb00000deud4eah.enqueue_algolia_sync(
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
        EXECUTE format('SELECT sf_00dcb00000deud4eah.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        PERFORM sf_00dcb00000deud4eah.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- ALWAYS queue updates - no change detection
        -- This ensures bulk updates work reliably
        -- The ON CONFLICT in enqueue_algolia_sync will handle duplicates
        operation_type := 'UPDATE';
        
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        -- Execute transform function dynamically with schema qualification
        EXECUTE format('SELECT sf_00dcb00000deud4eah.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        -- Enqueue with error handling
        BEGIN
            PERFORM sf_00dcb00000deud4eah.enqueue_algolia_sync(
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
$_$;


ALTER FUNCTION sf_00dcb00000deud4eah.trigger_algolia_sync() OWNER TO postgres;

--
-- Name: FUNCTION trigger_algolia_sync(); Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON FUNCTION sf_00dcb00000deud4eah.trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE FUNCTION sf_00dcb00000deud4eah.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION sf_00dcb00000deud4eah.update_updated_at_column() OWNER TO postgres;

--
-- Name: cleanup_old_sync_records(integer); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.cleanup_old_sync_records(days_to_keep integer DEFAULT 7) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sf_546546ffdfdsfd.algolia_sync_queue
    WHERE status = 'completed'
    AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.cleanup_old_sync_records(days_to_keep integer) OWNER TO postgres;

--
-- Name: FUNCTION cleanup_old_sync_records(days_to_keep integer); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.cleanup_old_sync_records(days_to_keep integer) IS 'Removes old completed sync records to prevent table bloat';


--
-- Name: enqueue_algolia_sync(character varying, character varying, character varying, jsonb); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    queue_id BIGINT;
    config_enabled BOOLEAN;
BEGIN
    -- Check if indexing is enabled for this table
    SELECT is_enabled INTO config_enabled 
    FROM sf_546546ffdfdsfd.algolia_index_config 
    WHERE table_name = p_table_name;
    
    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Insert into queue (ON CONFLICT prevents duplicate pending operations)
    INSERT INTO sf_546546ffdfdsfd.algolia_sync_queue (table_name, record_id, operation, payload, status)
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
$$;


ALTER FUNCTION sf_546546ffdfdsfd.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) IS 'Enqueues a record for Algolia synchronization';


--
-- Name: get_pending_algolia_syncs(integer); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.get_pending_algolia_syncs(batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    -- Get max retries from config (use 5 as default)
    SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries
    FROM sf_546546ffdfdsfd.algolia_index_config c;

    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_546546ffdfdsfd.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.retry_count < max_retries
    ORDER BY q.created_at
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED; -- Prevents concurrent processing
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.get_pending_algolia_syncs(batch_limit integer) OWNER TO postgres;

--
-- Name: FUNCTION get_pending_algolia_syncs(batch_limit integer); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.get_pending_algolia_syncs(batch_limit integer) IS 'Retrieves pending sync items for batch processing with row-level locking';


--
-- Name: get_pending_syncs_by_table(character varying, integer); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_546546ffdfdsfd.algolia_index_config c
    WHERE c.table_name = p_table_name;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_546546ffdfdsfd.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.table_name = p_table_name
    AND q.retry_count < COALESCE(max_retries, 5)
    ORDER BY q.created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) OWNER TO postgres;

--
-- Name: mark_sync_completed(bigint, character varying, integer, jsonb); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying DEFAULT NULL::character varying, p_sync_duration_ms integer DEFAULT NULL::integer, p_response_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_546546ffdfdsfd.algolia_sync_queue
    SET 
        status = 'completed',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO sf_546546ffdfdsfd.algolia_sync_log (
        queue_id, table_name, record_id, operation, 
        status, algolia_object_id, sync_duration_ms,
        response_payload, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'completed', p_algolia_object_id, p_sync_duration_ms,
        p_response_payload, CURRENT_TIMESTAMP
    FROM sf_546546ffdfdsfd.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) IS 'Marks a sync operation as successfully completed';


--
-- Name: mark_sync_failed(bigint, text, jsonb); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
    current_retry_count INTEGER;
    target_table_name VARCHAR;
BEGIN
    -- Get current state
    SELECT q.table_name, q.retry_count 
    INTO target_table_name, current_retry_count
    FROM sf_546546ffdfdsfd.algolia_sync_queue q
    WHERE q.id = p_queue_id;
    
    -- Get max retries from config
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_546546ffdfdsfd.algolia_index_config c
    WHERE c.table_name = target_table_name;
    
    -- Update queue with retry logic
    UPDATE sf_546546ffdfdsfd.algolia_sync_queue
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
    INSERT INTO sf_546546ffdfdsfd.algolia_sync_log (
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
    FROM sf_546546ffdfdsfd.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) IS 'Marks a sync operation as failed with automatic retry logic';


--
-- Name: mark_sync_processing(bigint[]); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.mark_sync_processing(p_queue_ids bigint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_546546ffdfdsfd.algolia_sync_queue
    SET 
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = ANY(p_queue_ids)
    AND status = 'pending';
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.mark_sync_processing(p_queue_ids bigint[]) OWNER TO postgres;

--
-- Name: reset_stuck_processing(integer); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.reset_stuck_processing(timeout_minutes integer DEFAULT 10) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE sf_546546ffdfdsfd.algolia_sync_queue
    SET 
        status = 'pending',
        processed_at = NULL,
        error_message = 'Reset from stuck processing state'
    WHERE status = 'processing'
    AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.reset_stuck_processing(timeout_minutes integer) OWNER TO postgres;

--
-- Name: FUNCTION reset_stuck_processing(timeout_minutes integer); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.reset_stuck_processing(timeout_minutes integer) IS 'Resets items stuck in processing state back to pending';


--
-- Name: run_algolia_maintenance(); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.run_algolia_maintenance() RETURNS TABLE(task character varying, items_affected integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    stuck_count INTEGER;
    cleanup_count INTEGER;
BEGIN
    -- Reset stuck processing items
    stuck_count := sf_546546ffdfdsfd.reset_stuck_processing(10);
    RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;
    
    -- Cleanup old records (keep 7 days)
    cleanup_count := sf_546546ffdfdsfd.cleanup_old_sync_records(7);
    RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;
    
    -- Vacuum analyze for performance
    EXECUTE 'VACUUM ANALYZE sf_546546ffdfdsfd.algolia_sync_queue';
    EXECUTE 'VACUUM ANALYZE sf_546546ffdfdsfd.algolia_sync_log';
    
    RETURN;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.run_algolia_maintenance() OWNER TO postgres;

--
-- Name: FUNCTION run_algolia_maintenance(); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.run_algolia_maintenance() IS 'Runs all maintenance tasks - should be scheduled to run periodically';


--
-- Name: product2; Type: TABLE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE TABLE sf_546546ffdfdsfd.product2 (
    sfid character varying(18) NOT NULL,
    productcode character varying(255),
    name character varying(255),
    description text,
    isactive boolean,
    family character varying(255),
    image_url jsonb,
    gtherp__price__c numeric,
    gtherp__stock_quantity__c numeric,
    gtherp__available_quantity__c numeric,
    gtherp__discount__c numeric,
    gtherp__category__c character varying(255),
    gtherp__sub_category__c character varying(255),
    manufacturer_name__c character varying(255),
    product_availability__c character varying(255),
    createddate timestamp without time zone,
    systemmodstamp timestamp without time zone,
    list_price__c numeric
);


ALTER TABLE sf_546546ffdfdsfd.product2 OWNER TO postgres;

--
-- Name: transform_sf_product_for_algolia(sf_546546ffdfdsfd.product2); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.transform_sf_product_for_algolia(product_row sf_546546ffdfdsfd.product2) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
 BEGIN
     RETURN jsonb_strip_nulls(jsonb_build_object(
         'objectID', product_row.sfid,
         'sku', product_row.productcode,
         'name', product_row.name,
         'description', product_row.description,
         'price', COALESCE(product_row.gtherp__price__c, 0),
         'listPrice', COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
         'list_price__c', product_row.list_price__c,
         'unitPrice', COALESCE(product_row.gtherp__price__c, 0),
         'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
         'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
         'discount', COALESCE(product_row.gtherp__discount__c, 0),
         'image_url', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  AND jsonb_array_length(product_row.image_url->'images') > 0
                  THEN product_row.image_url#>>'{images,0,url}'
             ELSE NULL
         END,
         'images', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  THEN product_row.image_url->'images'
             ELSE '[]'::jsonb
         END,
         'category', product_row.gtherp__category__c,
         'sub_category', product_row.gtherp__sub_category__c,
         'family', product_row.family,
         'manufacturer', product_row.manufacturer_name__c,
         'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
         'is_active', product_row.isactive,
         'product_availability', product_row.product_availability__c,
         'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
         'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
         '_tags', ARRAY_REMOVE(ARRAY[
             product_row.family, product_row.gtherp__category__c,
             product_row.gtherp__sub_category__c, product_row.manufacturer_name__c,
             product_row.product_availability__c
         ], NULL)
     ));
 END;
 $$;


ALTER FUNCTION sf_546546ffdfdsfd.transform_sf_product_for_algolia(product_row sf_546546ffdfdsfd.product2) OWNER TO postgres;

--
-- Name: trigger_algolia_sync(); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.trigger_algolia_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
    FROM sf_546546ffdfdsfd.algolia_index_config
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
            record_id := OLD.sfid::TEXT; -- Try sfid first for sf_00dgk000007zmr7uam
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                record_id := OLD.id::TEXT; -- Fallback to id
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not determine record ID for deletion';
                RETURN OLD;
            END;
        END;

        payload := jsonb_build_object('objectID', record_id);
        
        PERFORM sf_546546ffdfdsfd.enqueue_algolia_sync(
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
        EXECUTE format('SELECT sf_546546ffdfdsfd.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        PERFORM sf_546546ffdfdsfd.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- ALWAYS queue updates - no change detection
        -- This ensures bulk updates work reliably
        -- The ON CONFLICT in enqueue_algolia_sync will handle duplicates
        operation_type := 'UPDATE';
        
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        -- Execute transform function dynamically with schema qualification
        EXECUTE format('SELECT sf_546546ffdfdsfd.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        -- Enqueue with error handling
        BEGIN
            PERFORM sf_546546ffdfdsfd.enqueue_algolia_sync(
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
$_$;


ALTER FUNCTION sf_546546ffdfdsfd.trigger_algolia_sync() OWNER TO postgres;

--
-- Name: FUNCTION trigger_algolia_sync(); Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON FUNCTION sf_546546ffdfdsfd.trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE FUNCTION sf_546546ffdfdsfd.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION sf_546546ffdfdsfd.update_updated_at_column() OWNER TO postgres;

--
-- Name: cleanup_old_sync_records(integer); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.cleanup_old_sync_records(days_to_keep integer DEFAULT 7) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sf_tyu57865785dgdds.algolia_sync_queue
    WHERE status = 'completed'
    AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.cleanup_old_sync_records(days_to_keep integer) OWNER TO postgres;

--
-- Name: FUNCTION cleanup_old_sync_records(days_to_keep integer); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.cleanup_old_sync_records(days_to_keep integer) IS 'Removes old completed sync records to prevent table bloat';


--
-- Name: enqueue_algolia_sync(character varying, character varying, character varying, jsonb); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    queue_id BIGINT;
    config_enabled BOOLEAN;
BEGIN
    -- Check if indexing is enabled for this table
    SELECT is_enabled INTO config_enabled 
    FROM sf_tyu57865785dgdds.algolia_index_config 
    WHERE table_name = p_table_name;
    
    IF config_enabled IS FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Insert into queue (ON CONFLICT prevents duplicate pending operations)
    INSERT INTO sf_tyu57865785dgdds.algolia_sync_queue (table_name, record_id, operation, payload, status)
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
$$;


ALTER FUNCTION sf_tyu57865785dgdds.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) IS 'Enqueues a record for Algolia synchronization';


--
-- Name: get_pending_algolia_syncs(integer); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.get_pending_algolia_syncs(batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    -- Get max retries from config (use 5 as default)
    SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries
    FROM sf_tyu57865785dgdds.algolia_index_config c;

    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_tyu57865785dgdds.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.retry_count < max_retries
    ORDER BY q.created_at
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED; -- Prevents concurrent processing
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.get_pending_algolia_syncs(batch_limit integer) OWNER TO postgres;

--
-- Name: FUNCTION get_pending_algolia_syncs(batch_limit integer); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.get_pending_algolia_syncs(batch_limit integer) IS 'Retrieves pending sync items for batch processing with row-level locking';


--
-- Name: get_pending_syncs_by_table(character varying, integer); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer DEFAULT 100) RETURNS TABLE(id bigint, table_name character varying, record_id character varying, operation character varying, payload jsonb, retry_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
BEGIN
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_tyu57865785dgdds.algolia_index_config c
    WHERE c.table_name = p_table_name;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.table_name,
        q.record_id,
        q.operation,
        q.payload,
        q.retry_count
    FROM sf_tyu57865785dgdds.algolia_sync_queue q
    WHERE q.status = 'pending'
    AND q.table_name = p_table_name
    AND q.retry_count < COALESCE(max_retries, 5)
    ORDER BY q.created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) OWNER TO postgres;

--
-- Name: mark_sync_completed(bigint, character varying, integer, jsonb); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying DEFAULT NULL::character varying, p_sync_duration_ms integer DEFAULT NULL::integer, p_response_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_tyu57865785dgdds.algolia_sync_queue
    SET 
        status = 'completed',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_id;
    
    INSERT INTO sf_tyu57865785dgdds.algolia_sync_log (
        queue_id, table_name, record_id, operation, 
        status, algolia_object_id, sync_duration_ms,
        response_payload, synced_at
    )
    SELECT 
        id, table_name, record_id, operation,
        'completed', p_algolia_object_id, p_sync_duration_ms,
        p_response_payload, CURRENT_TIMESTAMP
    FROM sf_tyu57865785dgdds.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) IS 'Marks a sync operation as successfully completed';


--
-- Name: mark_sync_failed(bigint, text, jsonb); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_retries INTEGER;
    current_retry_count INTEGER;
    target_table_name VARCHAR;
BEGIN
    -- Get current state
    SELECT q.table_name, q.retry_count 
    INTO target_table_name, current_retry_count
    FROM sf_tyu57865785dgdds.algolia_sync_queue q
    WHERE q.id = p_queue_id;
    
    -- Get max retries from config
    SELECT COALESCE(c.max_retries, 5) INTO max_retries
    FROM sf_tyu57865785dgdds.algolia_index_config c
    WHERE c.table_name = target_table_name;
    
    -- Update queue with retry logic
    UPDATE sf_tyu57865785dgdds.algolia_sync_queue
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
    INSERT INTO sf_tyu57865785dgdds.algolia_sync_log (
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
    FROM sf_tyu57865785dgdds.algolia_sync_queue
    WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) OWNER TO postgres;

--
-- Name: FUNCTION mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) IS 'Marks a sync operation as failed with automatic retry logic';


--
-- Name: mark_sync_processing(bigint[]); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.mark_sync_processing(p_queue_ids bigint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sf_tyu57865785dgdds.algolia_sync_queue
    SET 
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP
    WHERE id = ANY(p_queue_ids)
    AND status = 'pending';
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.mark_sync_processing(p_queue_ids bigint[]) OWNER TO postgres;

--
-- Name: reset_stuck_processing(integer); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.reset_stuck_processing(timeout_minutes integer DEFAULT 10) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE sf_tyu57865785dgdds.algolia_sync_queue
    SET 
        status = 'pending',
        processed_at = NULL,
        error_message = 'Reset from stuck processing state'
    WHERE status = 'processing'
    AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.reset_stuck_processing(timeout_minutes integer) OWNER TO postgres;

--
-- Name: FUNCTION reset_stuck_processing(timeout_minutes integer); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.reset_stuck_processing(timeout_minutes integer) IS 'Resets items stuck in processing state back to pending';


--
-- Name: run_algolia_maintenance(); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.run_algolia_maintenance() RETURNS TABLE(task character varying, items_affected integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    stuck_count INTEGER;
    cleanup_count INTEGER;
BEGIN
    -- Reset stuck processing items
    stuck_count := sf_tyu57865785dgdds.reset_stuck_processing(10);
    RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;
    
    -- Cleanup old records (keep 7 days)
    cleanup_count := sf_tyu57865785dgdds.cleanup_old_sync_records(7);
    RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;
    
    -- Vacuum analyze for performance
    EXECUTE 'VACUUM ANALYZE sf_tyu57865785dgdds.algolia_sync_queue';
    EXECUTE 'VACUUM ANALYZE sf_tyu57865785dgdds.algolia_sync_log';
    
    RETURN;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.run_algolia_maintenance() OWNER TO postgres;

--
-- Name: FUNCTION run_algolia_maintenance(); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.run_algolia_maintenance() IS 'Runs all maintenance tasks - should be scheduled to run periodically';


--
-- Name: product2; Type: TABLE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE TABLE sf_tyu57865785dgdds.product2 (
    sfid character varying(18) NOT NULL,
    productcode character varying(255),
    name character varying(255),
    description text,
    isactive boolean,
    family character varying(255),
    image_url jsonb,
    gtherp__price__c numeric,
    gtherp__stock_quantity__c numeric,
    gtherp__available_quantity__c numeric,
    gtherp__discount__c numeric,
    gtherp__category__c character varying(255),
    gtherp__sub_category__c character varying(255),
    manufacturer_name__c character varying(255),
    product_availability__c character varying(255),
    createddate timestamp without time zone,
    systemmodstamp timestamp without time zone,
    list_price__c numeric
);


ALTER TABLE sf_tyu57865785dgdds.product2 OWNER TO postgres;

--
-- Name: transform_sf_product_for_algolia(sf_tyu57865785dgdds.product2); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.transform_sf_product_for_algolia(product_row sf_tyu57865785dgdds.product2) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
 BEGIN
     RETURN jsonb_strip_nulls(jsonb_build_object(
         'objectID', product_row.sfid,
         'sku', product_row.productcode,
         'name', product_row.name,
         'description', product_row.description,
         'price', COALESCE(product_row.gtherp__price__c, 0),
         'listPrice', COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
         'list_price__c', product_row.list_price__c,
         'unitPrice', COALESCE(product_row.gtherp__price__c, 0),
         'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
         'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
         'discount', COALESCE(product_row.gtherp__discount__c, 0),
         'image_url', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  AND jsonb_array_length(product_row.image_url->'images') > 0
                  THEN product_row.image_url#>>'{images,0,url}'
             ELSE NULL
         END,
         'images', CASE
             WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
                  THEN product_row.image_url->'images'
             ELSE '[]'::jsonb
         END,
         'category', product_row.gtherp__category__c,
         'sub_category', product_row.gtherp__sub_category__c,
         'family', product_row.family,
         'manufacturer', product_row.manufacturer_name__c,
         'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
         'is_active', product_row.isactive,
         'product_availability', product_row.product_availability__c,
         'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
         'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
         '_tags', ARRAY_REMOVE(ARRAY[
             product_row.family, product_row.gtherp__category__c,
             product_row.gtherp__sub_category__c, product_row.manufacturer_name__c,
             product_row.product_availability__c
         ], NULL)
     ));
 END;
 $$;


ALTER FUNCTION sf_tyu57865785dgdds.transform_sf_product_for_algolia(product_row sf_tyu57865785dgdds.product2) OWNER TO postgres;

--
-- Name: trigger_algolia_sync(); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.trigger_algolia_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
    FROM sf_tyu57865785dgdds.algolia_index_config
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
            record_id := OLD.sfid::TEXT; -- Try sfid first for sf_00dgk000007zmr7uam
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                record_id := OLD.id::TEXT; -- Fallback to id
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not determine record ID for deletion';
                RETURN OLD;
            END;
        END;

        payload := jsonb_build_object('objectID', record_id);
        
        PERFORM sf_tyu57865785dgdds.enqueue_algolia_sync(
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
        EXECUTE format('SELECT sf_tyu57865785dgdds.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        PERFORM sf_tyu57865785dgdds.enqueue_algolia_sync(
            full_table_name,
            record_id,
            operation_type,
            payload
        );
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- ALWAYS queue updates - no change detection
        -- This ensures bulk updates work reliably
        -- The ON CONFLICT in enqueue_algolia_sync will handle duplicates
        operation_type := 'UPDATE';
        
        BEGIN
            record_id := NEW.sfid::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_id := NEW.id::TEXT;
        END;

        -- Execute transform function dynamically with schema qualification
        EXECUTE format('SELECT sf_tyu57865785dgdds.%I($1)', transform_func)
        USING NEW
        INTO payload;
        
        -- Enqueue with error handling
        BEGIN
            PERFORM sf_tyu57865785dgdds.enqueue_algolia_sync(
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
$_$;


ALTER FUNCTION sf_tyu57865785dgdds.trigger_algolia_sync() OWNER TO postgres;

--
-- Name: FUNCTION trigger_algolia_sync(); Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON FUNCTION sf_tyu57865785dgdds.trigger_algolia_sync() IS 'Generic trigger function that queues records for Algolia sync';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE FUNCTION sf_tyu57865785dgdds.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION sf_tyu57865785dgdds.update_updated_at_column() OWNER TO postgres;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    key_hash text NOT NULL,
    prefix text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    rate_limit integer DEFAULT 60 NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at text
);


ALTER TABLE public.api_keys OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    org_id text,
    salesforce_url text,
    salesforce_auth_url text,
    client_id text,
    client_secret text,
    site_url text,
    algolia_index_name text,
    algolia_schema text
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: permission_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permission_groups OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    group_id uuid,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: role_organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_organizations (
    role_id uuid NOT NULL,
    organization_id uuid NOT NULL
);


ALTER TABLE public.role_organizations OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: user_organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_organizations (
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL
);


ALTER TABLE public.user_organizations OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    organization_id uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_salesforce_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_salesforce_profiles (
    user_id uuid NOT NULL,
    contact_id text NOT NULL
);


ALTER TABLE public.user_salesforce_profiles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reset_password_code text,
    reset_password_expires text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: algolia_sync_queue; Type: TABLE; Schema: salesforce; Owner: postgres
--

CREATE TABLE salesforce.algolia_sync_queue (
    id bigint NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone,
    last_retry_at timestamp without time zone,
    CONSTRAINT algolia_sync_queue_operation_check CHECK (((operation)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[]))),
    CONSTRAINT algolia_sync_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE salesforce.algolia_sync_queue OWNER TO postgres;

--
-- Name: TABLE algolia_sync_queue; Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON TABLE salesforce.algolia_sync_queue IS 'Queue for tracking Algolia sync operations with retry logic';


--
-- Name: algolia_failed_syncs; Type: VIEW; Schema: salesforce; Owner: postgres
--

CREATE VIEW salesforce.algolia_failed_syncs AS
 SELECT id,
    table_name,
    record_id,
    operation,
    error_message,
    retry_count,
    created_at,
    last_retry_at,
    processed_at
   FROM salesforce.algolia_sync_queue q
  WHERE ((status)::text = 'failed'::text)
  ORDER BY processed_at DESC;


ALTER VIEW salesforce.algolia_failed_syncs OWNER TO postgres;

--
-- Name: algolia_index_config; Type: TABLE; Schema: salesforce; Owner: postgres
--

CREATE TABLE salesforce.algolia_index_config (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    index_name character varying(255) NOT NULL,
    is_enabled boolean DEFAULT true,
    batch_size integer DEFAULT 100,
    transform_function character varying(255),
    filter_condition text,
    max_retries integer DEFAULT 5,
    retry_delay_minutes integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE salesforce.algolia_index_config OWNER TO postgres;

--
-- Name: TABLE algolia_index_config; Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON TABLE salesforce.algolia_index_config IS 'Configuration for Algolia indexes per table';


--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE; Schema: salesforce; Owner: postgres
--

CREATE SEQUENCE salesforce.algolia_index_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE salesforce.algolia_index_config_id_seq OWNER TO postgres;

--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE OWNED BY; Schema: salesforce; Owner: postgres
--

ALTER SEQUENCE salesforce.algolia_index_config_id_seq OWNED BY salesforce.algolia_index_config.id;


--
-- Name: algolia_sync_log; Type: TABLE; Schema: salesforce; Owner: postgres
--

CREATE TABLE salesforce.algolia_sync_log (
    id bigint NOT NULL,
    queue_id bigint,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    algolia_object_id character varying(255),
    request_payload jsonb,
    response_payload jsonb,
    error_details text,
    sync_duration_ms integer,
    synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE salesforce.algolia_sync_log OWNER TO postgres;

--
-- Name: TABLE algolia_sync_log; Type: COMMENT; Schema: salesforce; Owner: postgres
--

COMMENT ON TABLE salesforce.algolia_sync_log IS 'Historical log of all Algolia sync operations for auditing';


--
-- Name: algolia_sync_health; Type: VIEW; Schema: salesforce; Owner: postgres
--

CREATE VIEW salesforce.algolia_sync_health AS
 SELECT count(*) FILTER (WHERE (((status)::text = 'pending'::text) AND (created_at < (now() - '00:05:00'::interval)))) AS stuck_pending_count,
    count(*) FILTER (WHERE ((status)::text = 'failed'::text)) AS total_failed_count,
    count(*) FILTER (WHERE (((status)::text = 'processing'::text) AND (processed_at < (now() - '00:10:00'::interval)))) AS stuck_processing_count,
    count(*) FILTER (WHERE ((status)::text = 'pending'::text)) AS total_pending_count,
    max(created_at) FILTER (WHERE ((status)::text = 'completed'::text)) AS last_success_time,
    max(processed_at) FILTER (WHERE ((status)::text = 'failed'::text)) AS last_failure_time,
    ( SELECT count(*) AS count
           FROM salesforce.algolia_sync_log
          WHERE (((algolia_sync_log.status)::text = 'completed'::text) AND (algolia_sync_log.synced_at > (now() - '01:00:00'::interval)))) AS syncs_last_hour
   FROM salesforce.algolia_sync_queue;


ALTER VIEW salesforce.algolia_sync_health OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE; Schema: salesforce; Owner: postgres
--

CREATE SEQUENCE salesforce.algolia_sync_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE salesforce.algolia_sync_log_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: salesforce; Owner: postgres
--

ALTER SEQUENCE salesforce.algolia_sync_log_id_seq OWNED BY salesforce.algolia_sync_log.id;


--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE; Schema: salesforce; Owner: postgres
--

CREATE SEQUENCE salesforce.algolia_sync_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE salesforce.algolia_sync_queue_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: salesforce; Owner: postgres
--

ALTER SEQUENCE salesforce.algolia_sync_queue_id_seq OWNED BY salesforce.algolia_sync_queue.id;


--
-- Name: algolia_sync_stats; Type: VIEW; Schema: salesforce; Owner: postgres
--

CREATE VIEW salesforce.algolia_sync_stats AS
 SELECT table_name,
    operation,
    status,
    count(*) AS count,
    max(created_at) AS last_created,
    max(processed_at) AS last_processed,
    avg(retry_count) AS avg_retries
   FROM salesforce.algolia_sync_queue
  GROUP BY table_name, operation, status
  ORDER BY table_name, operation, status;


ALTER VIEW salesforce.algolia_sync_stats OWNER TO postgres;

--
-- Name: algolia_sync_queue; Type: TABLE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE TABLE sf_00dcb00000deud4eah.algolia_sync_queue (
    id bigint NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone,
    last_retry_at timestamp without time zone,
    CONSTRAINT algolia_sync_queue_operation_check CHECK (((operation)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[]))),
    CONSTRAINT algolia_sync_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE sf_00dcb00000deud4eah.algolia_sync_queue OWNER TO postgres;

--
-- Name: TABLE algolia_sync_queue; Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON TABLE sf_00dcb00000deud4eah.algolia_sync_queue IS 'Queue for tracking Algolia sync operations with retry logic';


--
-- Name: algolia_failed_syncs; Type: VIEW; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE VIEW sf_00dcb00000deud4eah.algolia_failed_syncs AS
 SELECT id,
    table_name,
    record_id,
    operation,
    error_message,
    retry_count,
    created_at,
    last_retry_at,
    processed_at
   FROM sf_00dcb00000deud4eah.algolia_sync_queue q
  WHERE ((status)::text = 'failed'::text)
  ORDER BY processed_at DESC;


ALTER VIEW sf_00dcb00000deud4eah.algolia_failed_syncs OWNER TO postgres;

--
-- Name: algolia_index_config; Type: TABLE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE TABLE sf_00dcb00000deud4eah.algolia_index_config (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    index_name character varying(255) NOT NULL,
    is_enabled boolean DEFAULT true,
    batch_size integer DEFAULT 100,
    transform_function character varying(255),
    filter_condition text,
    max_retries integer DEFAULT 5,
    retry_delay_minutes integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_00dcb00000deud4eah.algolia_index_config OWNER TO postgres;

--
-- Name: TABLE algolia_index_config; Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON TABLE sf_00dcb00000deud4eah.algolia_index_config IS 'Configuration for Algolia indexes per table';


--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE SEQUENCE sf_00dcb00000deud4eah.algolia_index_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_index_config_id_seq OWNER TO postgres;

--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_index_config_id_seq OWNED BY sf_00dcb00000deud4eah.algolia_index_config.id;


--
-- Name: algolia_sync_log; Type: TABLE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE TABLE sf_00dcb00000deud4eah.algolia_sync_log (
    id bigint NOT NULL,
    queue_id bigint,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    algolia_object_id character varying(255),
    request_payload jsonb,
    response_payload jsonb,
    error_details text,
    sync_duration_ms integer,
    synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_00dcb00000deud4eah.algolia_sync_log OWNER TO postgres;

--
-- Name: TABLE algolia_sync_log; Type: COMMENT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

COMMENT ON TABLE sf_00dcb00000deud4eah.algolia_sync_log IS 'Historical log of all Algolia sync operations for auditing';


--
-- Name: algolia_sync_health; Type: VIEW; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE VIEW sf_00dcb00000deud4eah.algolia_sync_health AS
 SELECT count(*) FILTER (WHERE (((status)::text = 'pending'::text) AND (created_at < (now() - '00:05:00'::interval)))) AS stuck_pending_count,
    count(*) FILTER (WHERE ((status)::text = 'failed'::text)) AS total_failed_count,
    count(*) FILTER (WHERE (((status)::text = 'processing'::text) AND (processed_at < (now() - '00:10:00'::interval)))) AS stuck_processing_count,
    count(*) FILTER (WHERE ((status)::text = 'pending'::text)) AS total_pending_count,
    max(created_at) FILTER (WHERE ((status)::text = 'completed'::text)) AS last_success_time,
    max(processed_at) FILTER (WHERE ((status)::text = 'failed'::text)) AS last_failure_time,
    ( SELECT count(*) AS count
           FROM sf_00dcb00000deud4eah.algolia_sync_log
          WHERE (((algolia_sync_log.status)::text = 'completed'::text) AND (algolia_sync_log.synced_at > (now() - '01:00:00'::interval)))) AS syncs_last_hour
   FROM sf_00dcb00000deud4eah.algolia_sync_queue;


ALTER VIEW sf_00dcb00000deud4eah.algolia_sync_health OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE SEQUENCE sf_00dcb00000deud4eah.algolia_sync_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_sync_log_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_sync_log_id_seq OWNED BY sf_00dcb00000deud4eah.algolia_sync_log.id;


--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE SEQUENCE sf_00dcb00000deud4eah.algolia_sync_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_sync_queue_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER SEQUENCE sf_00dcb00000deud4eah.algolia_sync_queue_id_seq OWNED BY sf_00dcb00000deud4eah.algolia_sync_queue.id;


--
-- Name: algolia_sync_stats; Type: VIEW; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE VIEW sf_00dcb00000deud4eah.algolia_sync_stats AS
 SELECT table_name,
    operation,
    status,
    count(*) AS count,
    max(created_at) AS last_created,
    max(processed_at) AS last_processed,
    avg(retry_count) AS avg_retries
   FROM sf_00dcb00000deud4eah.algolia_sync_queue
  GROUP BY table_name, operation, status
  ORDER BY table_name, operation, status;


ALTER VIEW sf_00dcb00000deud4eah.algolia_sync_stats OWNER TO postgres;

--
-- Name: algolia_sync_queue; Type: TABLE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE TABLE sf_546546ffdfdsfd.algolia_sync_queue (
    id bigint NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone,
    last_retry_at timestamp without time zone,
    CONSTRAINT algolia_sync_queue_operation_check CHECK (((operation)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[]))),
    CONSTRAINT algolia_sync_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE sf_546546ffdfdsfd.algolia_sync_queue OWNER TO postgres;

--
-- Name: TABLE algolia_sync_queue; Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON TABLE sf_546546ffdfdsfd.algolia_sync_queue IS 'Queue for tracking Algolia sync operations with retry logic';


--
-- Name: algolia_failed_syncs; Type: VIEW; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE VIEW sf_546546ffdfdsfd.algolia_failed_syncs AS
 SELECT id,
    table_name,
    record_id,
    operation,
    error_message,
    retry_count,
    created_at,
    last_retry_at,
    processed_at
   FROM sf_546546ffdfdsfd.algolia_sync_queue q
  WHERE ((status)::text = 'failed'::text)
  ORDER BY processed_at DESC;


ALTER VIEW sf_546546ffdfdsfd.algolia_failed_syncs OWNER TO postgres;

--
-- Name: algolia_index_config; Type: TABLE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE TABLE sf_546546ffdfdsfd.algolia_index_config (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    index_name character varying(255) NOT NULL,
    is_enabled boolean DEFAULT true,
    batch_size integer DEFAULT 100,
    transform_function character varying(255),
    filter_condition text,
    max_retries integer DEFAULT 5,
    retry_delay_minutes integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_546546ffdfdsfd.algolia_index_config OWNER TO postgres;

--
-- Name: TABLE algolia_index_config; Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON TABLE sf_546546ffdfdsfd.algolia_index_config IS 'Configuration for Algolia indexes per table';


--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE SEQUENCE sf_546546ffdfdsfd.algolia_index_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_546546ffdfdsfd.algolia_index_config_id_seq OWNER TO postgres;

--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER SEQUENCE sf_546546ffdfdsfd.algolia_index_config_id_seq OWNED BY sf_546546ffdfdsfd.algolia_index_config.id;


--
-- Name: algolia_sync_log; Type: TABLE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE TABLE sf_546546ffdfdsfd.algolia_sync_log (
    id bigint NOT NULL,
    queue_id bigint,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    algolia_object_id character varying(255),
    request_payload jsonb,
    response_payload jsonb,
    error_details text,
    sync_duration_ms integer,
    synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_546546ffdfdsfd.algolia_sync_log OWNER TO postgres;

--
-- Name: TABLE algolia_sync_log; Type: COMMENT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

COMMENT ON TABLE sf_546546ffdfdsfd.algolia_sync_log IS 'Historical log of all Algolia sync operations for auditing';


--
-- Name: algolia_sync_health; Type: VIEW; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE VIEW sf_546546ffdfdsfd.algolia_sync_health AS
 SELECT count(*) FILTER (WHERE (((status)::text = 'pending'::text) AND (created_at < (now() - '00:05:00'::interval)))) AS stuck_pending_count,
    count(*) FILTER (WHERE ((status)::text = 'failed'::text)) AS total_failed_count,
    count(*) FILTER (WHERE (((status)::text = 'processing'::text) AND (processed_at < (now() - '00:10:00'::interval)))) AS stuck_processing_count,
    count(*) FILTER (WHERE ((status)::text = 'pending'::text)) AS total_pending_count,
    max(created_at) FILTER (WHERE ((status)::text = 'completed'::text)) AS last_success_time,
    max(processed_at) FILTER (WHERE ((status)::text = 'failed'::text)) AS last_failure_time,
    ( SELECT count(*) AS count
           FROM sf_546546ffdfdsfd.algolia_sync_log
          WHERE (((algolia_sync_log.status)::text = 'completed'::text) AND (algolia_sync_log.synced_at > (now() - '01:00:00'::interval)))) AS syncs_last_hour
   FROM sf_546546ffdfdsfd.algolia_sync_queue;


ALTER VIEW sf_546546ffdfdsfd.algolia_sync_health OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE SEQUENCE sf_546546ffdfdsfd.algolia_sync_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_546546ffdfdsfd.algolia_sync_log_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER SEQUENCE sf_546546ffdfdsfd.algolia_sync_log_id_seq OWNED BY sf_546546ffdfdsfd.algolia_sync_log.id;


--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE SEQUENCE sf_546546ffdfdsfd.algolia_sync_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_546546ffdfdsfd.algolia_sync_queue_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER SEQUENCE sf_546546ffdfdsfd.algolia_sync_queue_id_seq OWNED BY sf_546546ffdfdsfd.algolia_sync_queue.id;


--
-- Name: algolia_sync_stats; Type: VIEW; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE VIEW sf_546546ffdfdsfd.algolia_sync_stats AS
 SELECT table_name,
    operation,
    status,
    count(*) AS count,
    max(created_at) AS last_created,
    max(processed_at) AS last_processed,
    avg(retry_count) AS avg_retries
   FROM sf_546546ffdfdsfd.algolia_sync_queue
  GROUP BY table_name, operation, status
  ORDER BY table_name, operation, status;


ALTER VIEW sf_546546ffdfdsfd.algolia_sync_stats OWNER TO postgres;

--
-- Name: algolia_sync_queue; Type: TABLE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE TABLE sf_tyu57865785dgdds.algolia_sync_queue (
    id bigint NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone,
    last_retry_at timestamp without time zone,
    CONSTRAINT algolia_sync_queue_operation_check CHECK (((operation)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[]))),
    CONSTRAINT algolia_sync_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE sf_tyu57865785dgdds.algolia_sync_queue OWNER TO postgres;

--
-- Name: TABLE algolia_sync_queue; Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON TABLE sf_tyu57865785dgdds.algolia_sync_queue IS 'Queue for tracking Algolia sync operations with retry logic';


--
-- Name: algolia_failed_syncs; Type: VIEW; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE VIEW sf_tyu57865785dgdds.algolia_failed_syncs AS
 SELECT id,
    table_name,
    record_id,
    operation,
    error_message,
    retry_count,
    created_at,
    last_retry_at,
    processed_at
   FROM sf_tyu57865785dgdds.algolia_sync_queue q
  WHERE ((status)::text = 'failed'::text)
  ORDER BY processed_at DESC;


ALTER VIEW sf_tyu57865785dgdds.algolia_failed_syncs OWNER TO postgres;

--
-- Name: algolia_index_config; Type: TABLE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE TABLE sf_tyu57865785dgdds.algolia_index_config (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    index_name character varying(255) NOT NULL,
    is_enabled boolean DEFAULT true,
    batch_size integer DEFAULT 100,
    transform_function character varying(255),
    filter_condition text,
    max_retries integer DEFAULT 5,
    retry_delay_minutes integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_tyu57865785dgdds.algolia_index_config OWNER TO postgres;

--
-- Name: TABLE algolia_index_config; Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON TABLE sf_tyu57865785dgdds.algolia_index_config IS 'Configuration for Algolia indexes per table';


--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE SEQUENCE sf_tyu57865785dgdds.algolia_index_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_tyu57865785dgdds.algolia_index_config_id_seq OWNER TO postgres;

--
-- Name: algolia_index_config_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER SEQUENCE sf_tyu57865785dgdds.algolia_index_config_id_seq OWNED BY sf_tyu57865785dgdds.algolia_index_config.id;


--
-- Name: algolia_sync_log; Type: TABLE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE TABLE sf_tyu57865785dgdds.algolia_sync_log (
    id bigint NOT NULL,
    queue_id bigint,
    table_name character varying(100) NOT NULL,
    record_id character varying(255) NOT NULL,
    operation character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    algolia_object_id character varying(255),
    request_payload jsonb,
    response_payload jsonb,
    error_details text,
    sync_duration_ms integer,
    synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE sf_tyu57865785dgdds.algolia_sync_log OWNER TO postgres;

--
-- Name: TABLE algolia_sync_log; Type: COMMENT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

COMMENT ON TABLE sf_tyu57865785dgdds.algolia_sync_log IS 'Historical log of all Algolia sync operations for auditing';


--
-- Name: algolia_sync_health; Type: VIEW; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE VIEW sf_tyu57865785dgdds.algolia_sync_health AS
 SELECT count(*) FILTER (WHERE (((status)::text = 'pending'::text) AND (created_at < (now() - '00:05:00'::interval)))) AS stuck_pending_count,
    count(*) FILTER (WHERE ((status)::text = 'failed'::text)) AS total_failed_count,
    count(*) FILTER (WHERE (((status)::text = 'processing'::text) AND (processed_at < (now() - '00:10:00'::interval)))) AS stuck_processing_count,
    count(*) FILTER (WHERE ((status)::text = 'pending'::text)) AS total_pending_count,
    max(created_at) FILTER (WHERE ((status)::text = 'completed'::text)) AS last_success_time,
    max(processed_at) FILTER (WHERE ((status)::text = 'failed'::text)) AS last_failure_time,
    ( SELECT count(*) AS count
           FROM sf_tyu57865785dgdds.algolia_sync_log
          WHERE (((algolia_sync_log.status)::text = 'completed'::text) AND (algolia_sync_log.synced_at > (now() - '01:00:00'::interval)))) AS syncs_last_hour
   FROM sf_tyu57865785dgdds.algolia_sync_queue;


ALTER VIEW sf_tyu57865785dgdds.algolia_sync_health OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE SEQUENCE sf_tyu57865785dgdds.algolia_sync_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_tyu57865785dgdds.algolia_sync_log_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER SEQUENCE sf_tyu57865785dgdds.algolia_sync_log_id_seq OWNED BY sf_tyu57865785dgdds.algolia_sync_log.id;


--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE SEQUENCE sf_tyu57865785dgdds.algolia_sync_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sf_tyu57865785dgdds.algolia_sync_queue_id_seq OWNER TO postgres;

--
-- Name: algolia_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER SEQUENCE sf_tyu57865785dgdds.algolia_sync_queue_id_seq OWNED BY sf_tyu57865785dgdds.algolia_sync_queue.id;


--
-- Name: algolia_sync_stats; Type: VIEW; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE VIEW sf_tyu57865785dgdds.algolia_sync_stats AS
 SELECT table_name,
    operation,
    status,
    count(*) AS count,
    max(created_at) AS last_created,
    max(processed_at) AS last_processed,
    avg(retry_count) AS avg_retries
   FROM sf_tyu57865785dgdds.algolia_sync_queue
  GROUP BY table_name, operation, status
  ORDER BY table_name, operation, status;


ALTER VIEW sf_tyu57865785dgdds.algolia_sync_stats OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: algolia_index_config id; Type: DEFAULT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_index_config ALTER COLUMN id SET DEFAULT nextval('salesforce.algolia_index_config_id_seq'::regclass);


--
-- Name: algolia_sync_log id; Type: DEFAULT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_sync_log ALTER COLUMN id SET DEFAULT nextval('salesforce.algolia_sync_log_id_seq'::regclass);


--
-- Name: algolia_sync_queue id; Type: DEFAULT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_sync_queue ALTER COLUMN id SET DEFAULT nextval('salesforce.algolia_sync_queue_id_seq'::regclass);


--
-- Name: algolia_index_config id; Type: DEFAULT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_index_config ALTER COLUMN id SET DEFAULT nextval('sf_00dcb00000deud4eah.algolia_index_config_id_seq'::regclass);


--
-- Name: algolia_sync_log id; Type: DEFAULT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_sync_log ALTER COLUMN id SET DEFAULT nextval('sf_00dcb00000deud4eah.algolia_sync_log_id_seq'::regclass);


--
-- Name: algolia_sync_queue id; Type: DEFAULT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_sync_queue ALTER COLUMN id SET DEFAULT nextval('sf_00dcb00000deud4eah.algolia_sync_queue_id_seq'::regclass);


--
-- Name: algolia_index_config id; Type: DEFAULT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_index_config ALTER COLUMN id SET DEFAULT nextval('sf_546546ffdfdsfd.algolia_index_config_id_seq'::regclass);


--
-- Name: algolia_sync_log id; Type: DEFAULT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_sync_log ALTER COLUMN id SET DEFAULT nextval('sf_546546ffdfdsfd.algolia_sync_log_id_seq'::regclass);


--
-- Name: algolia_sync_queue id; Type: DEFAULT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_sync_queue ALTER COLUMN id SET DEFAULT nextval('sf_546546ffdfdsfd.algolia_sync_queue_id_seq'::regclass);


--
-- Name: algolia_index_config id; Type: DEFAULT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_index_config ALTER COLUMN id SET DEFAULT nextval('sf_tyu57865785dgdds.algolia_index_config_id_seq'::regclass);


--
-- Name: algolia_sync_log id; Type: DEFAULT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_sync_log ALTER COLUMN id SET DEFAULT nextval('sf_tyu57865785dgdds.algolia_sync_log_id_seq'::regclass);


--
-- Name: algolia_sync_queue id; Type: DEFAULT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_sync_queue ALTER COLUMN id SET DEFAULT nextval('sf_tyu57865785dgdds.algolia_sync_queue_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_key_hash_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_unique UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_org_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_org_id_unique UNIQUE (org_id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: permission_groups permission_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_groups
    ADD CONSTRAINT permission_groups_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_organizations role_organizations_role_id_organization_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_organizations
    ADD CONSTRAINT role_organizations_role_id_organization_id_pk PRIMARY KEY (role_id, organization_id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_pk PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_organizations user_organizations_user_id_organization_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_user_id_organization_id_pk PRIMARY KEY (user_id, organization_id);


--
-- Name: user_roles user_roles_user_id_role_id_organization_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_organization_id_pk PRIMARY KEY (user_id, role_id, organization_id);


--
-- Name: user_salesforce_profiles user_salesforce_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_salesforce_profiles
    ADD CONSTRAINT user_salesforce_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: algolia_index_config algolia_index_config_pkey; Type: CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_index_config
    ADD CONSTRAINT algolia_index_config_pkey PRIMARY KEY (id);


--
-- Name: algolia_index_config algolia_index_config_table_name_key; Type: CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_index_config
    ADD CONSTRAINT algolia_index_config_table_name_key UNIQUE (table_name);


--
-- Name: algolia_sync_log algolia_sync_log_pkey; Type: CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_pkey PRIMARY KEY (id);


--
-- Name: algolia_sync_queue algolia_sync_queue_pkey; Type: CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_sync_queue
    ADD CONSTRAINT algolia_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: product2 product2_pkey; Type: CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.product2
    ADD CONSTRAINT product2_pkey PRIMARY KEY (sfid);


--
-- Name: algolia_index_config algolia_index_config_pkey; Type: CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_index_config
    ADD CONSTRAINT algolia_index_config_pkey PRIMARY KEY (id);


--
-- Name: algolia_index_config algolia_index_config_table_name_key; Type: CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_index_config
    ADD CONSTRAINT algolia_index_config_table_name_key UNIQUE (table_name);


--
-- Name: algolia_sync_log algolia_sync_log_pkey; Type: CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_pkey PRIMARY KEY (id);


--
-- Name: algolia_sync_queue algolia_sync_queue_pkey; Type: CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_sync_queue
    ADD CONSTRAINT algolia_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: product2 product2_pkey; Type: CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.product2
    ADD CONSTRAINT product2_pkey PRIMARY KEY (sfid);


--
-- Name: algolia_index_config algolia_index_config_pkey; Type: CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_index_config
    ADD CONSTRAINT algolia_index_config_pkey PRIMARY KEY (id);


--
-- Name: algolia_index_config algolia_index_config_table_name_key; Type: CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_index_config
    ADD CONSTRAINT algolia_index_config_table_name_key UNIQUE (table_name);


--
-- Name: algolia_sync_log algolia_sync_log_pkey; Type: CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_pkey PRIMARY KEY (id);


--
-- Name: algolia_sync_queue algolia_sync_queue_pkey; Type: CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_sync_queue
    ADD CONSTRAINT algolia_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: product2 product2_pkey; Type: CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.product2
    ADD CONSTRAINT product2_pkey PRIMARY KEY (sfid);


--
-- Name: algolia_index_config algolia_index_config_pkey; Type: CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_index_config
    ADD CONSTRAINT algolia_index_config_pkey PRIMARY KEY (id);


--
-- Name: algolia_index_config algolia_index_config_table_name_key; Type: CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_index_config
    ADD CONSTRAINT algolia_index_config_table_name_key UNIQUE (table_name);


--
-- Name: algolia_sync_log algolia_sync_log_pkey; Type: CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_pkey PRIMARY KEY (id);


--
-- Name: algolia_sync_queue algolia_sync_queue_pkey; Type: CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_sync_queue
    ADD CONSTRAINT algolia_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: product2 product2_pkey; Type: CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.product2
    ADD CONSTRAINT product2_pkey PRIMARY KEY (sfid);


--
-- Name: idx_algolia_queue_cleanup; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_algolia_queue_cleanup ON salesforce.algolia_sync_queue USING btree (status, processed_at) WHERE ((status)::text = 'completed'::text);


--
-- Name: idx_algolia_queue_retry; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_algolia_queue_retry ON salesforce.algolia_sync_queue USING btree (status, last_retry_at) WHERE (((status)::text = 'pending'::text) AND (retry_count > 0));


--
-- Name: idx_algolia_queue_status; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_algolia_queue_status ON salesforce.algolia_sync_queue USING btree (status, created_at);


--
-- Name: idx_algolia_queue_table_record; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_algolia_queue_table_record ON salesforce.algolia_sync_queue USING btree (table_name, record_id);


--
-- Name: idx_sync_log_queue; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_sync_log_queue ON salesforce.algolia_sync_log USING btree (queue_id);


--
-- Name: idx_sync_log_record; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_sync_log_record ON salesforce.algolia_sync_log USING btree (table_name, record_id);


--
-- Name: idx_sync_log_status; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE INDEX idx_sync_log_status ON salesforce.algolia_sync_log USING btree (status, synced_at);


--
-- Name: unique_pending_operation_idx; Type: INDEX; Schema: salesforce; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_operation_idx ON salesforce.algolia_sync_queue USING btree (table_name, record_id, operation) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_algolia_queue_cleanup; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_algolia_queue_cleanup ON sf_00dcb00000deud4eah.algolia_sync_queue USING btree (status, processed_at) WHERE ((status)::text = 'completed'::text);


--
-- Name: idx_algolia_queue_retry; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_algolia_queue_retry ON sf_00dcb00000deud4eah.algolia_sync_queue USING btree (status, last_retry_at) WHERE (((status)::text = 'pending'::text) AND (retry_count > 0));


--
-- Name: idx_algolia_queue_status; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_algolia_queue_status ON sf_00dcb00000deud4eah.algolia_sync_queue USING btree (status, created_at);


--
-- Name: idx_algolia_queue_table_record; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_algolia_queue_table_record ON sf_00dcb00000deud4eah.algolia_sync_queue USING btree (table_name, record_id);


--
-- Name: idx_sync_log_queue; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_sync_log_queue ON sf_00dcb00000deud4eah.algolia_sync_log USING btree (queue_id);


--
-- Name: idx_sync_log_record; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_sync_log_record ON sf_00dcb00000deud4eah.algolia_sync_log USING btree (table_name, record_id);


--
-- Name: idx_sync_log_status; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE INDEX idx_sync_log_status ON sf_00dcb00000deud4eah.algolia_sync_log USING btree (status, synced_at);


--
-- Name: unique_pending_operation_idx; Type: INDEX; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_operation_idx ON sf_00dcb00000deud4eah.algolia_sync_queue USING btree (table_name, record_id, operation) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_algolia_queue_cleanup; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_algolia_queue_cleanup ON sf_546546ffdfdsfd.algolia_sync_queue USING btree (status, processed_at) WHERE ((status)::text = 'completed'::text);


--
-- Name: idx_algolia_queue_retry; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_algolia_queue_retry ON sf_546546ffdfdsfd.algolia_sync_queue USING btree (status, last_retry_at) WHERE (((status)::text = 'pending'::text) AND (retry_count > 0));


--
-- Name: idx_algolia_queue_status; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_algolia_queue_status ON sf_546546ffdfdsfd.algolia_sync_queue USING btree (status, created_at);


--
-- Name: idx_algolia_queue_table_record; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_algolia_queue_table_record ON sf_546546ffdfdsfd.algolia_sync_queue USING btree (table_name, record_id);


--
-- Name: idx_sync_log_queue; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_sync_log_queue ON sf_546546ffdfdsfd.algolia_sync_log USING btree (queue_id);


--
-- Name: idx_sync_log_record; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_sync_log_record ON sf_546546ffdfdsfd.algolia_sync_log USING btree (table_name, record_id);


--
-- Name: idx_sync_log_status; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE INDEX idx_sync_log_status ON sf_546546ffdfdsfd.algolia_sync_log USING btree (status, synced_at);


--
-- Name: unique_pending_operation_idx; Type: INDEX; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_operation_idx ON sf_546546ffdfdsfd.algolia_sync_queue USING btree (table_name, record_id, operation) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_algolia_queue_cleanup; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_algolia_queue_cleanup ON sf_tyu57865785dgdds.algolia_sync_queue USING btree (status, processed_at) WHERE ((status)::text = 'completed'::text);


--
-- Name: idx_algolia_queue_retry; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_algolia_queue_retry ON sf_tyu57865785dgdds.algolia_sync_queue USING btree (status, last_retry_at) WHERE (((status)::text = 'pending'::text) AND (retry_count > 0));


--
-- Name: idx_algolia_queue_status; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_algolia_queue_status ON sf_tyu57865785dgdds.algolia_sync_queue USING btree (status, created_at);


--
-- Name: idx_algolia_queue_table_record; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_algolia_queue_table_record ON sf_tyu57865785dgdds.algolia_sync_queue USING btree (table_name, record_id);


--
-- Name: idx_sync_log_queue; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_sync_log_queue ON sf_tyu57865785dgdds.algolia_sync_log USING btree (queue_id);


--
-- Name: idx_sync_log_record; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_sync_log_record ON sf_tyu57865785dgdds.algolia_sync_log USING btree (table_name, record_id);


--
-- Name: idx_sync_log_status; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE INDEX idx_sync_log_status ON sf_tyu57865785dgdds.algolia_sync_log USING btree (status, synced_at);


--
-- Name: unique_pending_operation_idx; Type: INDEX; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_operation_idx ON sf_tyu57865785dgdds.algolia_sync_queue USING btree (table_name, record_id, operation) WHERE ((status)::text = 'pending'::text);


--
-- Name: product2 sf_product2_algolia_sync_trigger; Type: TRIGGER; Schema: salesforce; Owner: postgres
--

CREATE TRIGGER sf_product2_algolia_sync_trigger AFTER INSERT OR DELETE OR UPDATE ON salesforce.product2 FOR EACH ROW EXECUTE FUNCTION salesforce.trigger_algolia_sync();


--
-- Name: algolia_index_config update_algolia_config_timestamp; Type: TRIGGER; Schema: salesforce; Owner: postgres
--

CREATE TRIGGER update_algolia_config_timestamp BEFORE UPDATE ON salesforce.algolia_index_config FOR EACH ROW EXECUTE FUNCTION salesforce.update_updated_at_column();


--
-- Name: algolia_index_config update_algolia_config_timestamp; Type: TRIGGER; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

CREATE TRIGGER update_algolia_config_timestamp BEFORE UPDATE ON sf_00dcb00000deud4eah.algolia_index_config FOR EACH ROW EXECUTE FUNCTION sf_00dcb00000deud4eah.update_updated_at_column();


--
-- Name: algolia_index_config update_algolia_config_timestamp; Type: TRIGGER; Schema: sf_546546ffdfdsfd; Owner: postgres
--

CREATE TRIGGER update_algolia_config_timestamp BEFORE UPDATE ON sf_546546ffdfdsfd.algolia_index_config FOR EACH ROW EXECUTE FUNCTION sf_546546ffdfdsfd.update_updated_at_column();


--
-- Name: algolia_index_config update_algolia_config_timestamp; Type: TRIGGER; Schema: sf_tyu57865785dgdds; Owner: postgres
--

CREATE TRIGGER update_algolia_config_timestamp BEFORE UPDATE ON sf_tyu57865785dgdds.algolia_index_config FOR EACH ROW EXECUTE FUNCTION sf_tyu57865785dgdds.update_updated_at_column();


--
-- Name: permissions permissions_group_id_permission_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_group_id_permission_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.permission_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_organizations role_organizations_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_organizations
    ADD CONSTRAINT role_organizations_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_organizations role_organizations_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_organizations
    ADD CONSTRAINT role_organizations_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_organizations user_organizations_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_organizations user_organizations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_salesforce_profiles user_salesforce_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_salesforce_profiles
    ADD CONSTRAINT user_salesforce_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: algolia_sync_log algolia_sync_log_queue_id_fkey; Type: FK CONSTRAINT; Schema: salesforce; Owner: postgres
--

ALTER TABLE ONLY salesforce.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_queue_id_fkey FOREIGN KEY (queue_id) REFERENCES salesforce.algolia_sync_queue(id) ON DELETE CASCADE;


--
-- Name: algolia_sync_log algolia_sync_log_queue_id_fkey; Type: FK CONSTRAINT; Schema: sf_00dcb00000deud4eah; Owner: postgres
--

ALTER TABLE ONLY sf_00dcb00000deud4eah.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_queue_id_fkey FOREIGN KEY (queue_id) REFERENCES sf_00dcb00000deud4eah.algolia_sync_queue(id) ON DELETE CASCADE;


--
-- Name: algolia_sync_log algolia_sync_log_queue_id_fkey; Type: FK CONSTRAINT; Schema: sf_546546ffdfdsfd; Owner: postgres
--

ALTER TABLE ONLY sf_546546ffdfdsfd.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_queue_id_fkey FOREIGN KEY (queue_id) REFERENCES sf_546546ffdfdsfd.algolia_sync_queue(id) ON DELETE CASCADE;


--
-- Name: algolia_sync_log algolia_sync_log_queue_id_fkey; Type: FK CONSTRAINT; Schema: sf_tyu57865785dgdds; Owner: postgres
--

ALTER TABLE ONLY sf_tyu57865785dgdds.algolia_sync_log
    ADD CONSTRAINT algolia_sync_log_queue_id_fkey FOREIGN KEY (queue_id) REFERENCES sf_tyu57865785dgdds.algolia_sync_queue(id) ON DELETE CASCADE;


--
-- Name: FUNCTION cleanup_old_sync_records(days_to_keep integer); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.cleanup_old_sync_records(days_to_keep integer) FROM postgres;
GRANT ALL ON FUNCTION salesforce.cleanup_old_sync_records(days_to_keep integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) FROM postgres;
GRANT ALL ON FUNCTION salesforce.enqueue_algolia_sync(p_table_name character varying, p_record_id character varying, p_operation character varying, p_payload jsonb) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_pending_algolia_syncs(batch_limit integer); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.get_pending_algolia_syncs(batch_limit integer) FROM postgres;
GRANT ALL ON FUNCTION salesforce.get_pending_algolia_syncs(batch_limit integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) FROM postgres;
GRANT ALL ON FUNCTION salesforce.get_pending_syncs_by_table(p_table_name character varying, p_batch_limit integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) FROM postgres;
GRANT ALL ON FUNCTION salesforce.mark_sync_completed(p_queue_id bigint, p_algolia_object_id character varying, p_sync_duration_ms integer, p_response_payload jsonb) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) FROM postgres;
GRANT ALL ON FUNCTION salesforce.mark_sync_failed(p_queue_id bigint, p_error_message text, p_error_details jsonb) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION mark_sync_processing(p_queue_ids bigint[]); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.mark_sync_processing(p_queue_ids bigint[]) FROM postgres;
GRANT ALL ON FUNCTION salesforce.mark_sync_processing(p_queue_ids bigint[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION reset_stuck_processing(timeout_minutes integer); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.reset_stuck_processing(timeout_minutes integer) FROM postgres;
GRANT ALL ON FUNCTION salesforce.reset_stuck_processing(timeout_minutes integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION run_algolia_maintenance(); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.run_algolia_maintenance() FROM postgres;
GRANT ALL ON FUNCTION salesforce.run_algolia_maintenance() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION transform_sf_product_for_algolia(product_row salesforce.product2); Type: ACL; Schema: salesforce; Owner: postgres
--

REVOKE ALL ON FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2) FROM postgres;
GRANT ALL ON FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2) TO postgres WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 39h8HlzMF9fQOh8wuJCHQ6UiFhH2MrccxpuqfR5Kxh4CV4weDNC4Zqsz0kTeG08

