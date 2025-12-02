require('dotenv').config();
const { Pool } = require('pg');

async function diagnose() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Connected successfully\n');

        console.log('Testing salesforce.get_pending_algolia_syncs function...');
        try {
            const result = await client.query('SELECT * FROM salesforce.get_pending_algolia_syncs(10)');
            console.log('✅ Function exists and works');
            console.log('   Pending items:', result.rows.length);
        } catch (err) {
            console.error('❌ Function call failed:', err.message);
        }

        client.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

diagnose();
