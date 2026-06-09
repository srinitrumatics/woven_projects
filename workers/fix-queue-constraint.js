const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixConstraint() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        await client.query(`
            -- 1. Drop existing constraint
            ALTER TABLE salesforce.algolia_sync_queue 
            DROP CONSTRAINT IF EXISTS unique_pending_operation;

            -- 2. Create partial unique index (only one pending operation at a time)
            CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_operation_idx 
            ON salesforce.algolia_sync_queue (table_name, record_id, operation) 
            WHERE status = 'pending';

            -- 3. Update enqueue_algolia_sync function to use the new index
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
                
                -- Insert into queue (ON CONFLICT with WHERE clause prevents duplicate pending operations)
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
        `);

        client.release();
    } catch (err) {
        console.error('❌ Error fixing constraint:', err);
    } finally {
        await pool.end();
    }
}

fixConstraint();
