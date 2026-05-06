// update-algolia-facets.js
// Run this once to add product_availability to Algolia's attributesForFaceting
// Usage: node workers/update-algolia-facets.js

const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

if (!appId || !adminKey) {
  console.error('❌ Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env');
  process.exit(1);
}

const client = algoliasearch(appId, adminKey);
const index = client.initIndex(indexName);

async function updateFacets() {
  try {
    console.log(`🔧 Updating attributesForFaceting on index: ${indexName}`);

    // First, check current settings
    const currentSettings = await index.getSettings();
    console.log('Current attributesForFaceting:', currentSettings.attributesForFaceting);

    // Merge existing with new ones to avoid removing any existing facets
    const existing = currentSettings.attributesForFaceting || [];
    const toAdd = ['searchable(product_availability)', 'searchable(category)'];

    // Combine without duplicates
    const merged = Array.from(new Set([...existing, ...toAdd]));

    await index.setSettings({
      attributesForFaceting: merged
    });

    console.log('✅ Updated attributesForFaceting:', merged);
    console.log('✅ Done! The product_availability filter should now show options in the UI.');
  } catch (err) {
    console.error('❌ Error updating Algolia settings:', err.message);
    process.exit(1);
  }
}

updateFacets();
