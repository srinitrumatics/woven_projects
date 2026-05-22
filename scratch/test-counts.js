require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseConnection() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const countResult = await client.query('SELECT COUNT(*) as count FROM salesforce.product2');
        console.log('Total products:', countResult.rows[0].count);
        
        const activeResult = await client.query('SELECT COUNT(*) as count FROM salesforce.product2 WHERE isactive = true');
        console.log('Active products:', activeResult.rows[0].count);
        
        const inactiveResult = await client.query('SELECT COUNT(*) as count FROM salesforce.product2 WHERE isactive = false OR isactive IS NULL');
        console.log('Inactive products:', inactiveResult.rows[0].count);
        
        // Show some inactive products
        const sampleInactive = await client.query('SELECT name, sfid, isactive FROM salesforce.product2 WHERE isactive = false OR isactive IS NULL LIMIT 5');
        console.log('Sample inactive:', sampleInactive.rows);

        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
testDatabaseConnection();
