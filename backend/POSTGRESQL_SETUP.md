# PostgreSQL Setup Guide for Dominion Trust Bank

## Overview
This guide will help you set up PostgreSQL for the Dominion Trust Bank backend, replacing the previous MySQL configuration.

## Prerequisites
- Python 3.11+ installed
- Git installed
- Terminal/Command line access

## 1. Install PostgreSQL

### macOS (using Homebrew)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib python3-dev libpq-dev
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

## 2. Create Database and User

### Access PostgreSQL
```bash
# macOS/Linux
sudo -u postgres psql

# Or if you installed via Homebrew on macOS
psql postgres
```

### Create Database and User
```sql
-- Create database
CREATE DATABASE dominion_trust_bank;

-- Create user (replace 'yourpassword' with a secure password)
CREATE USER dominion_user WITH PASSWORD 'yourpassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dominion_trust_bank TO dominion_user;

-- Grant schema privileges (PostgreSQL 15+)
\c dominion_trust_bank
GRANT ALL ON SCHEMA public TO dominion_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dominion_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dominion_user;

-- Exit PostgreSQL
\q
```

## 3. Update Django Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.development .env
```

Update the `.env` file with your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://dominion_user:yourpassword@localhost:5432/dominion_trust_bank
```

### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

The `psycopg2-binary` package is already included in requirements.txt for PostgreSQL support.

## 4. Run Migrations

```bash
# Navigate to backend directory
cd backend

# Run migrations to create database tables
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

## 5. Test the Setup

```bash
# Run the development server
python manage.py runserver

# In another terminal, test database connection
python manage.py shell
```

In the Django shell:
```python
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT version();")
print(cursor.fetchone())
```

## 6. Production Configuration

For production deployment, your `.env.production` file is already configured with PostgreSQL:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/dominion_trust_bank
```

### PythonAnywhere Configuration
If deploying to PythonAnywhere:
1. Create a PostgreSQL database in your PythonAnywhere dashboard
2. Update the DATABASE_URL with the provided credentials
3. The production requirements already include `psycopg2-binary`

## 7. Common Commands

### Backup Database
```bash
pg_dump -U dominion_user -h localhost dominion_trust_bank > backup.sql
```

### Restore Database
```bash
psql -U dominion_user -h localhost dominion_trust_bank < backup.sql
```

### Connect to Database
```bash
psql -U dominion_user -h localhost dominion_trust_bank
```

## 8. Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check if the database and user exist
- Verify credentials in `.env` file
- Check PostgreSQL logs for detailed error messages

### Permission Issues
```sql
-- If you get permission errors, grant additional privileges
\c dominion_trust_bank
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dominion_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dominion_user;
```

### Port Issues
- Default PostgreSQL port is 5432
- Check if port is open: `netstat -an | grep 5432`
- Ensure no firewall blocking the connection

## 9. Performance Optimization

### PostgreSQL Configuration
For production, consider optimizing PostgreSQL settings in `postgresql.conf`:
```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Django Settings
The current Django configuration uses `dj-database-url` which automatically handles connection pooling and optimization.

## 10. Migration from SQLite/MySQL

If you have existing data in SQLite or MySQL:

### Export Data
```bash
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > datadump.json
```

### Import to PostgreSQL
```bash
python manage.py loaddata datadump.json
```

## Security Notes
- Use strong passwords for database users
- Limit database user privileges to only what's needed
- Use SSL connections in production
- Regular database backups
- Monitor database access logs

Your Django backend is now configured to use PostgreSQL! The existing code will work without changes since Django's ORM handles database differences transparently.
