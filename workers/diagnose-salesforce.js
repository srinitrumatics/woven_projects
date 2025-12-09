// Test script to diagnose Algolia sync issues for Salesforce Schema
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function diagnose() {
    console.log('=== Algolia Sync Diagnostics (Salesforce Schema) ===\n');

    // 1. Check environment variables
    console.log('1. Environment Variables:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('   ALGOLIA_APP_ID:', process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID || '✗ Missing');
    console.log('   ALGOLIA_ADMIN_KEY:', process.env.ALGOLIA_ADMIN_KEY ? '✓ Set' : '✗ Missing');
    console.log('');

    // 2. Test database connection
    console.log('2. Database Connection:');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('   ✓ Connected successfully');

        // 3. Check if tables exist
        console.log('\n3. Database Tables (salesforce schema):');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name IN ('algolia_sync_queue', 'algolia_index_config', 'algolia_sync_log')
            ORDER BY table_name
        `);

        if (tables.rows.length === 0) {
            console.log('   ✗ No Algolia tables found in salesforce schema!');
        } else {
            tables.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        }

        // 4. Check queue status
        console.log('\n4. Queue Status:');
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

            if (queueStats.rows.length === 0) {
                console.log('   ℹ Queue is empty (no items to sync)');
            } else {
                queueStats.rows.forEach(row => {
                    console.log(`   ${row.status}: ${row.count} items`);
                });
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
                console.log('\n5. Recent Items (Pending/Failed):');
                pendingItems.rows.forEach((item, idx) => {
                    console.log(`   ${idx + 1}. ID: ${item.id}`);
                    console.log(`      Table: ${item.table_name}, Operation: ${item.operation}`);
                    console.log(`      Created: ${item.created_at}`);
                    console.log(`      Retries: ${item.retry_count}`);
                    if (item.error_message) {
                        console.log(`      Error: ${item.error_message}`);
                    }
                });
            }
        }

        // 6. Check index configuration
        console.log('\n6. Index Configuration:');
        const configExists = tables.rows.some(r => r.table_name === 'algolia_index_config');
        if (configExists) {
            const indexConfig = await client.query(`
                SELECT table_name, index_name, is_enabled, transform_function
                FROM salesforce.algolia_index_config
                ORDER BY table_name
            `);

            if (indexConfig.rows.length === 0) {
                console.log('   ✗ No index configurations found!');
            } else {
                indexConfig.rows.forEach(row => {
                    const status = row.is_enabled ? '✓' : '✗';
                    console.log(`   ${status} ${row.table_name} → ${row.index_name}`);
                    console.log(`     Transform: ${row.transform_function}`);
                });
            }
        }

        // 7. Check database functions
        console.log('\n7. Database Functions:');
        const functions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'salesforce' 
            AND routine_name IN ('get_pending_algolia_syncs', 'mark_sync_completed', 'mark_sync_failed')
            ORDER BY routine_name
        `);

        if (functions.rows.length === 0) {
            console.log('   ✗ No Algolia functions found in salesforce schema!');
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

            // list a few indices
            if (indices.items.length > 0) {
                console.log(`   Sample indices: ${indices.items.slice(0, 3).map(i => i.name).join(', ')}`);
            }

        } catch (error) {
            console.log('   ✗ Error:', error.message);
            console.log('   Hint: Check if ALGOLIA_ADMIN_KEY is correct (not search key)');
        }
    }

    // 9. Specific Check for salesforce.product2 and triggers
    console.log('\n9. Salesforce Table & Trigger Check:');
    try {
        const client = await pool.connect();

        // Check table
        const productTable = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'product2'
        `);

        if (productTable.rows.length === 0) {
            console.log('   ✗ Table salesforce.product2 NOT FOUND!');
        } else {
            console.log('   ✓ Table salesforce.product2 exists');

            // Check triggers
            const triggers = await client.query(`
                SELECT trigger_name, event_manipulation, action_statement
                FROM information_schema.triggers
                WHERE event_object_schema = 'salesforce'
                AND event_object_table = 'product2'
            `);

            if (triggers.rows.length === 0) {
                console.log('   ✗ NO TRIGGERS found on salesforce.product2');
            } else {
                triggers.rows.forEach(t => {
                    console.log(`   ✓ Trigger: ${t.trigger_name} (${t.event_manipulation})`);
                });

                // Check if specific algolia trigger exists
                const algoliaTrigger = triggers.rows.find(t => t.trigger_name.includes('algolia'));
                if (algoliaTrigger) {
                    console.log('   ✓ Algolia sync trigger seems to be present');
                } else {
                    console.log('   ✗ Algolia sync trigger is MISSING');
                }
            }
        }
        client.release();
    } catch (e) {
        console.log('   ✗ Error checking triggers:', e.message);
    }

    await pool.end();
    console.log('\n=== Diagnostics Complete ===');
}

diagnose().catch(console.error);
