const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);

async function main() {
  try {
    const hits = await index.search('', { hitsPerPage: 100 });
    console.log("Total hits:", hits.nbHits);
    const categories = new Set(hits.hits.map(h => h.category));
    console.log("Unique categories in index:", Array.from(categories));
  } catch (error) {
    console.error(error);
  }
}

main();
