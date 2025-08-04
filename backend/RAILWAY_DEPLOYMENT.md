# DominionTrust Bank Backend - Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with backend code
- PostgreSQL database (Railway provides this)

## 📋 Deployment Steps

### 1. Connect to Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select the `DominionTrust_Bank` repository

### 2. Configure Environment Variables
Add these environment variables in Railway dashboard:

#### Required Variables:
```bash
SECRET_KEY=your-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app,localhost,127.0.0.1
DATABASE_URL=postgresql://... (Railway auto-provides this)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
CORS_ALLOW_ALL_ORIGINS=False
```

#### Email Configuration:
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@dominiontrustcapital.com
```

#### SMS Configuration:
```bash
TEXTBELT_API_KEY=your-textbelt-api-key
TEXTBELT_API_URL=https://textbelt.com/text
```

#### Optional (Create Admin User):
```bash
CREATE_SUPERUSER=True
SUPERUSER_PASSWORD=your-admin-password
```

### 3. Configure Build Settings
- **Root Directory**: `backend`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn dominion_bank.wsgi --log-file -`

### 4. Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically connect it to your app
4. The `DATABASE_URL` will be automatically set

### 5. Deploy
1. Railway will automatically detect the Python app
2. It will run the build script
3. The app will be deployed and available at your Railway URL

## 🔧 Configuration Files

### Procfile
```
web: gunicorn dominion_bank.wsgi --log-file -
```

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn dominion_bank.wsgi --log-file -",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### build.sh
- Installs dependencies
- Runs database migrations
- Collects static files
- Creates superuser (if configured)

## 🌐 API Endpoints

Once deployed, your API will be available at:
- **Base URL**: `https://your-app-name.railway.app`
- **Admin Panel**: `https://your-app-name.railway.app/admin`
- **API Root**: `https://your-app-name.railway.app/api/`

## 📊 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic health monitoring
- **Rollbacks**: Easy deployment rollbacks

## 🔒 Security Notes

1. **Never commit sensitive data** to your repository
2. **Use strong SECRET_KEY** for production
3. **Set DEBUG=False** in production
4. **Configure CORS properly** for your frontend domain
5. **Use HTTPS** (Railway provides this automatically)

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**: Check logs for missing dependencies
2. **Database Connection**: Verify DATABASE_URL is set
3. **Static Files**: Ensure build.sh is executable
4. **CORS Errors**: Check CORS_ALLOWED_ORIGINS configuration

### Useful Commands:
```bash
# View logs
railway logs

# Connect to database
railway connect

# Run Django commands
railway run python manage.py shell
```

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Verify environment variables
3. Test locally with production settings
4. Contact Railway support if needed 