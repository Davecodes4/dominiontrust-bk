# Production Deployment Guide - Dominion Trust Capital

This guide covers deploying the Dominion Trust Capital frontend to production using Cloudflare Pages.

## 🏗️ Production Setup Complete

The frontend has been configured for production deployment with:

- ✅ Environment variables configured
- ✅ Production build optimization
- ✅ Cloudflare Pages configuration
- ✅ GitHub Actions workflow
- ✅ Security headers and caching
- ✅ Custom domain ready

## 📁 Project Structure

```
frontend/
├── .env.production          # Production environment variables
├── .env.local              # Development environment variables
├── .env.example            # Environment template
├── next.config.ts          # Next.js configuration
├── wrangler.toml           # Cloudflare Pages configuration
├── deploy-production.sh    # Manual deployment script
└── public/
    ├── _headers            # Security headers
    └── _redirects          # URL redirects and routing
```

## 🚀 Deployment Options

### Option 1: GitHub Actions (Recommended)

**Automatic deployment on every push to main branch**

1. **Set up GitHub Secrets:**
   ```
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   ```

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment in GitHub Actions tab**

### Option 2: Manual Deployment

**Using the deployment script:**

```bash
cd frontend
./deploy-production.sh
```

**Or step by step:**

```bash
cd frontend
npm ci
npm run build:production
wrangler pages deploy .next --project-name dominion-trust-capital
```

### Option 3: Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create new project → Connect to Git
3. Select your repository
4. Configure build settings:
   ```
   Framework: Next.js
   Build command: npm run build:production
   Build output: .next
   Root directory: frontend
   Node.js version: 18
   ```

## 🌐 Environment Variables

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.dominiontrustcapital.com
NEXT_PUBLIC_APP_NAME="Dominion Trust Capital"
NEXT_PUBLIC_ENVIRONMENT="production"
NEXT_PUBLIC_COMPANY_NAME="Dominion Trust Capital"
NEXT_PUBLIC_COMPANY_EMAIL="support@dominiontrustcapital.com"
NEXT_PUBLIC_COMPANY_PHONE="+1 (800) DOMINION"
NEXT_PUBLIC_COMPANY_DOMAIN="dominiontrustcapital.com"
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT="development"
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 🛡️ Security Features

- **Security Headers**: CSP, HSTS, X-Frame-Options
- **HTTPS Enforcement**: Automatic redirect to HTTPS
- **Asset Caching**: Optimized cache headers
- **API Proxy**: Secure API communication

## 🌍 Custom Domain Setup

1. **Add domain in Cloudflare Pages:**
   - Go to your project → Custom domains
   - Add `dominiontrustcapital.com`
   - Follow DNS setup instructions

2. **Update environment variables:**
   ```env
   NEXT_PUBLIC_COMPANY_DOMAIN="dominiontrustcapital.com"
   ```

3. **Update backend CORS settings** to include your domain

## 📊 Performance Optimization

- **Image Optimization**: Disabled for static compatibility
- **Code Splitting**: Automatic with Next.js
- **Caching**: 1 year for static assets, 5 minutes for API
- **Compression**: Automatic with Cloudflare

## 🔍 Monitoring & Analytics

### Build Information
- **Framework**: Next.js 15.3.5
- **Build Time**: ~5-8 seconds
- **Bundle Size**: ~150kB average per page
- **Static Pages**: 31 pages pre-rendered

### Deployment Status
- **Production URL**: `https://dominion-trust-capital.pages.dev`
- **Custom Domain**: `dominiontrustcapital.com` (when configured)
- **SSL Certificate**: Automatic via Cloudflare

## 🐛 Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build:production
```

### Environment Issues
```bash
# Check environment variables
npm run build:production 2>&1 | grep NEXT_PUBLIC
```

### Deployment Issues
```bash
# Check Wrangler authentication
wrangler whoami

# Manual deployment with verbose output
wrangler pages deploy .next --project-name dominion-trust-capital --verbose
```

## 📝 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Backend API URL updated
- [ ] CORS settings updated on backend
- [ ] SSL certificate configured
- [ ] Custom domain DNS configured (if applicable)
- [ ] Analytics/monitoring configured
- [ ] Performance testing completed

## 🔄 Continuous Deployment

The project is configured for continuous deployment:

1. **Development**: Push to `develop` branch → Preview deployment
2. **Staging**: Push to `staging` branch → Staging environment
3. **Production**: Push to `main` branch → Production deployment

## 📞 Support

For deployment issues, contact:
- **Technical Support**: support@dominiontrustcapital.com
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check Cloudflare Pages documentation

---

**Last Updated**: July 27, 2025
**Version**: 1.0.0
**Environment**: Production Ready ✅
