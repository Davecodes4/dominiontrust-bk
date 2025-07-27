# DominionTrust Bank - Cloudflare Pages Deployment Guide

This guide will help you deploy the DominionTrust Bank frontend to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [https://cloudflare.com](https://cloudflare.com)
2. **Git Repository**: Your code should be pushed to GitHub, GitLab, or Bitbucket
3. **Node.js 18+**: Ensure you have Node.js 18 or higher installed locally

## Build Configuration

The project is already configured for Cloudflare Pages deployment with:

- ✅ Static export enabled (`output: 'export'`)
- ✅ Image optimization disabled for static export
- ✅ ESLint and TypeScript errors ignored during build
- ✅ Custom headers and redirects configured
- ✅ GitHub Actions workflow ready

## Manual Deployment Steps

### Method 1: Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" from the sidebar

2. **Create New Project**
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Cloudflare to access your repositories

3. **Configure Build Settings**
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: npm run build
   Build output directory: out
   Root directory: frontend
   Node.js version: 18
   ```

4. **Environment Variables** (if needed)
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete

### Method 2: Using Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy from project directory**
   ```bash
   cd frontend
   npm run build
   wrangler pages deploy out --project-name dominion-trust-bank
   ```

## GitHub Actions Deployment (Automatic)

The repository includes a GitHub Actions workflow for automatic deployment.

### Setup Steps:

1. **Get Cloudflare API Token**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Cloudflare Pages:Edit" permissions

2. **Get Account ID**
   - Go to Cloudflare Dashboard → Right sidebar → Account ID

3. **Add GitHub Secrets**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     CLOUDFLARE_API_TOKEN=your_api_token_here
     CLOUDFLARE_ACCOUNT_ID=your_account_id_here
     ```

4. **Push to main branch**
   - Any push to the `main` branch will trigger automatic deployment

## Custom Domain Setup

1. **Add Custom Domain in Cloudflare Pages**
   - Go to your Pages project → Custom domains
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `dominiontrust.com`)

2. **Update DNS Settings**
   - Add CNAME record pointing to your Pages URL
   - Or transfer your domain to Cloudflare for automatic DNS

## Production Environment Variables

Set these in Cloudflare Pages → Settings → Environment variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_APP_NAME=DominionTrust Bank
```

## Build Optimization

The project is optimized for Cloudflare Pages with:

- **Static Generation**: All pages are pre-rendered
- **Asset Optimization**: Images and fonts are optimized
- **Cache Headers**: Proper caching for static assets
- **Security Headers**: CSP, XSS protection, etc.

## Monitoring and Analytics

1. **Enable Analytics**
   - Go to Cloudflare Pages → Analytics
   - Enable Web Analytics for visitor insights

2. **Set up Alerts**
   - Configure deployment notifications
   - Monitor build failures

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for syntax errors

2. **Dynamic Routes**
   - Dynamic routes require `generateStaticParams`
   - Or use client-side routing for dynamic content

3. **API Calls**
   - Ensure CORS is configured on your backend
   - Use absolute URLs for API calls in production

### Debug Commands:

```bash
# Test build locally
npm run build

# Check output directory
ls -la out/

# Test locally with static server
npx serve out
```

## Performance Tips

1. **Enable Cloudflare Optimization**
   - Auto Minify (CSS, JS, HTML)
   - Brotli compression
   - Image optimization

2. **Use Cloudflare CDN**
   - Static assets are automatically cached globally
   - Near-instant loading worldwide

3. **Monitor Core Web Vitals**
   - Use Cloudflare Analytics
   - Optimize based on real user metrics

## Security

The deployment includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- X-XSS-Protection: 1; mode=block
- CSP policies for enhanced security

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Cloudflare Community](https://community.cloudflare.com/)

---

**Note**: Make sure your backend API supports CORS and is accessible from your Cloudflare Pages domain.
