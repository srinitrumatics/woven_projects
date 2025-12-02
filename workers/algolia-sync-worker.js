// ============================================
// Algolia Sync Worker - Production Ready
// ============================================

const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ============================================
// CONFIGURATION
// ============================================

const config = {
    algolia: {
        appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY, // Admin API Key for write operations
    },
    postgres: {
        connectionString: process.env.DATABASE_URL,
        max: 20, // Connection pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: {
            rejectUnauthorized: false // Required for AWS RDS
        }
    },
    worker: {
        batchSize: parseInt(process.env.BATCH_SIZE) || 100,
        pollingInterval: parseInt(process.env.POLLING_INTERVAL) || 5000, // 5 seconds
        maxRetries: parseInt(process.env.MAX_RETRIES) || 5,
        shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 30000, // 30 seconds
    },
};

// ============================================
// INITIALIZE SERVICES
// ============================================

const algoliaClient = algoliasearch(config.algolia.appId, config.algolia.apiKey);
const pgPool = new Pool(config.postgres);

// Track worker state
let isShuttingDown = false;
let activeProcessing = 0;

// ============================================
// LOGGING UTILITY
// ============================================

const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
        }));
    },
    error: (message, error, meta = {}) => {
        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            message,
            error: error?.message || error,
            stack: error?.stack,
            ...meta,
        }));
    },
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
        }));
    },
};

// ============================================
// DATABASE SERVICE
// ============================================

class DatabaseService {
    static async getPendingSyncs(batchSize) {
        const client = await pgPool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM salesforce.get_pending_algolia_syncs($1)',
                [batchSize]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    static async markCompleted(queueId, algoliaObjectId = null) {
        const client = await pgPool.connect();
        try {
            await client.query(
                'SELECT salesforce.mark_sync_completed($1, $2)',
                [queueId, algoliaObjectId]
            );
        } finally {
            client.release();
        }
    }

    static async markFailed(queueId, errorMessage) {
        const client = await pgPool.connect();
        try {
            await client.query(
                'SELECT salesforce.mark_sync_failed($1, $2)',
                [queueId, errorMessage]
            );
        } finally {
            client.release();
        }
    }

    static async getIndexConfig(tableName) {
        const client = await pgPool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM salesforce.algolia_index_config WHERE table_name = $1 AND is_enabled = TRUE',
                [tableName]
            );
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }
}

// ============================================
// ALGOLIA SERVICE
// ============================================

class AlgoliaService {
    static async syncBatch(syncItems) {
        if (!syncItems || syncItems.length === 0) {
            return [];
        }

        // Group by table and operation for batch processing
        const grouped = syncItems.reduce((acc, item) => {
            const key = `${item.table_name}_${item.operation}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});

        const results = [];

        // Process each group
        for (const [key, items] of Object.entries(grouped)) {
            const [tableName, operation] = key.split('_');

            // Get index configuration
            const indexConfig = await DatabaseService.getIndexConfig(tableName);
            if (!indexConfig) {
                logger.warn(`No index config for table: ${tableName}`);
                // Mark as failed
                for (const item of items) {
                    await DatabaseService.markFailed(item.id, `No index config for table: ${tableName}`);
                    results.push({ success: false, queueId: item.id });
                }
                continue;
            }

            const index = algoliaClient.initIndex(indexConfig.index_name);

            try {
                if (operation === 'DELETE') {
                    // Batch delete
                    const objectIDs = items
                        .map(item => item.payload?.objectID)
                        .filter(Boolean);

                    if (objectIDs.length > 0) {
                        await index.deleteObjects(objectIDs);

                        // Mark all as completed
                        for (const item of items) {
                            await DatabaseService.markCompleted(item.id, item.payload?.objectID);
                            results.push({ success: true, queueId: item.id });
                        }
                    }
                } else {
                    // Batch save (INSERT/UPDATE)
                    const objects = items
                        .map(item => item.payload)
                        .filter(payload => payload && payload.objectID);

                    if (objects.length > 0) {
                        await index.saveObjects(objects);

                        // Mark all as completed
                        for (const item of items) {
                            await DatabaseService.markCompleted(item.id, item.payload?.objectID);
                            results.push({ success: true, queueId: item.id });
                        }
                    }
                }

                logger.info('Batch sync completed', {
                    tableName,
                    operation,
                    count: items.length,
                });
            } catch (error) {
                logger.error('Batch sync failed', error, { tableName, operation });

                // Mark individual items as failed
                for (const item of items) {
                    await DatabaseService.markFailed(item.id, error.message);
                    results.push({ success: false, queueId: item.id, error: error.message });
                }
            }
        }

        return results;
    }
}

// ============================================
// WORKER MAIN LOOP
// ============================================

class SyncWorker {
    constructor() {
        this.isRunning = false;
    }

    async processQueue() {
        if (isShuttingDown || activeProcessing > 0) {
            return;
        }

        activeProcessing++;

        try {
            const syncItems = await DatabaseService.getPendingSyncs(config.worker.batchSize);

            if (syncItems.length === 0) {
                return;
            }

            logger.info('Processing sync batch', { count: syncItems.length });

            // Process in batch for better performance
            const results = await AlgoliaService.syncBatch(syncItems);

            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            logger.info('Batch processing completed', {
                total: results.length,
                success: successCount,
                failed: failureCount,
            });
        } catch (error) {
            logger.error('Error processing queue', error);
        } finally {
            activeProcessing--;
        }
    }

    async start() {
        if (this.isRunning) {
            logger.warn('Worker already running');
            return;
        }

        this.isRunning = true;
        logger.info('Algolia sync worker started', config.worker);

        // Main processing loop
        while (this.isRunning && !isShuttingDown) {
            try {
                await this.processQueue();
            } catch (error) {
                logger.error('Unexpected error in worker loop', error);
            }

            // Wait before next poll
            await this.sleep(config.worker.pollingInterval);
        }

        logger.info('Worker stopped');
    }

    async stop() {
        logger.info('Stopping worker...');
        this.isRunning = false;

        // Wait for active processing to complete
        const timeout = setTimeout(() => {
            logger.warn('Shutdown timeout reached, forcing exit');
            process.exit(1);
        }, config.worker.shutdownTimeout);

        while (activeProcessing > 0) {
            await this.sleep(100);
        }

        clearTimeout(timeout);
        await pgPool.end();
        logger.info('Worker stopped gracefully');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const worker = new SyncWorker();

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    isShuttingDown = true;
    await worker.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received');
    isShuttingDown = true;
    await worker.stop();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', reason);
    process.exit(1);
});

// ============================================
// START WORKER
// ============================================

(async () => {
    try {
        // Validate configuration
        if (!config.algolia.appId || !config.algolia.apiKey) {
            throw new Error('Missing Algolia credentials (ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY)');
        }

        if (!config.postgres.connectionString) {
            throw new Error('Missing DATABASE_URL');
        }

        // Test database connection
        const client = await pgPool.connect();
        logger.info('Database connection established');
        client.release();

        // Start worker
        await worker.start();
    } catch (error) {
        logger.error('Failed to start worker', error);
        process.exit(1);
    }
})();
