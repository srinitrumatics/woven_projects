const algoliasearch = require('algoliasearch');
require('dotenv').config();
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local');

async function check() {
  const { hits } = await index.search('', { hitsPerPage: 100 });
  const counts = {};
  hits.forEach(h => {
    counts[h.manufacturer] = (counts[h.manufacturer] || 0) + 1;
  });
  console.log("Manufacturer Counts:", counts);
  console.log("Hits:", hits.map(h => ({ name: h.name, mf: h.manufacturer })));
}
check().catch(console.error);
