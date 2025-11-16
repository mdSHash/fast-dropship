# Environment Configuration Guide

This guide explains how to properly configure environment variables for the Fast-Dropship application.

## Table of Contents
1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Generating Secure Keys](#generating-secure-keys)
4. [Security Best Practices](#security-best-practices)
5. [Production Deployment](#production-deployment)

---

## Backend Environment Variables

### Location
Create a `.env` file in the `backend/` directory.

### Required Variables

```bash
# Database Configuration
DATABASE_URL=sqlite:///./fastdropship.db

# Security Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Variable Descriptions

#### DATABASE_URL
- **Purpose**: Database connection string
- **Development**: `sqlite:///./fastdropship.db` (SQLite)
- **Production**: `postgresql://user:password@host:port/database` (PostgreSQL recommended)
- **Example**: `postgresql://admin:securepass@localhost:5432/fastdropship`

#### SECRET_KEY
- **Purpose**: Used for JWT token signing and encryption
- **CRITICAL**: Must be changed in production
- **Requirements**: 
  - Minimum 32 characters
  - Random and unpredictable
  - Never commit to version control
  - Different for each environment

#### ALGORITHM
- **Purpose**: JWT signing algorithm
- **Default**: `HS256`
- **Options**: `HS256`, `HS384`, `HS512`
- **Recommendation**: Keep as `HS256` unless you have specific requirements

#### ACCESS_TOKEN_EXPIRE_MINUTES
- **Purpose**: JWT token expiration time
- **Default**: `30` minutes
- **Development**: `30-60` minutes
- **Production**: `15-30` minutes (shorter is more secure)

#### ALLOWED_ORIGINS
- **Purpose**: CORS allowed origins
- **Format**: Comma-separated list of URLs
- **Development**: `http://localhost:3000,http://127.0.0.1:3000`
- **Production**: Your actual frontend URL(s)
- **Example**: `https://yourdomain.com,https://www.yourdomain.com`

---

## Frontend Environment Variables

### Location
Create a `.env.local` file in the `frontend/` directory.

### Required Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Variable Descriptions

#### NEXT_PUBLIC_API_URL
- **Purpose**: Backend API base URL
- **Development**: `http://localhost:8000`
- **Production**: Your deployed backend URL
- **Example**: `https://api.yourdomain.com`
- **Note**: Must start with `NEXT_PUBLIC_` to be accessible in the browser

---

## Generating Secure Keys

### Method 1: Using Python (Recommended)

```python
# Run this in Python terminal or save as generate_key.py
import secrets

# Generate a secure random key
secret_key = secrets.token_urlsafe(32)
print(f"SECRET_KEY={secret_key}")
```

**Run it:**
```bash
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
```

### Method 2: Using OpenSSL

```bash
openssl rand -base64 32
```

### Method 3: Using Node.js

```javascript
// Run this in Node.js terminal
const crypto = require('crypto');
console.log('SECRET_KEY=' + crypto.randomBytes(32).toString('base64'));
```

### Method 4: Online Generator (Use with Caution)

Only use trusted sources and regenerate keys before production:
- https://randomkeygen.com/ (Fort Knox Passwords section)
- Generate locally when possible

---

## Security Best Practices

### 1. Never Commit Secrets

**Add to `.gitignore`:**
```
.env
.env.local
.env.production
*.db
```

### 2. Use Different Keys Per Environment

```bash
# Development
SECRET_KEY=dev_key_12345...

# Staging
SECRET_KEY=staging_key_67890...

# Production
SECRET_KEY=prod_key_abcdef...
```

### 3. Rotate Keys Regularly

- **Development**: Every few months
- **Production**: Every 3-6 months or after security incidents
- **Process**:
  1. Generate new key
  2. Update environment variable
  3. Restart application
  4. All users will need to re-login

### 4. Store Secrets Securely

**Development:**
- Use `.env` files (not committed)
- Use environment variable managers

**Production:**
- Use secret management services:
  - AWS Secrets Manager
  - Google Cloud Secret Manager
  - Azure Key Vault
  - HashiCorp Vault
- Use platform environment variables:
  - Vercel Environment Variables
  - Railway Environment Variables
  - Render Environment Variables

### 5. Limit Access

- Only give production keys to necessary personnel
- Use role-based access control
- Audit access logs regularly

### 6. Monitor for Leaks

- Use tools like `git-secrets` or `truffleHog`
- Scan commits before pushing
- Set up GitHub secret scanning

---

## Production Deployment

### Backend Deployment (Railway/Render)

1. **Set Environment Variables in Platform:**
   ```bash
   DATABASE_URL=postgresql://...
   SECRET_KEY=<generated-secure-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Database Migration:**
   ```bash
   # The app will auto-create tables on first run
   # Or run migrations manually if using Alembic
   ```

3. **Verify Configuration:**
   - Check logs for startup errors
   - Test API endpoints
   - Verify CORS settings

### Frontend Deployment (Vercel)

1. **Set Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

2. **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Verify Configuration:**
   - Check build logs
   - Test API connectivity
   - Verify authentication flow

---

## Environment Variable Checklist

### Before Development
- [ ] Copy `.env.example` to `.env` in backend
- [ ] Generate secure SECRET_KEY
- [ ] Copy `.env.example` to `.env.local` in frontend
- [ ] Verify all variables are set

### Before Production
- [ ] Generate new production SECRET_KEY
- [ ] Update DATABASE_URL to production database
- [ ] Update ALLOWED_ORIGINS to production domain
- [ ] Update NEXT_PUBLIC_API_URL to production API
- [ ] Verify all secrets are in secret manager
- [ ] Test configuration in staging environment
- [ ] Document all environment variables
- [ ] Set up monitoring and alerts

---

## Troubleshooting

### Backend Won't Start

**Error: "SECRET_KEY not set"**
```bash
# Solution: Set SECRET_KEY in .env file
echo "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')" >> backend/.env
```

**Error: "Database connection failed"**
```bash
# Solution: Check DATABASE_URL format
# SQLite: sqlite:///./fastdropship.db
# PostgreSQL: postgresql://user:pass@host:port/db
```

### Frontend Can't Connect to Backend

**Error: "Network Error" or "CORS Error"**
```bash
# Solution 1: Check NEXT_PUBLIC_API_URL
# Should match backend URL exactly

# Solution 2: Check backend ALLOWED_ORIGINS
# Should include frontend URL
```

### JWT Token Issues

**Error: "Invalid token" or "Token expired"**
```bash
# Solution 1: Check SECRET_KEY matches between environments
# Solution 2: Check ACCESS_TOKEN_EXPIRE_MINUTES
# Solution 3: Clear browser localStorage and re-login
```

---

## Quick Setup Script

Save this as `setup_env.sh`:

```bash
#!/bin/bash

echo "🔧 Setting up environment variables..."

# Backend
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    sed -i '' "s/your-secret-key-change-this-in-production/$SECRET_KEY/" .env
    echo "✅ Backend .env created with secure SECRET_KEY"
else
    echo "⚠️  Backend .env already exists"
fi

# Frontend
cd ../frontend
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Frontend .env.local created"
else
    echo "⚠️  Frontend .env.local already exists"
fi

cd ..
echo "✨ Environment setup complete!"
```

Make it executable:
```bash
chmod +x setup_env.sh
./setup_env.sh
```

---

## Additional Resources

- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)

---

## Support

If you encounter issues with environment configuration:
1. Check this guide thoroughly
2. Review application logs
3. Verify all variables are set correctly
4. Test in development before production
5. Consult the main README.md and SETUP.md files