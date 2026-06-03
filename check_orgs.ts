import { db } from './db/index.js';
import { organizations } from './db/schema.js';

async function check() {
  const orgs = await db.select().from(organizations);
  console.log('Organizations:', orgs.map(o => ({
    name: o.name,
    algoliaIndexName: o.algoliaIndexName,
    algoliaSchema: o.algoliaSchema
  })));
  process.exit(0);
}
check();
