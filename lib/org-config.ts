import { db } from '../db';
import { organizations } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function getOrgConfig() {
  const headersList = await headers();
  // Get the host from the request headers
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
  
  if (!host) {
    throw new Error('Could not determine host for org config');
  }

  console.log(`[OrgConfig] 🔍 CHECKPOINT: Fetching config for host: '${host}'`);

  // Look up organization by siteUrl. We use ilike to match the domain
  // Assumes siteUrl might be "http://pitwatter.co" or "pitwatter.co"
  const orgs = await db.select().from(organizations)
    .where(ilike(organizations.siteUrl, `%${host}%`))
    .limit(1);

  if (orgs.length === 0) {
    console.warn(`[OrgConfig] ⚠️ CHECKPOINT: No organization found for host: '${host}'`);
    throw new Error(`No organization found for host: ${host}`);
  }

  const config = orgs[0];
  console.log(`[OrgConfig] ✅ CHECKPOINT: Successfully fetched org config for '${config.name}'`, {
    orgId: config.id,
    siteUrl: config.siteUrl,
    salesforceUrl: config.salesforceUrl,
    salesforceAuthUrl: config.salesforceAuthUrl,
    hasClientId: !!config.clientId,
    hasClientSecret: !!config.clientSecret,
    algoliaIndexName: config.algoliaIndexName,
    algoliaSchema: config.algoliaSchema
  });

  return config;
}
