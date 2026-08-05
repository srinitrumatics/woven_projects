import { db } from '../db';
import { organizations } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';
import { headers } from 'next/headers';

type OrgConfig = typeof organizations.$inferSelect;

const ORG_CONFIG_TTL_MS = 5 * 60 * 1000; // organization credentials change rarely
const orgConfigCache = new Map<string, { config: OrgConfig; expiresAt: number }>();

export async function getOrgConfig(): Promise<OrgConfig> {
  const headersList = await headers();
  // Get the host from the request headers
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';

  if (!host) {
    throw new Error('Could not determine host for org config');
  }

  const cached = orgConfigCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config;
  }

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
  orgConfigCache.set(host, { config, expiresAt: Date.now() + ORG_CONFIG_TTL_MS });

  return config;
}
