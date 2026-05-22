# Heroku Worker Deployment Script (PowerShell)
# This script automates the deployment of the Algolia sync worker to Heroku

$ErrorActionPreference = "Stop"

Write-Host "🚀 Heroku Worker Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Heroku CLI is installed
try {
    $null = heroku --version
    Write-Host "✅ Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
}

# Check if logged in to Heroku
try {
    $whoami = heroku auth:whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in to Heroku as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Heroku" -ForegroundColor Red
    Write-Host "Please run: heroku login"
    exit 1
}

Write-Host ""

# Prompt for app name
$APP_NAME = Read-Host "Enter your Heroku app name (or press Enter to create new)"

if ([string]::IsNullOrWhiteSpace($APP_NAME)) {
    Write-Host "Creating new Heroku app..." -ForegroundColor Yellow
    $createOutput = heroku create --json | ConvertFrom-Json
    $APP_NAME = $createOutput.name
    Write-Host "✅ Created app: $APP_NAME" -ForegroundColor Green
} else {
    # Check if app exists
    try {
        $null = heroku apps:info -a $APP_NAME 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Using existing app: $APP_NAME" -ForegroundColor Green
        } else {
            throw "App not found"
        }
    } catch {
        Write-Host "❌ App '$APP_NAME' not found" -ForegroundColor Red
        $CREATE_NEW = Read-Host "Create new app with this name? (y/n)"
        if ($CREATE_NEW -eq "y") {
            heroku create $APP_NAME
            Write-Host "✅ Created app: $APP_NAME" -ForegroundColor Green
        } else {
            exit 1
        }
    }
}

Write-Host ""
Write-Host "📝 Setting up environment variables..." -ForegroundColor Cyan
Write-Host "Please provide the following configuration:" -ForegroundColor Cyan
Write-Host ""

# Database URL
$DATABASE_URL = Read-Host "DATABASE_URL (PostgreSQL connection string)"
if (![string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    heroku config:set "DATABASE_URL=$DATABASE_URL" -a $APP_NAME
}

# Algolia App ID
$ALGOLIA_APP_ID = Read-Host "NEXT_PUBLIC_ALGOLIA_APP_ID"
if (![string]::IsNullOrWhiteSpace($ALGOLIA_APP_ID)) {
    heroku config:set "NEXT_PUBLIC_ALGOLIA_APP_ID=$ALGOLIA_APP_ID" -a $APP_NAME
}

# Algolia Search Key
$ALGOLIA_SEARCH_KEY = Read-Host "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY"
if (![string]::IsNullOrWhiteSpace($ALGOLIA_SEARCH_KEY)) {
    heroku config:set "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=$ALGOLIA_SEARCH_KEY" -a $APP_NAME
}

# Algolia Admin Key
$ALGOLIA_ADMIN_KEY = Read-Host "ALGOLIA_ADMIN_KEY"
if (![string]::IsNullOrWhiteSpace($ALGOLIA_ADMIN_KEY)) {
    heroku config:set "ALGOLIA_ADMIN_KEY=$ALGOLIA_ADMIN_KEY" -a $APP_NAME
}

# Algolia Index Name
$ALGOLIA_INDEX_NAME = Read-Host "NEXT_PUBLIC_ALGOLIA_INDEX_NAME (default: wovn_products_local)"
if ([string]::IsNullOrWhiteSpace($ALGOLIA_INDEX_NAME)) {
    $ALGOLIA_INDEX_NAME = "wovn_products_local"
}
heroku config:set "NEXT_PUBLIC_ALGOLIA_INDEX_NAME=$ALGOLIA_INDEX_NAME" -a $APP_NAME

Write-Host ""
Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "📦 Deploying to Heroku..." -ForegroundColor Cyan
$DEPLOY_NOW = Read-Host "Deploy now? (y/n)"

if ($DEPLOY_NOW -eq "y") {
    # Check if git remote exists
    $remotes = git remote
    if ($remotes -notcontains "heroku") {
        heroku git:remote -a $APP_NAME
        Write-Host "✅ Added Heroku remote" -ForegroundColor Green
    }

    # Get current branch
    $CURRENT_BRANCH = git rev-parse --abbrev-ref HEAD
    Write-Host "Deploying from branch: $CURRENT_BRANCH" -ForegroundColor Yellow
    
    # Push to Heroku
    git push heroku "${CURRENT_BRANCH}:main"
    
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    
    # Scale worker
    Write-Host "🔧 Scaling worker dyno..." -ForegroundColor Cyan
    $SCALE_WORKER = Read-Host "Scale worker to 1 instance? (y/n)"
    
    if ($SCALE_WORKER -eq "y") {
        heroku ps:scale worker=1 -a $APP_NAME
        Write-Host "✅ Worker scaled to 1 instance" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📊 Current dyno status:" -ForegroundColor Cyan
    heroku ps -a $APP_NAME
    
    Write-Host ""
    Write-Host "📝 View worker logs:" -ForegroundColor Cyan
    Write-Host "   heroku logs --tail --dyno worker -a $APP_NAME" -ForegroundColor Yellow
    Write-Host ""
    
    $VIEW_LOGS = Read-Host "View logs now? (y/n)"
    if ($VIEW_LOGS -eq "y") {
        heroku logs --tail --dyno worker -a $APP_NAME
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Skipped deployment" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy manually, run:"
    Write-Host "   git push heroku main"
    Write-Host "   heroku ps:scale worker=1 -a $APP_NAME"
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:     heroku logs --tail --dyno worker -a $APP_NAME" -ForegroundColor Yellow
Write-Host "  Check status:  heroku ps -a $APP_NAME" -ForegroundColor Yellow
Write-Host "  Restart:       heroku restart worker -a $APP_NAME" -ForegroundColor Yellow
Write-Host "  Stop worker:   heroku ps:scale worker=0 -a $APP_NAME" -ForegroundColor Yellow
Write-Host "  Start worker:  heroku ps:scale worker=1 -a $APP_NAME" -ForegroundColor Yellow
Write-Host ""
