#!/bin/bash

# Cloudflare Pages Build Cleanup Script
# This script ensures the build output stays under the 25 MiB file limit

echo "🧹 Cleaning up Cloudflare Pages build artifacts..."

# Navigate to frontend directory
cd frontend || exit 1

# Remove large cache files and build artifacts
echo "Removing webpack cache files..."
rm -rf .next/cache/
rm -rf cache/
rm -rf .next/trace/

echo "Removing large static files..."
# Remove source maps in production
find .next/static -name "*.map" -delete 2>/dev/null || true

# Remove any files larger than 20MB (to be safe under 25MB limit)
echo "Checking for files larger than 20MB..."
find .next -size +20M -exec rm -f {} \; 2>/dev/null || true

# Show build size summary
echo "📊 Build output size summary:"
if command -v du >/dev/null 2>&1; then
    du -sh .next/ 2>/dev/null || echo "Could not calculate size"
fi

echo "✅ Cleanup complete!"
