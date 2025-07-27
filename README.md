# Dominion Trust Bank - Professional Banking System

A comprehensive banking application built with Next.js (frontend) and Django (backend), featuring professional banking operations, KYC compliance, and modern user experience.

## 🏦 Features

### Customer Management
- **Enhanced User Registration** with comprehensive KYC
- **Multi-level Customer Tiers** (Standard, Premium, VIP, Corporate)
- **Identity Verification** with document management
- **Employment Information** tracking
- **Emergency Contacts** management

### Account Management
- **Multiple Account Types** (Savings, Current, Fixed Deposit, Foreign Currency, Joint, Corporate)
- **Multi-currency Support** (USD, EUR, GBP)
- **Account Beneficiaries** management
- **Overdraft Facilities** configuration
- **Transaction Limits** by tier and account type

### Banking Operations
- **Fund Transfers** (Internal, Domestic, International)
- **Deposits & Withdrawals** with multiple channels
- **Scheduled Transfers** for future transactions
- **Transaction History** with comprehensive filtering
- **Real-time Balance** tracking with available/hold balances

### Card Management
- **Debit/Credit/Prepaid Cards** issuance
- **Multiple Card Brands** (Visa, Mastercard, Verve)
- **Card Controls** (limits, international transactions, online payments)
- **Contactless Payments** support
- **Card Security** management

### Security & Compliance
- **KYC (Know Your Customer)** workflows
- **AML (Anti-Money Laundering)** screening
- **PEP (Politically Exposed Person)** checks
- **Security Questions** for additional authentication
- **Login History** tracking
- **Risk Assessment** profiles

### Notifications & Statements
- **Real-time Notifications** (Email, SMS, Push, In-app)
- **Transaction Alerts** with customizable triggers
- **Account Statements** (Monthly, Quarterly, Annual, Custom)
- **Multi-channel Delivery** options

### Analytics & Reporting
- **Spending Analytics** with categorization
- **Monthly Summaries** and trends
- **Transaction Patterns** analysis
- **Account Performance** metrics

## 🚀 Technology Stack

### Backend (Django)
- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **Django CORS Headers** - Cross-origin requests
- **Python Decouple** - Environment configuration
- **PostgreSQL** - Database (SQLite for development)

### Frontend (Next.js)
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **ESLint** - Code linting

## 📁 Project Structure

```
DominionTrust_Bank/
├── backend/
│   ├── dominion_bank/          # Django project settings
│   ├── accounts/               # User management & authentication
│   │   ├── models.py          # User profiles, bank accounts, beneficiaries
│   │   ├── serializers.py     # API serializers
│   │   ├── views.py           # API views
│   │   └── admin.py           # Admin interface
│   ├── banking/                # Banking operations
│   │   ├── models.py          # Transactions, cards, statements
│   │   ├── serializers.py     # Banking API serializers
│   │   ├── views.py           # Banking API views
│   │   └── admin.py           # Banking admin interface
│   ├── requirements.txt        # Python dependencies
│   └── manage.py              # Django management script
└── frontend/
    ├── src/
    │   ├── app/               # Next.js app directory
    │   └── components/        # React components
    ├── package.json           # Node.js dependencies
    └── tailwind.config.js     # Tailwind configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database (Optional - SQLite by default)
DATABASE_URL=postgres://user:password@localhost:5432/dominion_bank

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Banking Configuration
ACCOUNT_NUMBER_LENGTH=10
TRANSACTION_REFERENCE_LENGTH=12
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Account Management
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/kyc/update/` - Update KYC information
- `GET /api/auth/accounts/` - List bank accounts
- `POST /api/auth/accounts/` - Create new account

### Banking Operations
- `POST /api/banking/transfer/` - Transfer funds
- `POST /api/banking/deposit/` - Deposit funds
- `POST /api/banking/withdraw/` - Withdraw funds
- `GET /api/banking/transactions/` - List transactions

### Cards
- `GET /api/banking/cards/` - List cards
- `POST /api/banking/cards/` - Request new card
- `PUT /api/banking/cards/{id}/` - Update card settings

## 🔐 Security Features

### Authentication & Authorization
- Token-based authentication
- Role-based access control
- Session management with logout tracking

### Data Protection
- Password hashing with Django's built-in system
- Sensitive data encryption
- Secure API endpoints

### Compliance
- KYC verification workflows
- AML screening integration
- Audit trails for all transactions
- PEP status monitoring

## 📊 Admin Interface

Access the Django admin at `http://localhost:8000/admin/` with comprehensive management for:

- **User Management** - Complete customer profiles with KYC status
- **Account Administration** - Bank accounts with balances and limits
- **Transaction Monitoring** - All banking operations with audit trails
- **Card Management** - Card issuance and controls
- **Compliance Tracking** - KYC, AML, and risk assessments

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Deployment

### Production Environment

#### Backend (PythonAnywhere)
The backend is configured for production deployment on PythonAnywhere:

```bash
cd backend
./deploy_pythonanywhere.sh
```

**Production Features:**
- MySQL database with connection pooling
- SSL/HTTPS enforcement
- Security headers (HSTS, CSP, X-Frame-Options)
- Production logging and monitoring
- Email notifications via SMTP
- Static file serving optimization

**Environment Configuration:**
- Production settings in `settings_production.py`
- WSGI configuration in `wsgi_production.py`
- Environment variables in `.env.production`

#### Frontend (Cloudflare Pages)
The frontend is optimized for Cloudflare Pages deployment:

```bash
cd frontend
./deploy-production.sh
```

**Production Features:**
- Global CDN with edge caching
- Automatic HTTPS with SSL certificates
- Performance optimization and compression
- Environment-based configuration
- Progressive Web App (PWA) support

**Build Configuration:**
- Next.js production build in `.next/` directory
- Wrangler configuration for Cloudflare Pages
- Environment variables in `.env.production`

### Automated Deployment (GitHub Actions)

The project includes CI/CD pipeline with GitHub Actions:

```yaml
# Automatic deployment on push to main branch
- Frontend → Cloudflare Pages (automatic)
- Backend → Manual deployment guide for PythonAnywhere
```

### Manual Deployment Steps

1. **Initialize Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository:**
   - Create new repository on GitHub
   - Add remote: `git remote add origin https://github.com/yourusername/dominion-trust-bank.git`
   - Push: `git push -u origin main`

3. **Configure Cloudflare Pages:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Add environment variables from `.env.production`

4. **Deploy Backend to PythonAnywhere:**
   - Upload code to PythonAnywhere
   - Configure MySQL database
   - Set up WSGI application
   - Run deployment script: `./deploy_pythonanywhere.sh`

### Environment Variables

#### Production Backend (.env.production)
```env
SECRET_KEY=production-secret-key
DEBUG=False
DATABASE_URL=mysql://username:password@hostname/database
ALLOWED_HOSTS=yourdomain.pythonanywhere.com
EMAIL_HOST_USER=your-email@domain.com
TWILIO_ACCOUNT_SID=your-twilio-sid
```

#### Production Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.pythonanywhere.com
NEXT_PUBLIC_APP_NAME=Dominion Trust Capital
NEXT_PUBLIC_COMPANY_EMAIL=support@dominiontrustcapital.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if necessary
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

## 🚀 Future Enhancements

- Mobile application (React Native)
- Loan management system
- Investment portfolio tracking
- Cryptocurrency wallet integration
- AI-powered fraud detection
- Advanced analytics dashboard
- Multi-language support
- Biometric authentication 