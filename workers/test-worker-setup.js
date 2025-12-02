require('dotenv').config();
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');

async function testWorkerSetup() {
    console.log('🔍 Testing Worker Setup\n');

    // Test 1: Environment Variables
    console.log('1️⃣ Checking environment variables...');
    console.log('   ALGOLIA_APP_ID:', process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? '✅ Set' : '❌ Missing');
    console.log('   ALGOLIA_ADMIN_KEY:', process.env.ALGOLIA_ADMIN_KEY ? '✅ Set' : '❌ Missing');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('');

    // Test 2: Algolia Connection
    console.log('2️⃣ Testing Algolia connection...');
    try {
        const client = algoliasearch(
            process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
            process.env.ALGOLIA_ADMIN_KEY
        );
        const index = client.initIndex('dev_woven_products');
        await index.search('', { hitsPerPage: 1 });
        console.log('   ✅ Algolia connection successful\n');
    } catch (error) {
        console.log('   ❌ Algolia connection failed:', error.message);
        console.log('');
    }

    // Test 3: Database Connection
    console.log('3️⃣ Testing database connection...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('   ✅ Database connection successful');

        // Test function calls
        console.log('\n4️⃣ Testing database functions...');

        const pendingResult = await client.query('SELECT * FROM salesforce.get_pending_algolia_syncs(10)');
        console.log('   ✅ get_pending_algolia_syncs:', pendingResult.rows.length, 'items');

        const configResult = await client.query('SELECT * FROM salesforce.algolia_index_config WHERE is_enabled = TRUE');
        console.log('   ✅ algolia_index_config:', configResult.rows.length, 'configs');

        if (configResult.rows.length > 0) {
            console.log('\n5️⃣ Index configurations:');
            configResult.rows.forEach(config => {
                console.log(`   - Table: ${config.table_name}`);
                console.log(`     Index: ${config.index_name}`);
                console.log(`     Enabled: ${config.is_enabled}`);
            });
        }

        client.release();
        await pool.end();

        console.log('\n✅ All tests passed! Worker should be able to start.\n');
    } catch (error) {
        console.error('   ❌ Database test failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testWorkerSetup();
