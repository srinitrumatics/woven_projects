
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function validateApiKey(key: string): Promise<{ valid: boolean; rateLimit?: number; remaining?: number }> {
    if (!key) {
        return { valid: false };
    }

    // Hash the key to compare with stored hash
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    try {
        const keyRecord = await db.query.apiKeys.findFirst({
            where: eq(apiKeys.keyHash, hash),
        });

        if (!keyRecord || !keyRecord.isActive) {
            return { valid: false };
        }

        // Update last used timestamp
        // we deliberately don't await this to not block the request
        db.update(apiKeys)
            .set({ lastUsedAt: new Date().toISOString() })
            .where(eq(apiKeys.id, keyRecord.id))
            .execute();

        // Rate limiting logic would go here
        // For now, assuming standard rate limit
        // In a real production system, use Redis or similar for rate limiting counters

        return { valid: true, rateLimit: keyRecord.rateLimit };
    } catch (error) {
        console.error('API Key validation error:', error);
        return { valid: false };
    }
}
