require('dotenv').config();
const { Pool } = require('pg');

async function diagnose() {
    console.log("[Function Start] diagnose-functions.js -> diagnose");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM salesforce.get_pending_algolia_syncs(10)');
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
