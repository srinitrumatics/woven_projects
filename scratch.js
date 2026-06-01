const algoliasearch = require('algoliasearch');
require('dotenv').config({ path: '.env' });
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex('wovn_products_local');
index.search('').then(({ hits }) => console.log(JSON.stringify(hits[0], null, 2)));
