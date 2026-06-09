import { pool } from '../db';

/**
 * Provisions a new database schema for a specific organization/tenant.
 * Replicates all tables, functions, views, and triggers from the salesforce schema.
 */
export async function provisionTenantSchema(schemaName: string, algoliaIndexName?: string) {
  const s = schemaName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const indexName = algoliaIndexName || `${s}_products`;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Create Schema ──────────────────────────────────────────────────────
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${s}"`);

    // ── 2. product2 table ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${s}".product2 (
        sfid                          VARCHAR(18) PRIMARY KEY,
        productcode                   VARCHAR(255),
        name                          VARCHAR(255),
        description                   TEXT,
        isactive                      BOOLEAN,
        family                        VARCHAR(255),
        image_url                     JSONB,
        gtherp__price__c              NUMERIC,
        list_price__c                 NUMERIC,
        gtherp__stock_quantity__c     NUMERIC,
        gtherp__available_quantity__c NUMERIC,
        gtherp__discount__c           NUMERIC,
        gtherp__category__c           VARCHAR(255),
        gtherp__sub_category__c       VARCHAR(255),
        manufacturer_name__c          VARCHAR(255),
        product_availability__c       VARCHAR(255),
        createddate                   TIMESTAMP,
        systemmodstamp                TIMESTAMP
      )
    `);

    // ── 3. algolia_sync_queue table ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${s}".algolia_sync_queue (
        id             BIGSERIAL PRIMARY KEY,
        table_name     VARCHAR(100) NOT NULL,
        record_id      VARCHAR(255) NOT NULL,
        operation      VARCHAR(10)  NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
        payload        JSONB,
        status         VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
        retry_count    INTEGER      DEFAULT 0,
        error_message  TEXT,
        created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        processed_at   TIMESTAMP,
        last_retry_at  TIMESTAMP
      )
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${s}_unique_pending_op_idx" ON "${s}".algolia_sync_queue (table_name, record_id, operation) WHERE status = 'pending'`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_queue_status"       ON "${s}".algolia_sync_queue(status, created_at)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_queue_table_record" ON "${s}".algolia_sync_queue(table_name, record_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_queue_cleanup"      ON "${s}".algolia_sync_queue(status, processed_at) WHERE status = 'completed'`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_queue_retry"        ON "${s}".algolia_sync_queue(status, last_retry_at) WHERE status = 'pending' AND retry_count > 0`);

    // ── 4. algolia_sync_log table ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${s}".algolia_sync_log (
        id               BIGSERIAL PRIMARY KEY,
        queue_id         BIGINT REFERENCES "${s}".algolia_sync_queue(id) ON DELETE CASCADE,
        table_name       VARCHAR(100) NOT NULL,
        record_id        VARCHAR(255) NOT NULL,
        operation        VARCHAR(10)  NOT NULL,
        status           VARCHAR(20)  NOT NULL,
        algolia_object_id VARCHAR(255),
        request_payload  JSONB,
        response_payload JSONB,
        error_details    TEXT,
        sync_duration_ms INTEGER,
        synced_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_sync_log_status" ON "${s}".algolia_sync_log(status, synced_at)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_sync_log_record" ON "${s}".algolia_sync_log(table_name, record_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "${s}_idx_sync_log_queue"  ON "${s}".algolia_sync_log(queue_id)`);

    // ── 5. algolia_index_config table ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${s}".algolia_index_config (
        id                  SERIAL PRIMARY KEY,
        table_name          VARCHAR(100) UNIQUE NOT NULL,
        index_name          VARCHAR(255) NOT NULL,
        is_enabled          BOOLEAN  DEFAULT TRUE,
        batch_size          INTEGER  DEFAULT 100,
        transform_function  VARCHAR(255),
        filter_condition    TEXT,
        max_retries         INTEGER  DEFAULT 5,
        retry_delay_minutes INTEGER  DEFAULT 5,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      INSERT INTO "${s}".algolia_index_config (table_name, index_name, transform_function, filter_condition, batch_size)
      VALUES ($1, $2, 'transform_sf_product_for_algolia', NULL, 100)
      ON CONFLICT (table_name) DO UPDATE SET
        index_name         = EXCLUDED.index_name,
        transform_function = EXCLUDED.transform_function,
        batch_size         = EXCLUDED.batch_size
    `, [`${s}.product2`, indexName]);

    // ── 6. transform_sf_product_for_algolia function ──────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".transform_sf_product_for_algolia(product_row "${s}".product2)
      RETURNS JSONB AS $$
      BEGIN
        RETURN jsonb_strip_nulls(jsonb_build_object(
          'objectID',            product_row.sfid,
          'sku',                 product_row.productcode,
          'name',                product_row.name,
          'description',         product_row.description,
          'price',               COALESCE(product_row.gtherp__price__c, 0),
          'stock_quantity',      COALESCE(product_row.gtherp__stock_quantity__c, 0),
          'available_quantity',  COALESCE(product_row.gtherp__available_quantity__c, 0),
          'discount',            COALESCE(product_row.gtherp__discount__c, 0),
          'image_url', CASE
            WHEN product_row.image_url IS NOT NULL
              AND product_row.image_url->'images' IS NOT NULL
              AND jsonb_array_length(product_row.image_url->'images') > 0
            THEN product_row.image_url#>>'{images,0,url}'
            ELSE NULL
          END,
          'images', CASE
            WHEN product_row.image_url IS NOT NULL AND product_row.image_url->'images' IS NOT NULL
            THEN product_row.image_url->'images'
            ELSE '[]'::jsonb
          END,
          'category',              product_row.gtherp__category__c,
          'family',                product_row.family,
          'sub_category',          product_row.gtherp__sub_category__c,
          'manufacturer',          product_row.manufacturer_name__c,
          'status',                CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
          'is_active',             product_row.isactive,
          'product_availability',  product_row.product_availability__c,
          'Availability_Status__c', product_row.product_availability__c,
          'created_at',            EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
          'updated_at',            EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
          '_tags', ARRAY_REMOVE(ARRAY[
            product_row.family,
            product_row.gtherp__category__c,
            product_row.gtherp__sub_category__c,
            product_row.manufacturer_name__c,
            product_row.product_availability__c
          ], NULL)
        ));
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `);

    // ── 7. enqueue_algolia_sync function ──────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".enqueue_algolia_sync(
        p_table_name VARCHAR, p_record_id VARCHAR, p_operation VARCHAR, p_payload JSONB DEFAULT NULL
      ) RETURNS BIGINT AS $$
      DECLARE queue_id BIGINT; config_enabled BOOLEAN;
      BEGIN
        SELECT is_enabled INTO config_enabled FROM "${s}".algolia_index_config WHERE table_name = p_table_name;
        IF config_enabled IS FALSE THEN RETURN NULL; END IF;
        INSERT INTO "${s}".algolia_sync_queue (table_name, record_id, operation, payload, status)
        VALUES (p_table_name, p_record_id, p_operation, p_payload, 'pending')
        ON CONFLICT (table_name, record_id, operation) WHERE status = 'pending'
        DO UPDATE SET payload = EXCLUDED.payload, created_at = CURRENT_TIMESTAMP, retry_count = 0, error_message = NULL
        RETURNING id INTO queue_id;
        RETURN queue_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 8. get_pending_algolia_syncs function ─────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".get_pending_algolia_syncs(batch_limit INTEGER DEFAULT 100)
      RETURNS TABLE(id BIGINT, table_name VARCHAR, record_id VARCHAR, operation VARCHAR, payload JSONB, retry_count INTEGER) AS $$
      DECLARE max_retries INTEGER;
      BEGIN
        SELECT COALESCE(MAX(c.max_retries), 5) INTO max_retries FROM "${s}".algolia_index_config c;
        RETURN QUERY
          SELECT q.id, q.table_name, q.record_id, q.operation, q.payload, q.retry_count
          FROM "${s}".algolia_sync_queue q
          WHERE q.status = 'pending' AND q.retry_count < max_retries
          ORDER BY q.created_at LIMIT batch_limit FOR UPDATE SKIP LOCKED;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 9. get_pending_syncs_by_table function ────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".get_pending_syncs_by_table(p_table_name VARCHAR, p_batch_limit INTEGER DEFAULT 100)
      RETURNS TABLE(id BIGINT, table_name VARCHAR, record_id VARCHAR, operation VARCHAR, payload JSONB, retry_count INTEGER) AS $$
      DECLARE max_retries INTEGER;
      BEGIN
        SELECT COALESCE(c.max_retries, 5) INTO max_retries FROM "${s}".algolia_index_config c WHERE c.table_name = p_table_name;
        RETURN QUERY
          SELECT q.id, q.table_name, q.record_id, q.operation, q.payload, q.retry_count
          FROM "${s}".algolia_sync_queue q
          WHERE q.status = 'pending' AND q.table_name = p_table_name AND q.retry_count < COALESCE(max_retries, 5)
          ORDER BY q.created_at LIMIT p_batch_limit FOR UPDATE SKIP LOCKED;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 10. mark_sync_processing function ─────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".mark_sync_processing(p_queue_ids BIGINT[]) RETURNS VOID AS $$
      BEGIN
        UPDATE "${s}".algolia_sync_queue SET status = 'processing', processed_at = CURRENT_TIMESTAMP
        WHERE id = ANY(p_queue_ids) AND status = 'pending';
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 11. mark_sync_completed function ──────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".mark_sync_completed(
        p_queue_id BIGINT, p_algolia_object_id VARCHAR DEFAULT NULL,
        p_sync_duration_ms INTEGER DEFAULT NULL, p_response_payload JSONB DEFAULT NULL
      ) RETURNS VOID AS $$
      BEGIN
        UPDATE "${s}".algolia_sync_queue SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = p_queue_id;
        INSERT INTO "${s}".algolia_sync_log (queue_id, table_name, record_id, operation, status, algolia_object_id, sync_duration_ms, response_payload, synced_at)
        SELECT id, table_name, record_id, operation, 'completed', p_algolia_object_id, p_sync_duration_ms, p_response_payload, CURRENT_TIMESTAMP
        FROM "${s}".algolia_sync_queue WHERE id = p_queue_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 12. mark_sync_failed function ─────────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".mark_sync_failed(
        p_queue_id BIGINT, p_error_message TEXT, p_error_details JSONB DEFAULT NULL
      ) RETURNS VOID AS $$
      DECLARE max_retries INTEGER; current_retry_count INTEGER; target_table_name VARCHAR;
      BEGIN
        SELECT q.table_name, q.retry_count INTO target_table_name, current_retry_count FROM "${s}".algolia_sync_queue q WHERE q.id = p_queue_id;
        SELECT COALESCE(c.max_retries, 5) INTO max_retries FROM "${s}".algolia_index_config c WHERE c.table_name = target_table_name;
        UPDATE "${s}".algolia_sync_queue SET
          status        = CASE WHEN retry_count + 1 >= max_retries THEN 'failed' ELSE 'pending' END,
          retry_count   = retry_count + 1,
          error_message = p_error_message,
          last_retry_at = CURRENT_TIMESTAMP,
          processed_at  = CASE WHEN retry_count + 1 >= max_retries THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE id = p_queue_id;
        INSERT INTO "${s}".algolia_sync_log (queue_id, table_name, record_id, operation, status, error_details, synced_at)
        SELECT id, table_name, record_id, operation,
          CASE WHEN retry_count >= max_retries THEN 'failed_permanent' ELSE 'failed_retry' END,
          jsonb_build_object('error_message', p_error_message, 'error_details', p_error_details, 'retry_count', retry_count),
          CURRENT_TIMESTAMP
        FROM "${s}".algolia_sync_queue WHERE id = p_queue_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 13. reset_stuck_processing function ───────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".reset_stuck_processing(timeout_minutes INTEGER DEFAULT 10) RETURNS INTEGER AS $$
      DECLARE reset_count INTEGER;
      BEGIN
        UPDATE "${s}".algolia_sync_queue SET status = 'pending', processed_at = NULL, error_message = 'Reset from stuck processing state'
        WHERE status = 'processing' AND processed_at < CURRENT_TIMESTAMP - (timeout_minutes || ' minutes')::INTERVAL;
        GET DIAGNOSTICS reset_count = ROW_COUNT;
        RETURN reset_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 14. cleanup_old_sync_records function ─────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".cleanup_old_sync_records(days_to_keep INTEGER DEFAULT 7) RETURNS INTEGER AS $$
      DECLARE deleted_count INTEGER;
      BEGIN
        DELETE FROM "${s}".algolia_sync_queue WHERE status = 'completed' AND processed_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 15. run_algolia_maintenance function ──────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".run_algolia_maintenance()
      RETURNS TABLE(task VARCHAR, items_affected INTEGER) AS $$
      DECLARE stuck_count INTEGER; cleanup_count INTEGER;
      BEGIN
        stuck_count := "${s}".reset_stuck_processing(10);
        RETURN QUERY SELECT 'reset_stuck_processing'::VARCHAR, stuck_count;
        cleanup_count := "${s}".cleanup_old_sync_records(7);
        RETURN QUERY SELECT 'cleanup_old_records'::VARCHAR, cleanup_count;
        EXECUTE 'VACUUM ANALYZE "${s}".algolia_sync_queue';
        EXECUTE 'VACUUM ANALYZE "${s}".algolia_sync_log';
        RETURN;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 16. update_updated_at_column function ─────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".update_updated_at_column() RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `);

    // ── 17. trigger_algolia_sync function ─────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION "${s}".trigger_algolia_sync() RETURNS TRIGGER AS $$
      DECLARE
        transform_func VARCHAR; payload JSONB; operation_type VARCHAR;
        full_table_name VARCHAR; record_id VARCHAR;
      BEGIN
        full_table_name := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;
        SELECT transform_function INTO transform_func FROM "${s}".algolia_index_config
        WHERE (table_name = full_table_name OR table_name = TG_TABLE_NAME) AND is_enabled = TRUE LIMIT 1;
        IF transform_func IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

        IF (TG_OP = 'DELETE') THEN
          operation_type := 'DELETE';
          BEGIN record_id := OLD.sfid::TEXT; EXCEPTION WHEN OTHERS THEN BEGIN record_id := OLD.id::TEXT; EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Could not determine record ID'; RETURN OLD; END; END;
          payload := jsonb_build_object('objectID', record_id);
          PERFORM "${s}".enqueue_algolia_sync(full_table_name, record_id, operation_type, payload);
          RETURN OLD;

        ELSIF (TG_OP = 'INSERT') THEN
          operation_type := 'INSERT';
          BEGIN record_id := NEW.sfid::TEXT; EXCEPTION WHEN OTHERS THEN record_id := NEW.id::TEXT; END;
          EXECUTE format('SELECT "${s}".%I($1)', transform_func) USING NEW INTO payload;
          PERFORM "${s}".enqueue_algolia_sync(full_table_name, record_id, operation_type, payload);
          RETURN NEW;

        ELSIF (TG_OP = 'UPDATE') THEN
          operation_type := 'UPDATE';
          BEGIN record_id := NEW.sfid::TEXT; EXCEPTION WHEN OTHERS THEN record_id := NEW.id::TEXT; END;
          EXECUTE format('SELECT "${s}".%I($1)', transform_func) USING NEW INTO payload;
          BEGIN
            PERFORM "${s}".enqueue_algolia_sync(full_table_name, record_id, operation_type, payload);
          EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to enqueue sync for record %: %', record_id, SQLERRM;
          END;
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    // ── 18. Triggers ──────────────────────────────────────────────────────────
    await client.query(`DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON "${s}".product2`);
    await client.query(`
      CREATE TRIGGER sf_product2_algolia_sync_trigger
        AFTER INSERT OR UPDATE OR DELETE ON "${s}".product2
        FOR EACH ROW EXECUTE FUNCTION "${s}".trigger_algolia_sync()
    `);

    await client.query(`DROP TRIGGER IF EXISTS update_algolia_config_timestamp ON "${s}".algolia_index_config`);
    await client.query(`
      CREATE TRIGGER update_algolia_config_timestamp
        BEFORE UPDATE ON "${s}".algolia_index_config
        FOR EACH ROW EXECUTE FUNCTION "${s}".update_updated_at_column()
    `);

    // ── 19. Monitoring Views ──────────────────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE VIEW "${s}".algolia_sync_stats AS
      SELECT table_name, operation, status, COUNT(*) as count,
             MAX(created_at) as last_created, MAX(processed_at) as last_processed, AVG(retry_count) as avg_retries
      FROM "${s}".algolia_sync_queue
      GROUP BY table_name, operation, status ORDER BY table_name, operation, status
    `);
    await client.query(`
      CREATE OR REPLACE VIEW "${s}".algolia_sync_health AS
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') as stuck_pending_count,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed_count,
        COUNT(*) FILTER (WHERE status = 'processing' AND processed_at < NOW() - INTERVAL '10 minutes') as stuck_processing_count,
        COUNT(*) FILTER (WHERE status = 'pending') as total_pending_count,
        MAX(created_at) FILTER (WHERE status = 'completed') as last_success_time,
        MAX(processed_at) FILTER (WHERE status = 'failed') as last_failure_time,
        (SELECT COUNT(*) FROM "${s}".algolia_sync_log WHERE status = 'completed' AND synced_at > NOW() - INTERVAL '1 hour') as syncs_last_hour
      FROM "${s}".algolia_sync_queue
    `);
    await client.query(`
      CREATE OR REPLACE VIEW "${s}".algolia_failed_syncs AS
      SELECT q.id, q.table_name, q.record_id, q.operation, q.error_message, q.retry_count, q.created_at, q.last_retry_at, q.processed_at
      FROM "${s}".algolia_sync_queue q WHERE q.status = 'failed' ORDER BY q.processed_at DESC
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to provision schema "${s}":`, error);
    throw error;
  } finally {
    client.release();
  }
}

// CLI: npx ts-node scripts/provisionTenant.ts <schema_name> [algolia_index_name]
if (require.main === module) {
  const schemaArg = process.argv[2];
  const indexArg = process.argv[3];
  if (!schemaArg) {
    console.error('Usage: npx ts-node scripts/provisionTenant.ts <schema_name> [algolia_index_name]');
    process.exit(1);
  }
  provisionTenantSchema(schemaArg, indexArg)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
