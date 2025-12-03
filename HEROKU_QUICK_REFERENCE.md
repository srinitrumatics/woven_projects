# Heroku Worker - Quick Reference

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy-worker.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x deploy-worker.sh
./deploy-worker.sh
```

### Option 2: Manual Deployment

```bash
# 1. Login to Heroku
heroku login

# 2. Create or link app
heroku create your-app-name
# OR
heroku git:remote -a existing-app-name

# 3. Set environment variables
heroku config:set DATABASE_URL="your-postgres-url"
heroku config:set NEXT_PUBLIC_ALGOLIA_APP_ID="your-app-id"
heroku config:set NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="your-search-key"
heroku config:set ALGOLIA_ADMIN_KEY="your-admin-key"
heroku config:set NEXT_PUBLIC_ALGOLIA_INDEX_NAME="dev_woven_products"

# 4. Deploy
git push heroku main

# 5. Scale worker
heroku ps:scale worker=1
```

## 📋 Essential Commands

### Monitoring
```bash
# View real-time logs
heroku logs --tail --dyno worker

# View last 100 lines
heroku logs -n 100 --dyno worker

# Check dyno status
heroku ps
```

### Control
```bash
# Start worker
heroku ps:scale worker=1

# Stop worker
heroku ps:scale worker=0

# Restart worker
heroku restart worker

# Scale to multiple workers
heroku ps:scale worker=2
```

### Configuration
```bash
# View all config vars
heroku config

# Set a config var
heroku config:set KEY=value

# Unset a config var
heroku config:unset KEY
```

### Debugging
```bash
# Run one-off command
heroku run node workers/test-worker-setup.js

# Access bash shell
heroku run bash

# View app info
heroku info

# Check database
heroku pg:info
heroku pg:psql
```

## 🔧 Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `ALGOLIA_ADMIN_KEY` - Algolia admin API key
- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Algolia application ID
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Target Algolia index

### Optional (with defaults)
- `BATCH_SIZE` - Number of records per batch (default: 100)
- `POLLING_INTERVAL` - Milliseconds between polls (default: 5000)
- `MAX_RETRIES` - Maximum retry attempts (default: 5)
- `SHUTDOWN_TIMEOUT` - Graceful shutdown timeout (default: 30000)

## 📊 Monitoring & Alerts

### Check Worker Health
```bash
# Is worker running?
heroku ps | grep worker

# Recent errors?
heroku logs --dyno worker | grep ERROR

# Memory usage
heroku ps -a your-app-name
```

### Common Log Patterns

**Successful sync:**
```json
{"level":"info","message":"Batch processing completed","total":10,"success":10,"failed":0}
```

**Worker started:**
```json
{"level":"info","message":"Algolia sync worker started"}
```

**Database connection:**
```json
{"level":"info","message":"Database connection established"}
```

**Errors to watch for:**
```json
{"level":"error","message":"Error processing queue"}
{"level":"error","message":"Missing Algolia credentials"}
{"level":"error","message":"Failed to seed Algolia index"}
```

## 🐛 Troubleshooting

### Worker crashes immediately
1. Check logs: `heroku logs --tail --dyno worker`
2. Verify environment variables: `heroku config`
3. Test database connection: `heroku run node workers/test-db-connection.js`

### No records being synced
1. Check if worker is running: `heroku ps`
2. Verify database has pending syncs
3. Check Algolia credentials
4. Review worker logs for errors

### Database connection errors
1. Ensure DATABASE_URL includes SSL: `?ssl=true`
2. Check if database is accessible
3. Verify connection pool settings

### Out of memory
1. Check dyno type: `heroku ps`
2. Reduce BATCH_SIZE
3. Upgrade to larger dyno: `heroku ps:resize worker=standard-2x`

## 💰 Cost Optimization

### Free Tier
- 550-1000 free dyno hours/month
- Worker sleeps after 30 min inactivity
- Good for: Development, testing

### Hobby ($7/month)
- Never sleeps
- 512 MB RAM
- Good for: Small production apps

### Standard ($25-$500/month)
- More resources
- Better performance monitoring
- Good for: Production apps

### Tips to Save Money
1. Stop worker when not needed: `heroku ps:scale worker=0`
2. Use free tier for development
3. Optimize BATCH_SIZE and POLLING_INTERVAL
4. Monitor dyno usage: `heroku ps`

## 🔄 Common Workflows

### Deploy New Version
```bash
git add .
git commit -m "Update worker"
git push heroku main
heroku restart worker
```

### Change Configuration
```bash
heroku config:set BATCH_SIZE=200
heroku restart worker
```

### View Recent Activity
```bash
heroku logs -n 500 --dyno worker | grep "Batch processing"
```

### Emergency Stop
```bash
heroku ps:scale worker=0
```

### Check Database Queue
```bash
heroku pg:psql
SELECT COUNT(*) FROM salesforce.algolia_sync_queue WHERE status = 'pending';
\q
```

## 📚 Additional Resources

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku Postgres](https://devcenter.heroku.com/categories/heroku-postgres)
- [Worker Dynos](https://devcenter.heroku.com/articles/background-jobs-queueing)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## 🆘 Support

For deployment issues:
1. Check `HEROKU_DEPLOYMENT.md` for detailed guide
2. Review worker logs: `heroku logs --tail --dyno worker`
3. Test locally: `npm run start:worker`
4. Check Heroku status: https://status.heroku.com/
