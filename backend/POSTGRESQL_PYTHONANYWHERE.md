# 🐘 PostgreSQL Configuration for PythonAnywhere

## Important Note about Database Choice

Your Django backend is now configured to use **PostgreSQL** instead of MySQL. However, there are some important considerations for PythonAnywhere deployment:

## Database Options on PythonAnywhere

### Option 1: External PostgreSQL (Recommended for Production)
Since PythonAnywhere's free tier only supports MySQL, for PostgreSQL you'll need to use an external service:

**Recommended PostgreSQL Services:**
- **Supabase** (Free tier: 500MB, great for development)
- **ElephantSQL** (Free tier: 20MB)
- **AWS RDS** (Pay-as-you-go)
- **Google Cloud SQL** (Pay-as-you-go)
- **DigitalOcean Managed Databases** (Starting at $15/month)

#### Setting up with Supabase (Free):
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database
4. Update your `.env.production`:
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Option 2: Use MySQL on PythonAnywhere
If you prefer to stick with PythonAnywhere's included MySQL:

1. **Update requirements_production.txt:**
```txt
# Replace psycopg2-binary with:
mysqlclient==2.2.0
```

2. **Update .env.production:**
```env
DATABASE_URL=mysql://yourusername:your_mysql_password@yourusername.mysql.pythonanywhere-services.com/yourusername$dominiontrustcapital
```

3. **Your Django settings.py already supports both databases**, so no code changes needed!

## Current Configuration Status

✅ **Your backend is ready for PostgreSQL**
- `psycopg2-binary` installed for PostgreSQL support
- `dj-database-url` handles connection parsing
- Django settings support both PostgreSQL and MySQL

## Development vs Production

**For Development (Local):**
- Use PostgreSQL locally (see POSTGRESQL_SETUP.md)
- DATABASE_URL: `postgresql://dominion_user:password@localhost:5432/dominion_trust_bank`

**For Production:**
- **Option A:** External PostgreSQL service (Supabase, AWS RDS, etc.)
- **Option B:** PythonAnywhere MySQL (requires changing requirements.txt)

## Recommended Approach

1. **Development:** PostgreSQL locally
2. **Production:** Supabase PostgreSQL (free tier)
3. **Alternative:** PythonAnywhere MySQL if you prefer simplicity

## Migration Script

If you decide to switch between PostgreSQL and MySQL, use Django's built-in data migration:

```bash
# Export data
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > data_backup.json

# Switch database, run migrations
python manage.py migrate

# Import data
python manage.py loaddata data_backup.json
```

Your backend is production-ready with either database choice!
