// Check API Key permissions
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkPermissions() {
    console.log("[Function Start] check-permissions.js -> checkPermissions");
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !apiKey) {
        console.error('Missing Algolia credentials');
        return;
    }

    // We can't easily check the key's permissions without using the key itself to query the keys API, 
    // which requires an admin key (catch-22 if this ISN'T an admin key).
    // However, we can try a write operation on a dummy index to confirm.

    const client = algoliasearch(appId, apiKey);
    const index = client.initIndex('test_permission_check');

    try {
        await index.saveObject({
            objectID: 'test_obj',
            test: true,
            timestamp: Date.now()
        });

        // Clean up
        await index.deleteObject('test_obj');
    } catch (error) {
        console.error('✗ Failed to write object:', error.message);
        if (error.message.includes('Not enough rights')) {}
    }
}

checkPermissions();
