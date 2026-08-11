require('dotenv').config();
const algoliasearch = require('algoliasearch');

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const client = algoliasearch(appId, adminKey);

const candidates = [
  'woven_products_00da500001tjiapeat',
  'woven_products_infinitylocal',
  'woven_products_infinitydev',
  'woven_products_ty09iut8912',
  'dev_woven_products',
];

(async () => {
  for (const indexName of candidates) {
    const index = client.initIndex(indexName);
    try {
      const { hits, nbHits } = await index.search('', { hitsPerPage: 1000 });
      const withImageUrl = hits.filter(h => h.image_url);
      const withImages = hits.filter(h => h.images && (Array.isArray(h.images) ? h.images.length > 0 : true));
      console.log(`\n=== ${indexName} === nbHits: ${nbHits} | with image_url: ${withImageUrl.length} | with images: ${withImages.length}`);
      const sample = withImageUrl[0] || withImages[0];
      if (sample) {
        console.log('sample:', JSON.stringify({ objectID: sample.objectID, name: sample.name, image_url: sample.image_url, images: sample.images }, null, 2));
      }
    } catch (err) {
      console.log(`\n=== ${indexName} === ERROR: ${err.message}`);
    }
  }
})();
