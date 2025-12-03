# Deploying Algolia Sync Worker to Heroku

This guide will help you deploy the Algolia sync worker as a background process on Heroku.

## Prerequisites

1. **Heroku CLI installed**: Download from https://devcenter.heroku.com/articles/heroku-cli
2. **Git repository initialized**: Your project should be in a Git repository
3. **Heroku account**: Sign up at https://heroku.com

## Step 1: Login to Heroku

```bash
heroku login
```

## Step 2: Create Heroku App (if not already created)

```bash
# Create a new Heroku app
heroku create your-app-name

# Or link to existing app
heroku git:remote -a your-existing-app-name
```

## Step 3: Set Environment Variables

Set all required environment variables on Heroku:

```bash
# Database
heroku config:set DATABASE_URL="your-postgres-connection-string"

# Algolia Credentials
heroku config:set NEXT_PUBLIC_ALGOLIA_APP_ID="your-algolia-app-id"
heroku config:set NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="your-algolia-search-key"
heroku config:set ALGOLIA_ADMIN_KEY="your-algolia-admin-key"
heroku config:set NEXT_PUBLIC_ALGOLIA_INDEX_NAME="dev_woven_products"

# Worker Configuration (optional - defaults are set)
heroku config:set BATCH_SIZE=100
heroku config:set POLLING_INTERVAL=5000
heroku config:set MAX_RETRIES=5
heroku config:set SHUTDOWN_TIMEOUT=30000

# Next.js (if deploying web app too)
heroku config:set NODE_ENV=production
```

## Step 4: Verify Procfile

Your `Procfile` should contain:

```
web: npm start
worker: npm run start:worker
```

✅ This is already configured in your project!

## Step 5: Deploy to Heroku

```bash
# Add all changes to git
git add .
git commit -m "Deploy worker to Heroku"

# Push to Heroku
git push heroku main
# Or if your branch is named 'master':
# git push heroku master
```

## Step 6: Scale the Worker Dyno

After deployment, you need to enable the worker dyno:

```bash
# Scale worker to 1 instance
heroku ps:scale worker=1

# Optional: Scale web dyno if needed
heroku ps:scale web=1
```

## Step 7: Monitor the Worker

### View logs in real-time:
```bash
heroku logs --tail --dyno worker
```

### Check dyno status:
```bash
heroku ps
```

### View specific worker logs:
```bash
heroku logs --tail --source app --dyno worker
```

## Step 8: Database Setup

Ensure your PostgreSQL database has the required functions and tables:

```bash
# Connect to your Heroku Postgres
heroku pg:psql

# Run your database migrations if needed
# The worker expects these database functions:
# - salesforce.get_pending_algolia_syncs(batch_size)
# - salesforce.mark_sync_completed(queue_id, algolia_object_id)
# - salesforce.mark_sync_failed(queue_id, error_message)
```

## Troubleshooting

### Worker not starting?

1. **Check logs:**
   ```bash
   heroku logs --tail --dyno worker
   ```

2. **Verify environment variables:**
   ```bash
   heroku config
   ```

3. **Check dyno status:**
   ```bash
   heroku ps
   ```

### Common Issues:

1. **Missing environment variables:**
   - Error: "Missing Algolia credentials"
   - Solution: Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY

2. **Database connection failed:**
   - Error: "Missing DATABASE_URL"
   - Solution: Ensure DATABASE_URL is set with SSL enabled

3. **Worker crashes immediately:**
   - Check if database functions exist
   - Verify Algolia credentials are correct

## Managing the Worker

### Stop the worker:
```bash
heroku ps:scale worker=0
```

### Start the worker:
```bash
heroku ps:scale worker=1
```

### Restart the worker:
```bash
heroku restart worker
```

### Scale to multiple workers (if needed):
```bash
heroku ps:scale worker=2
```

## Cost Considerations

- **Free Tier**: 550-1000 free dyno hours per month
- **Hobby Tier**: $7/month per dyno (never sleeps)
- **Professional Tier**: $25-$500/month (more resources)

Worker dynos count towards your dyno hours.

## Monitoring & Alerts

### Set up log drains (optional):
```bash
heroku drains:add https://your-logging-service.com
```

### Enable metrics (Professional dynos):
```bash
heroku labs:enable runtime-dyno-metadata
```

## Next Steps

1. ✅ Deploy the application
2. ✅ Scale the worker dyno
3. ✅ Monitor logs to ensure it's working
4. ✅ Set up alerts for failures (optional)
5. ✅ Configure auto-scaling if needed (Professional tier)

## Useful Commands Reference

```bash
# View all config vars
heroku config

# Set a config var
heroku config:set KEY=value

# Unset a config var
heroku config:unset KEY

# View app info
heroku info

# Open app in browser
heroku open

# Run one-off commands
heroku run node workers/test-worker-setup.js

# Access bash shell
heroku run bash
```

## Support

For issues specific to Heroku deployment, check:
- Heroku Dev Center: https://devcenter.heroku.com/
- Heroku Status: https://status.heroku.com/
