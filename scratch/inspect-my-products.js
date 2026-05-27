const algoliasearch = require('algoliasearch');
require('dotenv').config();
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local');

async function check() {
  const { hits } = await index.search('');
  console.log('Total hits:', hits.length);
  for (const hit of hits.slice(0, 5)) {
    console.log(`- ${hit.name} | ID: ${hit.objectID} | Manufacturer: ${hit.manufacturer} | created_by: ${hit.created_by}`);
  }
}
check().catch(console.error);
