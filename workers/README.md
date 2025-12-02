# Algolia Sync Worker

Production-ready background worker that continuously synchronizes data from PostgreSQL to Algolia.

## Architecture

```
┌─────────────────┐
│   PostgreSQL    │
│  (Queue Table)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sync Worker    │
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Algolia      │
│   (Search API)  │
└─────────────────┘
```

## Features

- ✅ **Batch Processing**: Processes multiple records in batches for efficiency
- ✅ **Error Handling**: Automatic retry mechanism with configurable max retries
- ✅ **Graceful Shutdown**: Handles SIGTERM/SIGINT signals properly
- ✅ **Structured Logging**: JSON-formatted logs for easy parsing
- ✅ **Connection Pooling**: Efficient database connection management
- ✅ **Health Monitoring**: Tracks success/failure rates

## Installation

```bash
cd workers
npm install algoliasearch pg dotenv
```

## Environment Variables

Add these to your `.env` file:

```env
# Algolia Configuration
ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_api_key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Worker Configuration (Optional)
BATCH_SIZE=100
POLLING_INTERVAL=5000
MAX_RETRIES=5
SHUTDOWN_TIMEOUT=30000
```

## Running the Worker

### Development
```bash
node workers/algolia-sync-worker.js
```

### Production (with PM2)
```bash
# Install PM2
npm install -g pm2

# Start worker
pm2 start workers/algolia-sync-worker.js --name algolia-sync

# View logs
pm2 logs algolia-sync

# Monitor
pm2 monit

# Stop
pm2 stop algolia-sync

# Restart
pm2 restart algolia-sync
```

### Production (with systemd)

Create `/etc/systemd/system/algolia-sync.service`:

```ini
[Unit]
Description=Algolia Sync Worker
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node /path/to/your/app/workers/algolia-sync-worker.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=algolia-sync

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable algolia-sync
sudo systemctl start algolia-sync
sudo systemctl status algolia-sync
```

## How It Works

1. **Polling**: Worker polls the `algolia_sync_queue` table every 5 seconds (configurable)
2. **Batching**: Fetches up to 100 pending records (configurable)
3. **Grouping**: Groups records by table and operation for efficient batch API calls
4. **Syncing**: Sends batched requests to Algolia
5. **Logging**: Updates queue status and logs results
6. **Retry**: Failed items are automatically retried up to 5 times

## Monitoring

### View Queue Status
```sql
SELECT * FROM algolia_sync_stats;
```

### View Recent Logs
```sql
SELECT * FROM algolia_sync_log 
ORDER BY synced_at DESC 
LIMIT 100;
```

### Check Failed Items
```sql
SELECT * FROM algolia_sync_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Cleanup Old Records
```sql
SELECT cleanup_old_sync_records(7); -- Keep last 7 days
```

## Troubleshooting

### Worker Not Processing
1. Check database connection: `SELECT 1;`
2. Check Algolia credentials
3. Verify queue has pending items: `SELECT COUNT(*) FROM algolia_sync_queue WHERE status = 'pending';`

### High Failure Rate
1. Check Algolia API status
2. Review error messages in `algolia_sync_log`
3. Verify transform functions return valid data

### Performance Issues
1. Increase `BATCH_SIZE` for higher throughput
2. Decrease `POLLING_INTERVAL` for lower latency
3. Run multiple workers (ensure proper locking)

## Scaling

### Horizontal Scaling
Run multiple worker instances. The `FOR UPDATE SKIP LOCKED` clause in `get_pending_algolia_syncs()` ensures each worker processes different records.

```bash
pm2 start workers/algolia-sync-worker.js -i 3 --name algolia-sync
```

### Vertical Scaling
Increase batch size and connection pool:

```env
BATCH_SIZE=500
```

Update `algolia-sync-worker.js`:
```javascript
max: 50, // Increase connection pool
```

## Best Practices

1. **Monitor Logs**: Set up log aggregation (e.g., CloudWatch, Datadog)
2. **Alert on Failures**: Create alerts for high failure rates
3. **Regular Cleanup**: Run `cleanup_old_sync_records()` daily
4. **Index Optimization**: Configure Algolia index settings for your use case
5. **Backup Strategy**: Keep sync logs for audit trail

## API Reference

### DatabaseService

- `getPendingSyncs(batchSize)` - Fetch pending sync items
- `markCompleted(queueId, algoliaObjectId)` - Mark sync as successful
- `markFailed(queueId, errorMessage)` - Mark sync as failed
- `getIndexConfig(tableName)` - Get Algolia index configuration

### AlgoliaService

- `syncBatch(syncItems)` - Batch sync items to Algolia

## License

MIT
