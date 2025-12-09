const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testBulkUpdate() {
    console.log('=== Testing Bulk Update Behavior ===\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // 1. Check current queue state
        console.log('1. Current queue state:');
        const queueBefore = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(queueBefore.rows);

        // 2. Get sample products to update
        console.log('\n2. Getting sample products...');
        const products = await client.query(`
            SELECT sfid, name, 
                   COALESCE(image_url, '{}'::jsonb) as current_image_url
            FROM salesforce.product2 
            LIMIT 3
        `);

        console.log(`Found ${products.rows.length} products to test`);
        products.rows.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.sfid} - ${p.name}`);
        });

        // 3. Perform bulk update
        console.log('\n3. Performing bulk update on image_url...');
        const sfids = products.rows.map(p => p.sfid);

        const updateResult = await client.query(`
            UPDATE salesforce.product2 
            SET image_url = jsonb_set(
                COALESCE(image_url, '{}'::jsonb), 
                '{bulk_test_timestamp}', 
                to_jsonb($1)
            )
            WHERE sfid = ANY($2::text[])
            RETURNING sfid, name
        `, [new Date().toISOString(), sfids]);

        console.log(`Updated ${updateResult.rows.length} records`);

        // 4. Check queue after update
        console.log('\n4. Queue state after bulk update:');
        const queueAfter = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(queueAfter.rows);

        // 5. Check specific queue entries for our updated records
        console.log('\n5. Queue entries for updated records:');
        const queueEntries = await client.query(`
            SELECT id, record_id, operation, status, created_at, error_message
            FROM salesforce.algolia_sync_queue
            WHERE record_id = ANY($1::text[])
            ORDER BY created_at DESC
        `, [sfids]);

        if (queueEntries.rows.length === 0) {
            console.log('  ❌ NO QUEUE ENTRIES FOUND! Trigger may not be firing.');
        } else {
            console.log(`  ✓ Found ${queueEntries.rows.length} queue entries:`);
            console.table(queueEntries.rows);
        }

        // 6. Check for warnings in PostgreSQL logs
        console.log('\n6. Checking for recent warnings...');
        // Note: This requires log_min_messages = warning or lower
        console.log('  (Check your PostgreSQL logs for any RAISE WARNING messages)');

        client.release();

        // Summary
        console.log('\n=== Summary ===');
        const beforeCount = queueBefore.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
        const afterCount = queueAfter.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
        const newEntries = afterCount - beforeCount;

        console.log(`Queue entries before: ${beforeCount}`);
        console.log(`Queue entries after: ${afterCount}`);
        console.log(`New entries added: ${newEntries}`);
        console.log(`Expected new entries: ${updateResult.rows.length}`);

        if (newEntries === updateResult.rows.length) {
            console.log('✓ SUCCESS: All bulk updates were queued!');
        } else if (newEntries === 0) {
            console.log('❌ FAILURE: No entries were added to queue!');
            console.log('\nPossible causes:');
            console.log('  1. Trigger is not installed or disabled');
            console.log('  2. to_jsonb comparison is failing silently');
            console.log('  3. Transform function is missing');
            console.log('  4. Index config is disabled');
        } else {
            console.log(`⚠ PARTIAL: Only ${newEntries} of ${updateResult.rows.length} were queued`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

testBulkUpdate();
