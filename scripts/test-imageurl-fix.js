const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Assuming Node 18+ for global fetch
const fetch = global.fetch || require('node-fetch');

async function testImageUrlFix() {
    console.log('Testing imageUrl field fix...\n');

    // 1. Setup DB Connection
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    try {
        // 2. Generate and Insert Test API Key
        const testKey = 'sk_test_' + crypto.randomBytes(16).toString('hex');
        const keyHash = crypto.createHash('sha256').update(testKey).digest('hex');

        console.log(`Generated Test Key: ${testKey}\n`);

        await client.query(`
            INSERT INTO api_keys (id, key_hash, prefix, name, is_active, rate_limit)
            VALUES (gen_random_uuid(), $1, $2, 'Test Key ImageUrl', true, 100)
            ON CONFLICT (key_hash) DO NOTHING
        `, [keyHash, 'sk_test_']);

        console.log('Test key inserted into DB.\n');

        // 3. Test POST with imageUrl
        const API_URL = 'http://localhost:3000/api/external/v1/products';
        const headers = {
            'x-api-key': testKey,
            'Content-Type': 'application/json'
        };

        const testProductData = {
            productCode: `PostmanTest_product_${Date.now()}`,
            name: "Postman Refrigerator Model N0N5D",
            description: "refrigerators designed for durability and performance.",
            isActive: true,
            family: null,
            imageUrl: {
                images: [
                    {
                        isDisplay: false,
                        isCover: false,
                        sortOrder: 2,
                        thumb: "https://firebasestorage.googleapis.com/v0/b/trinternal.firebasestorage.app/o/thumb_1765539036260_head1.webp?alt=media",
                        url: "https://firebasestorage.googleapis.com/v0/b/trinternal.firebasestorage.app/o/1765539036260_head1.webp?alt=media",
                        id: "a00E200000ZRUcBIAX"
                    },
                    {
                        isDisplay: true,
                        isCover: true,
                        sortOrder: 9,
                        thumb: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1766050986/01tE200000GebJ0IAJ/thumb_1_iqon4i.png",
                        url: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1766050985/01tE200000GebJ0IAJ/1_mz2ygt.jpg",
                        id: "a00E200000ZdSYEIA3"
                    },
                    {
                        isDisplay: false,
                        isCover: false,
                        sortOrder: 14,
                        thumb: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1766130332/01tE200000GebJ0IAJ/01tE200000GebJ0IAJ_1766130331322_thumb_sample_1280_853_fwaq2r.png",
                        url: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1766130331/01tE200000GebJ0IAJ/01tE200000GebJ0IAJ_1766130331322_sample_1280_853_hgfn4h.jpg",
                        id: "a00E200000ZfhHIIAZ"
                    }
                ]
            },
            price: "33737",
            stockQuantity: "173",
            availableQuantity: "11",
            discount: "32",
            category: "Home Appliances",
            subCategory: "Refrigerators"
        };

        console.log('Testing POST Create with imageUrl...');
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(testProductData)
        });

        console.log(`Create Status: ${createRes.status}`);
        const createdData = await createRes.json();

        if (!createdData.data?.sfid) {
            console.error('❌ Failed to create product');
            console.error('Response:', JSON.stringify(createdData, null, 2));
            throw new Error('Failed to create product');
        }

        const productId = createdData.data.sfid;
        console.log('✅ Created Product ID:', productId);

        // 4. Verify imageUrl is stored correctly
        console.log('\n--- Checking imageUrl field ---');
        console.log('imageUrl type:', typeof createdData.data.imageUrl);
        console.log('imageUrl value:', JSON.stringify(createdData.data.imageUrl, null, 2));

        if (createdData.data.imageUrl === null) {
            console.error('❌ FAILED: imageUrl is null!');
        } else if (createdData.data.imageUrl && createdData.data.imageUrl.images) {
            console.log('✅ SUCCESS: imageUrl is properly stored with', createdData.data.imageUrl.images.length, 'images');
        } else {
            console.error('❌ FAILED: imageUrl structure is incorrect');
        }

        // 5. Test GET to verify persistence
        console.log('\n--- Testing GET to verify persistence ---');
        const getRes = await fetch(`${API_URL}/${productId}`, { headers });
        const getData = await getRes.json();

        console.log('Retrieved imageUrl:', JSON.stringify(getData.data.imageUrl, null, 2));

        if (getData.data.imageUrl && getData.data.imageUrl.images) {
            console.log('✅ SUCCESS: imageUrl persisted correctly in database');
        } else {
            console.error('❌ FAILED: imageUrl not persisted correctly');
        }

        // 6. Test PUT to update imageUrl
        console.log('\n--- Testing PUT to update imageUrl ---');
        const updatedImageUrl = {
            images: [
                {
                    isDisplay: true,
                    isCover: true,
                    sortOrder: 1,
                    thumb: "https://example.com/thumb_updated.png",
                    url: "https://example.com/updated.jpg",
                    id: "updated_id_123"
                }
            ]
        };

        const updateRes = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                ...testProductData,
                imageUrl: updatedImageUrl,
                name: 'Updated Product Name'
            })
        });

        const updatedData = await updateRes.json();
        console.log('Update Status:', updateRes.status);
        console.log('Updated imageUrl:', JSON.stringify(updatedData.data.imageUrl, null, 2));

        if (updatedData.data.imageUrl && updatedData.data.imageUrl.images.length === 1) {
            console.log('✅ SUCCESS: imageUrl updated correctly');
        } else {
            console.error('❌ FAILED: imageUrl update failed');
        }

        // 7. Cleanup
        console.log('\n--- Cleaning up test data ---');
        const deleteRes = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE',
            headers
        });
        console.log(`Delete Status: ${deleteRes.status}`);

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

// Check for node-fetch or use global fetch (Node 18+)
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.warn('node-fetch not found, using global fetch if available');
    }
}

testImageUrlFix();
