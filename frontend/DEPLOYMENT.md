# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update `.env.production` with production API URL
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Configure domain-specific environment variables
- [ ] Verify all required environment variables are set

### 2. Code Quality
- [ ] Run `npm run lint` and fix all issues
- [ ] Run `npm run type-check` and resolve TypeScript errors
- [ ] Test build with `npm run build:production`
- [ ] Verify all pages load correctly in production build

### 3. Security
- [ ] Review and update Content Security Policy
- [ ] Ensure HTTPS is enabled
- [ ] Configure secure headers
- [ ] Verify API endpoints use HTTPS
- [ ] Test authentication flows

### 4. Performance
- [ ] Optimize images and assets
- [ ] Test page load speeds
- [ ] Verify lazy loading works correctly
- [ ] Check bundle size with `npm run build:analyze`

### 5. SEO & Meta Tags
- [ ] Verify meta descriptions
- [ ] Check Open Graph tags
- [ ] Test social media previews
- [ ] Ensure proper canonical URLs

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

1. **Setup Cloudflare Pages**
   ```bash
   npx wrangler pages project create dominion-trust-capital
   ```

2. **Deploy to Cloudflare**
   ```bash
   npm run build:cloudflare
   npx wrangler pages deploy .next --project-name=dominion-trust-capital
   ```

3. **Configure Environment Variables**
   - Go to Cloudflare Pages dashboard
   - Set production environment variables
   - Redeploy after configuration

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   ```

### Option 3: Netlify

1. **Build for static export (if needed)**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### Option 4: Docker (Self-hosted)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build:production
   EXPOSE 3000
   CMD ["npm", "run", "start:production"]
   ```

2. **Build and Run**
   ```bash
   docker build -t dominion-trust-capital .
   docker run -p 3000:3000 dominion-trust-capital
   ```

## Post-Deployment Steps

### 1. Domain Configuration
- [ ] Configure DNS records
- [ ] Set up SSL certificate
- [ ] Configure CDN (if applicable)
- [ ] Test domain redirects

### 2. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring

### 3. Testing
- [ ] Test all critical user flows
- [ ] Verify mobile responsiveness
- [ ] Test cross-browser compatibility
- [ ] Check API integration

### 4. Security
- [ ] Run security audit
- [ ] Test HTTPS enforcement
- [ ] Verify CSP headers
- [ ] Check for exposed sensitive data

## Environment Variables Reference

### Required Production Variables
```env
NEXT_PUBLIC_API_URL=https://api.dominiontrustcapital.com
NEXT_PUBLIC_APP_URL=https://dominiontrustcapital.com
NEXT_PUBLIC_APP_DOMAIN=dominiontrustcapital.com
NODE_ENV=production
```

### Optional Variables
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SUPPORT_EMAIL=support@dominiontrustcapital.com
NEXT_PUBLIC_PHONE_NUMBER=+1 (800) DOMINION
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Fix ESLint issues: `npm run lint:fix`
   - Clear cache: `npm run clean`

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration on backend
   - Ensure API endpoints are accessible

3. **Performance Issues**
   - Analyze bundle size: `npm run build:analyze`
   - Optimize images and assets
   - Check for unnecessary dependencies

4. **Deployment Issues**
   - Verify build output in `.next` directory
   - Check environment variables are set
   - Review deployment logs

## Commands Reference

```bash
# Development
npm run dev

# Production build
npm run build:production

# Test production build locally
npm run preview

# Deploy to Cloudflare
npm run build:cloudflare
npx wrangler pages deploy .next

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Clean build files
npm run clean
```

## Support

For deployment issues, contact the development team or refer to:
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vercel Documentation](https://vercel.com/docs)
