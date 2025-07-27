#!/bin/bash

# Production Build Verification Script
# Checks if the production build is ready for deployment

echo "🔍 Verifying production build for Dominion Trust Capital..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo "⚠️  No build found. Running production build..."
    npm run build:production
fi

if [ ! -d ".next" ]; then
    echo "❌ Build failed: .next directory not created"
    exit 1
fi

echo "✅ Build directory found: .next"

# Check build size
BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
echo "📊 Build size: $BUILD_SIZE"

# Check for key files
echo "🔍 Checking build artifacts..."

if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "✅ Build ID: $BUILD_ID"
else
    echo "❌ Missing BUILD_ID file"
fi

if [ -d ".next/static" ]; then
    STATIC_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1)
    echo "✅ Static assets: $STATIC_SIZE"
else
    echo "❌ Missing static assets directory"
fi

if [ -f ".next/routes-manifest.json" ]; then
    ROUTES_COUNT=$(cat .next/routes-manifest.json | grep -o '"page":' | wc -l)
    echo "✅ Routes generated: $ROUTES_COUNT"
else
    echo "❌ Missing routes manifest"
fi

# Check environment variables
echo "🔧 Checking environment configuration..."

if [ -f ".env.production" ]; then
    echo "✅ Production environment file exists"
    API_URL=$(grep NEXT_PUBLIC_API_URL .env.production | cut -d'=' -f2)
    echo "🌐 API URL: $API_URL"
else
    echo "⚠️  No .env.production file found"
fi

# Check for required files
echo "📋 Checking required files..."

REQUIRED_FILES=(
    "next.config.ts"
    "wrangler.toml"
    "public/_headers"
    "public/_redirects"
    "deploy-production.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Check package.json scripts
echo "🔧 Checking package.json scripts..."
if grep -q "build:production" package.json; then
    echo "✅ build:production script found"
else
    echo "❌ Missing build:production script"
fi

if grep -q "deploy:cloudflare" package.json; then
    echo "✅ deploy:cloudflare script found"
else
    echo "❌ Missing deploy:cloudflare script"
fi

# Final verification
echo ""
echo "🎯 Production Readiness Summary:"
echo "================================"

if [ -d ".next" ] && [ -f ".env.production" ] && [ -f "wrangler.toml" ]; then
    echo "✅ READY FOR DEPLOYMENT"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy-production.sh"
    echo "2. Or push to main branch for auto-deployment"
    echo "3. Configure custom domain in Cloudflare Pages"
    echo ""
    echo "Deployment URL: https://dominion-trust-capital.pages.dev"
else
    echo "❌ NOT READY - Please fix the issues above"
    exit 1
fi
