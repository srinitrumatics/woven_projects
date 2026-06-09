const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fetch = global.fetch || require('node-fetch');

async function testManufacturerField() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    try {
        // Generate test API key
        const testKey = 'sk_test_' + crypto.randomBytes(16).toString('hex');
        const keyHash = crypto.createHash('sha256').update(testKey).digest('hex');

        await client.query(`
            INSERT INTO api_keys (id, key_hash, prefix, name, is_active, rate_limit)
            VALUES (gen_random_uuid(), $1, $2, 'Test Manufacturer Field', true, 100)
            ON CONFLICT (key_hash) DO NOTHING
        `, [keyHash, 'sk_test_']);

        const API_URL = 'http://localhost:3000/api/external/v1/products';
        const headers = {
            'x-api-key': testKey,
            'Content-Type': 'application/json'
        };

        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                productCode: `TEST_MFG_${Date.now()}`,
                name: 'Test Product with Manufacturer',
                description: 'Testing manufacturer field',
                isActive: true,
                manufacturerName: 'Samsung Electronics',
                price: "999.99",
                category: "Electronics"
            })
        });

        const createdData = await createRes.json();

        if (createdData.data?.manufacturerName) {} else {}

        const productId = createdData.data?.sfid;

        if (productId) {
            const updateRes = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    productCode: createdData.data.productCode,
                    name: createdData.data.name,
                    manufacturerName: 'LG Corporation'
                })
            });

            const updatedData = await updateRes.json();

            if (updatedData.data?.manufacturerName === 'LG Corporation') {} else {}

            // Cleanup
            await fetch(`${API_URL}/${productId}`, { method: 'DELETE', headers });
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.warn('node-fetch not found');
    }
}

testManufacturerField();
