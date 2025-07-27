#!/bin/bash

# DominionTrust Bank - Cloudflare Pages Deploy Script
# This script builds and deploys the frontend to Cloudflare Pages

set -e  # Exit on any error

echo "🏦 DominionTrust Bank - Cloudflare Pages Deployment"
echo "=================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the frontend directory"
    echo "   Please run: cd frontend && ./deploy.sh"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building the application..."
npm run build

echo "📊 Build completed successfully!"
echo "   Output directory: ./out"
echo "   Total pages: $(find out -name "*.html" | wc -l)"

# Check if user wants to deploy
read -p "🚀 Deploy to Cloudflare Pages? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌍 Deploying to Cloudflare Pages..."
    
    # Check if user is logged in to Cloudflare
    if ! wrangler whoami &> /dev/null; then
        echo "🔐 Please login to Cloudflare first:"
        wrangler login
    fi
    
    # Deploy to Cloudflare Pages
    wrangler pages deploy out --project-name dominion-trust-bank --compatibility-date=2024-01-01
    
    echo "✅ Deployment completed!"
    echo "🔗 Your site should be available at: https://dominion-trust-bank.pages.dev"
else
    echo "📁 Build completed. You can manually deploy the 'out' directory to Cloudflare Pages."
    echo "   Or run: wrangler pages deploy out --project-name dominion-trust-bank"
fi

echo ""
echo "🎉 All done! Your DominionTrust Bank is ready for the world!"
