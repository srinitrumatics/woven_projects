require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Test 1: Basic Connection
        console.log('1️⃣ Testing basic connection...');
        const client = await pool.connect();
        console.log('   ✅ Successfully connected to database\n');

        // Test 2: Database Info
        console.log('2️⃣ Fetching database info...');
        const dbInfo = await client.query(`
            SELECT 
                current_database() as database,
                current_user as user,
                version() as version
        `);
        console.log('   Database:', dbInfo.rows[0].database);
        console.log('   User:', dbInfo.rows[0].user);
        console.log('   Version:', dbInfo.rows[0].version.split(',')[0]);
        console.log('   ✅ Database info retrieved\n');

        // Test 3: Check Salesforce Schema
        console.log('3️⃣ Checking salesforce schema...');
        const schemaCheck = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'salesforce'
        `);
        if (schemaCheck.rows.length > 0) {
            console.log('   ✅ Salesforce schema exists\n');
        } else {
            console.log('   ⚠️  Salesforce schema does NOT exist\n');
        }

        // Test 4: Check Product2 Table
        console.log('4️⃣ Checking salesforce.product2 table...');
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'product2'
        `);
        if (tableCheck.rows.length > 0) {
            console.log('   ✅ salesforce.product2 table exists');
            
            // Count products
            const countResult = await client.query('SELECT COUNT(*) as count FROM salesforce.product2');
            console.log('   📊 Total products:', countResult.rows[0].count);
            
            // Sample product
            const sampleResult = await client.query(`
                SELECT sfid, name, productcode, isactive 
                FROM salesforce.product2 
                LIMIT 1
            `);
            if (sampleResult.rows.length > 0) {
                console.log('   📦 Sample product:', sampleResult.rows[0]);
            }
            console.log('');
        } else {
            console.log('   ⚠️  salesforce.product2 table does NOT exist\n');
        }

        // Test 5: Check Algolia Sync Tables
        console.log('5️⃣ Checking Algolia sync tables...');
        const algoliaTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name IN ('algolia_sync_queue', 'algolia_sync_log', 'algolia_index_config')
            ORDER BY table_name
        `);
        
        if (algoliaTables.rows.length > 0) {
            console.log('   ✅ Found Algolia tables:');
            algoliaTables.rows.forEach(row => {
                console.log('      -', row.table_name);
            });
            console.log('');
        } else {
            console.log('   ⚠️  Algolia sync tables do NOT exist');
            console.log('   💡 Run the algolia.sql script to create them\n');
        }

        // Test 6: Check Algolia Config
        const configCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'algolia_index_config'
        `);
        
        if (configCheck.rows.length > 0) {
            console.log('6️⃣ Checking Algolia index configuration...');
            const config = await client.query(`
                SELECT table_name, index_name, is_enabled, transform_function, batch_size
                FROM salesforce.algolia_index_config
            `);
            
            if (config.rows.length > 0) {
                console.log('   ✅ Algolia configuration found:');
                config.rows.forEach(row => {
                    console.log('      Table:', row.table_name);
                    console.log('      Index:', row.index_name);
                    console.log('      Enabled:', row.is_enabled);
                    console.log('      Transform Function:', row.transform_function);
                    console.log('      Batch Size:', row.batch_size);
                    console.log('');
                });
            } else {
                console.log('   ⚠️  No Algolia configuration found\n');
            }
        }

        // Test 7: Check Sync Queue
        const queueCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'salesforce' 
            AND table_name = 'algolia_sync_queue'
        `);
        
        if (queueCheck.rows.length > 0) {
            console.log('7️⃣ Checking sync queue status...');
            const queueStats = await client.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM salesforce.algolia_sync_queue
                GROUP BY status
                ORDER BY status
            `);
            
            if (queueStats.rows.length > 0) {
                console.log('   📊 Queue statistics:');
                queueStats.rows.forEach(row => {
                    console.log(`      ${row.status}: ${row.count}`);
                });
                console.log('');
            } else {
                console.log('   ℹ️  Queue is empty\n');
            }
        }

        // Test 8: Check Functions
        console.log('8️⃣ Checking Algolia functions...');
        const functions = await client.query(`
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'salesforce'
            AND routine_name LIKE '%algolia%'
            ORDER BY routine_name
        `);
        
        if (functions.rows.length > 0) {
            console.log('   ✅ Found Algolia functions:');
            functions.rows.forEach(row => {
                console.log('      -', row.routine_name);
            });
            console.log('');
        } else {
            console.log('   ⚠️  No Algolia functions found\n');
        }

        // Test 9: Check Triggers
        console.log('9️⃣ Checking triggers on salesforce.product2...');
        const triggers = await client.query(`
            SELECT trigger_name, event_manipulation
            FROM information_schema.triggers
            WHERE event_object_schema = 'salesforce'
            AND event_object_table = 'product2'
        `);
        
        if (triggers.rows.length > 0) {
            console.log('   ✅ Found triggers:');
            triggers.rows.forEach(row => {
                console.log(`      - ${row.trigger_name} (${row.event_manipulation})`);
            });
            console.log('');
        } else {
            console.log('   ⚠️  No triggers found on salesforce.product2\n');
        }

        client.release();
        
        console.log('✅ Database connection test completed successfully!');
        
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
