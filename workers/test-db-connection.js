require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseConnection() {
    console.log("[Function Start] test-db-connection.js -> testDatabaseConnection");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const client = await pool.connect();
        const dbInfo = await client.query(`
            SELECT 
                current_database() as database,
                current_user as user,
                version() as version
        `);
        const schemaCheck = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'salesforce'
        `);
        if (schemaCheck.rows.length > 0) {} else {}

        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'product2'
        `);
        if (tableCheck.rows.length > 0) {
            // Count products
            const countResult = await client.query('SELECT COUNT(*) as count FROM salesforce.product2');

            // Sample product
            const sampleResult = await client.query(`
                SELECT sfid, name, productcode, isactive 
                FROM salesforce.product2 
                LIMIT 1
            `);
            if (sampleResult.rows.length > 0) {}
        } else {}

        const algoliaTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name IN ('algolia_sync_queue', 'algolia_sync_log', 'algolia_index_config')
            ORDER BY table_name
        `);

        if (algoliaTables.rows.length > 0) {
            algoliaTables.rows.forEach(row => {});
        } else {}

        // Test 6: Check Algolia Config
        const configCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'algolia_index_config'
        `);

        if (configCheck.rows.length > 0) {
            const config = await client.query(`
                SELECT table_name, index_name, is_enabled, transform_function, batch_size
                FROM salesforce.algolia_index_config
            `);

            if (config.rows.length > 0) {
                config.rows.forEach(row => {});
            } else {}
        }

        // Test 7: Check Sync Queue
        const queueCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'algolia_sync_queue'
        `);

        if (queueCheck.rows.length > 0) {
            const queueStats = await client.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM salesforce.algolia_sync_queue
                GROUP BY status
                ORDER BY status
            `);

            if (queueStats.rows.length > 0) {
                queueStats.rows.forEach(row => {});
            } else {}
        }

        const functions = await client.query(`
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'salesforce'
            AND routine_name LIKE '%algolia%'
            ORDER BY routine_name
        `);

        if (functions.rows.length > 0) {
            functions.rows.forEach(row => {});
        } else {}

        const triggers = await client.query(`
            SELECT trigger_name, event_manipulation
            FROM information_schema.triggers
            WHERE event_object_schema = 'salesforce'
            AND event_object_table = 'product2'
        `);

        if (triggers.rows.length > 0) {
            triggers.rows.forEach(row => {});
        } else {}

        client.release();
    } catch (error) {
        console.error('❌ Database connection test failed:');
        console.error('   Error:', error.message);
        if (error.code) {
            console.error('   Code:', error.code);
        }
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the test
testDatabaseConnection();
