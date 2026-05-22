#!/bin/bash

# Heroku Worker Deployment Script
# This script automates the deployment of the Algolia sync worker to Heroku

set -e  # Exit on error

echo "🚀 Heroku Worker Deployment Script"
echo "===================================="
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed."
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku"
    echo "Please run: heroku login"
    exit 1
fi

echo "✅ Logged in to Heroku as: $(heroku auth:whoami)"
echo ""

# Prompt for app name
read -p "Enter your Heroku app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "Creating new Heroku app..."
    APP_NAME=$(heroku create --json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo "✅ Created app: $APP_NAME"
else
    # Check if app exists
    if heroku apps:info -a "$APP_NAME" &> /dev/null; then
        echo "✅ Using existing app: $APP_NAME"
    else
        echo "❌ App '$APP_NAME' not found"
        read -p "Create new app with this name? (y/n): " CREATE_NEW
        if [ "$CREATE_NEW" = "y" ]; then
            heroku create "$APP_NAME"
            echo "✅ Created app: $APP_NAME"
        else
            exit 1
        fi
    fi
fi

echo ""
echo "📝 Setting up environment variables..."
echo "Please provide the following configuration:"
echo ""

# Database URL
read -p "DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
    heroku config:set DATABASE_URL="$DATABASE_URL" -a "$APP_NAME"
fi

# Algolia App ID
read -p "NEXT_PUBLIC_ALGOLIA_APP_ID: " ALGOLIA_APP_ID
if [ ! -z "$ALGOLIA_APP_ID" ]; then
    heroku config:set NEXT_PUBLIC_ALGOLIA_APP_ID="$ALGOLIA_APP_ID" -a "$APP_NAME"
fi

# Algolia Search Key
read -p "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: " ALGOLIA_SEARCH_KEY
if [ ! -z "$ALGOLIA_SEARCH_KEY" ]; then
    heroku config:set NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="$ALGOLIA_SEARCH_KEY" -a "$APP_NAME"
fi

# Algolia Admin Key
read -p "ALGOLIA_ADMIN_KEY: " ALGOLIA_ADMIN_KEY
if [ ! -z "$ALGOLIA_ADMIN_KEY" ]; then
    heroku config:set ALGOLIA_ADMIN_KEY="$ALGOLIA_ADMIN_KEY" -a "$APP_NAME"
fi

# Algolia Index Name
read -p "NEXT_PUBLIC_ALGOLIA_INDEX_NAME (default: wovn_products_local): " ALGOLIA_INDEX_NAME
ALGOLIA_INDEX_NAME=${ALGOLIA_INDEX_NAME:-wovn_products_local}
heroku config:set NEXT_PUBLIC_ALGOLIA_INDEX_NAME="$ALGOLIA_INDEX_NAME" -a "$APP_NAME"

echo ""
echo "✅ Environment variables configured"
echo ""

# Deploy
echo "📦 Deploying to Heroku..."
read -p "Deploy now? (y/n): " DEPLOY_NOW

if [ "$DEPLOY_NOW" = "y" ]; then
    # Check if git remote exists
    if ! git remote | grep -q "^heroku$"; then
        heroku git:remote -a "$APP_NAME"
        echo "✅ Added Heroku remote"
    fi

    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Deploying from branch: $CURRENT_BRANCH"
    
    # Push to Heroku
    git push heroku "$CURRENT_BRANCH:main"
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    
    # Scale worker
    echo "🔧 Scaling worker dyno..."
    read -p "Scale worker to 1 instance? (y/n): " SCALE_WORKER
    
    if [ "$SCALE_WORKER" = "y" ]; then
        heroku ps:scale worker=1 -a "$APP_NAME"
        echo "✅ Worker scaled to 1 instance"
    fi
    
    echo ""
    echo "📊 Current dyno status:"
    heroku ps -a "$APP_NAME"
    
    echo ""
    echo "📝 View worker logs:"
    echo "   heroku logs --tail --dyno worker -a $APP_NAME"
    echo ""
    
    read -p "View logs now? (y/n): " VIEW_LOGS
    if [ "$VIEW_LOGS" = "y" ]; then
        heroku logs --tail --dyno worker -a "$APP_NAME"
    fi
else
    echo ""
    echo "⏭️  Skipped deployment"
    echo ""
    echo "To deploy manually, run:"
    echo "   git push heroku main"
    echo "   heroku ps:scale worker=1 -a $APP_NAME"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Useful commands:"
echo "  View logs:     heroku logs --tail --dyno worker -a $APP_NAME"
echo "  Check status:  heroku ps -a $APP_NAME"
echo "  Restart:       heroku restart worker -a $APP_NAME"
echo "  Stop worker:   heroku ps:scale worker=0 -a $APP_NAME"
echo "  Start worker:  heroku ps:scale worker=1 -a $APP_NAME"
echo ""
