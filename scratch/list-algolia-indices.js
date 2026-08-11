require('dotenv').config();
const algoliasearch = require('algoliasearch');

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const client = algoliasearch(appId, adminKey);

(async () => {
  const { items } = await client.listIndices();
  console.log('App ID:', appId);
  console.log('Indices:');
  items.forEach(i => console.log(' -', i.name, '| entries:', i.entries, '| updatedAt:', i.updatedAt));
})().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
