// Test script to diagnose Algolia sync issues
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function diagnose() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const client = await pool.connect();
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('algolia_sync_queue', 'algolia_index_config', 'algolia_sync_log')
            ORDER BY table_name
        `);

        if (tables.rows.length === 0) {} else {
            tables.rows.forEach(row => {});
        }

        const queueStats = await client.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM algolia_sync_queue
            GROUP BY status
            ORDER BY status
        `);

        if (queueStats.rows.length === 0) {} else {
            queueStats.rows.forEach(row => {});
        }

        // 5. Check pending items details
        const pendingItems = await client.query(`
            SELECT id, table_name, operation, created_at, retry_count, last_error
            FROM algolia_sync_queue
            WHERE status = 'pending'
            ORDER BY created_at
            LIMIT 5
        `);

        if (pendingItems.rows.length > 0) {
            pendingItems.rows.forEach((item, idx) => {
                if (item.last_error) {}
            });
        }

        const indexConfig = await client.query(`
            SELECT table_name, index_name, is_enabled
            FROM algolia_index_config
            ORDER BY table_name
        `);

        if (indexConfig.rows.length === 0) {} else {
            indexConfig.rows.forEach(row => {
                const status = row.is_enabled ? '✓' : '✗';
            });
        }

        const functions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
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

            if (indices.items.length > 0) {
                indices.items.forEach(index => {});
            }
        } catch (error) {}
    }

    await pool.end();
}

diagnose().catch(console.error);
