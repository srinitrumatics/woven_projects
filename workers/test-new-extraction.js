const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testNewExtraction() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Test the new extraction method
        const result = await client.query(`
            SELECT 
                name,
                image_url#>>'{images,0,url}' as extracted_url
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 5
        `);

        console.log('Testing new extraction method:\n');
        result.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.name}`);
            console.log(`   URL: ${row.extracted_url}`);
            console.log('');
        });

        if (result.rows.every(r => r.extracted_url)) {
            console.log('✅ SUCCESS! All URLs extracted correctly!');
            console.log('\nNext step: Apply the updated transform function');
            console.log('Run the SQL snippet I provided earlier.');
        } else {
            console.log('❌ Some URLs are still NULL');
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

testNewExtraction();
