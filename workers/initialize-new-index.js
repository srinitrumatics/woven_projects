const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

if (!appId || !adminKey || !indexName) {
  console.error('❌ Missing Algolia configuration in .env');
  process.exit(1);
}

const client = algoliasearch(appId, adminKey);
const index = client.initIndex(indexName);

async function initializeIndex() {
  try {
    const settings = {
      searchableAttributes: [
        'name',
        'sku',
        'description',
        'category',
        'manufacturer',
        'product_availability'
      ],
      attributesForFaceting: [
        'searchable(category)',
        'searchable(product_availability)',
        'searchable(manufacturer)',
        'searchable(Availability_Status__c)',
        'status',
        'is_active',
        '_tags'
      ],
      customRanking: [
        'desc(updated_at)',
        'desc(available_quantity)'
      ],
      attributesToSnippet: [
        'description:20'
      ],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    };

    await index.setSettings(settings);
  } catch (err) {
    console.error('❌ Error initializing index:', err.message);
    process.exit(1);
  }
}

initializeIndex();
