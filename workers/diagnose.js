// Test script to diagnose Algolia sync issues
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function diagnose() {
    console.log('=== Algolia Sync Diagnostics ===\n');

    // 1. Check environment variables
    console.log('1. Environment Variables:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('   ALGOLIA_APP_ID:', process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID || '✗ Missing');
    console.log('   ALGOLIA_ADMIN_KEY:', process.env.ALGOLIA_ADMIN_KEY ? '✓ Set' : '✗ Missing');
    console.log('');

    // 2. Test database connection
    console.log('2. Database Connection:');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const client = await pool.connect();
        console.log('   ✓ Connected successfully');

        // 3. Check if tables exist
        console.log('\n3. Database Tables:');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('algolia_sync_queue', 'algolia_index_config', 'algolia_sync_log')
            ORDER BY table_name
        `);

        if (tables.rows.length === 0) {
            console.log('   ✗ No Algolia tables found! Run the migration SQL first.');
        } else {
            tables.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        }

        // 4. Check queue status
        console.log('\n4. Queue Status:');
        const queueStats = await client.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM algolia_sync_queue
            GROUP BY status
            ORDER BY status
        `);

        if (queueStats.rows.length === 0) {
            console.log('   ℹ Queue is empty (no items to sync)');
        } else {
            queueStats.rows.forEach(row => {
                console.log(`   ${row.status}: ${row.count} items`);
            });
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
            console.log('\n5. Pending Items (first 5):');
            pendingItems.rows.forEach((item, idx) => {
                console.log(`   ${idx + 1}. ID: ${item.id}`);
                console.log(`      Table: ${item.table_name}, Operation: ${item.operation}`);
                console.log(`      Created: ${item.created_at}`);
                console.log(`      Retries: ${item.retry_count}`);
                if (item.last_error) {
                    console.log(`      Error: ${item.last_error}`);
                }
            });
        }

        // 6. Check index configuration
        console.log('\n6. Index Configuration:');
        const indexConfig = await client.query(`
            SELECT table_name, index_name, is_enabled
            FROM algolia_index_config
            ORDER BY table_name
        `);

        if (indexConfig.rows.length === 0) {
            console.log('   ✗ No index configurations found!');
        } else {
            indexConfig.rows.forEach(row => {
                const status = row.is_enabled ? '✓' : '✗';
                console.log(`   ${status} ${row.table_name} → ${row.index_name}`);
            });
        }

        // 7. Check database functions
        console.log('\n7. Database Functions:');
        const functions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('get_pending_algolia_syncs', 'mark_sync_completed', 'mark_sync_failed')
            ORDER BY routine_name
        `);

        if (functions.rows.length === 0) {
            console.log('   ✗ No Algolia functions found! Run the migration SQL first.');
        } else {
            functions.rows.forEach(row => {
                console.log(`   ✓ ${row.routine_name}()`);
            });
        }

        client.release();
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // 8. Test Algolia connection
    console.log('\n8. Algolia Connection:');
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {
        console.log('   ✗ Missing Algolia credentials');
    } else {
        try {
            const client = algoliasearch(appId, adminKey);
            const indices = await client.listIndices();
            console.log(`   ✓ Connected successfully (${indices.items.length} indices found)`);

            if (indices.items.length > 0) {
                console.log('\n9. Algolia Indices:');
                indices.items.forEach(index => {
                    console.log(`   - ${index.name} (${index.entries} records)`);
                });
            }
        } catch (error) {
            console.log('   ✗ Error:', error.message);
            console.log('   Hint: Check if ALGOLIA_ADMIN_KEY is correct (not search key)');
        }
    }

    await pool.end();
    console.log('\n=== Diagnostics Complete ===');
}

diagnose().catch(console.error);
