// Test script to diagnose Algolia sync issues for Salesforce Schema
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function diagnose() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name IN ('algolia_sync_queue', 'algolia_index_config', 'algolia_sync_log')
            ORDER BY table_name
        `);

        if (tables.rows.length === 0) {} else {
            tables.rows.forEach(row => {});
        }

        // Check if table exists before querying
        const queueExists = tables.rows.some(r => r.table_name === 'algolia_sync_queue');

        if (queueExists) {
            const queueStats = await client.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM salesforce.algolia_sync_queue
                GROUP BY status
                ORDER BY status
            `);

            if (queueStats.rows.length === 0) {} else {
                queueStats.rows.forEach(row => {});
            }

            // 5. Check pending items details
            const pendingItems = await client.query(`
                SELECT id, table_name, operation, created_at, retry_count, error_message
                FROM salesforce.algolia_sync_queue
                WHERE status = 'pending' OR status = 'failed'
                ORDER BY created_at DESC
                LIMIT 5
            `);

            if (pendingItems.rows.length > 0) {
                pendingItems.rows.forEach((item, idx) => {
                    if (item.error_message) {}
                });
            }
        }

        const configExists = tables.rows.some(r => r.table_name === 'algolia_index_config');
        if (configExists) {
            const indexConfig = await client.query(`
                SELECT table_name, index_name, is_enabled, transform_function
                FROM salesforce.algolia_index_config
                ORDER BY table_name
            `);

            if (indexConfig.rows.length === 0) {} else {
                indexConfig.rows.forEach(row => {
                    const status = row.is_enabled ? '✓' : '✗';
                });
            }
        }

        const functions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'salesforce' 
            AND routine_name IN ('get_pending_algolia_syncs', 'mark_sync_completed', 'mark_sync_failed')
            ORDER BY routine_name
        `);

        if (functions.rows.length === 0) {} else {
            functions.rows.forEach(row => {});
        }

        client.release();
    } catch (error) {}

    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {} else {
        try {
            const client = algoliasearch(appId, adminKey);
            const indices = await client.listIndices();

            // list a few indices
            if (indices.items.length > 0) {}
        } catch (error) {}
    }

    try {
        const client = await pool.connect();

        // Check table
        const productTable = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'product2'
        `);

        if (productTable.rows.length === 0) {} else {
            // Check triggers
            const triggers = await client.query(`
                SELECT trigger_name, event_manipulation, action_statement
                FROM information_schema.triggers
                WHERE event_object_schema = 'salesforce'
                AND event_object_table = 'product2'
            `);

            if (triggers.rows.length === 0) {} else {
                triggers.rows.forEach(t => {});

                // Check if specific algolia trigger exists
                const algoliaTrigger = triggers.rows.find(t => t.trigger_name.includes('algolia'));
                if (algoliaTrigger) {} else {}
            }
        }
        client.release();
    } catch (e) {}

    await pool.end();
}

diagnose().catch(console.error);
