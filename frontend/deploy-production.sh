#!/bin/bash

# Production Deployment Script for Dominion Trust Capital
# This script builds and deploys the frontend to Cloudflare Pages

set -e  # Exit on any error

echo "🏗️  Starting production build for Dominion Trust Capital..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "🔧 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Check if user is logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please login to Cloudflare first:"
    wrangler login
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Set production environment
export NODE_ENV=production

# Build the application
echo "🏗️  Building application for production..."
npm run build:production

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Build failed: '.next' directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Output directory: $(pwd)/.next"
echo "📊 Build size:"
du -sh .next

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy .next --project-name dominion-trust-capital --compatibility-date=2024-01-01

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application should be available at: https://dominion-trust-capital.pages.dev"
echo ""
echo "💡 To set up a custom domain:"
echo "   1. Go to Cloudflare Dashboard > Pages > dominion-trust-capital"
echo "   2. Click on 'Custom domains' tab"
echo "   3. Add your domain (e.g., dominiontrustcapital.com)"
echo ""
echo "📝 Don't forget to update your backend CORS settings to include your domain!"
