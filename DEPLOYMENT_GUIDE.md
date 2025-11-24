# 🚀 Fast-Dropship Deployment Guide

## Complete Free Hosting Setup with Railway + Vercel

This guide will walk you through deploying your Fast-Dropship application completely free using Railway (backend) and Vercel (frontend).

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Your code pushed to GitHub: https://github.com/mdSHash/fast-dropship
- ✅ Email address for Railway and Vercel accounts

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Click **"Login"** or **"Start a New Project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If first time, click **"Configure GitHub App"**
4. Select your repository: `mdSHash/fast-dropship`
5. Click **"Deploy Now"**

### Step 3: Configure Backend Service

1. Railway will detect your Python app automatically
2. Click on the deployed service
3. Go to **"Settings"** tab
4. Set **Root Directory**: `backend`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 4: Add PostgreSQL Database

1. In your project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL database automatically
3. The database will be linked to your service automatically
4. Railway provides the `DATABASE_URL` environment variable automatically

### Step 5: Configure Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add these:

```bash
# Railway provides DATABASE_URL automatically, but you can override if needed
# DATABASE_URL will be something like: postgresql://postgres:password@host:5432/railway

# Generate a secure SECRET_KEY (use the command below)
SECRET_KEY=your-generated-secret-key-here

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

# Leave ALLOWED_ORIGINS empty for now, we'll add it after deploying frontend
ALLOWED_ORIGINS=
```

**To generate SECRET_KEY**, run this in your terminal:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it as your SECRET_KEY value.

### Step 6: Deploy Backend

1. Click **"Deploy"** or wait for automatic deployment
2. Monitor the **"Deployments"** tab for build logs
3. Once deployed, click **"Settings"** → **"Networking"**
4. Click **"Generate Domain"** to get a public URL
5. **Copy this URL** - you'll need it for the frontend (e.g., `https://your-app.up.railway.app`)

### Step 7: Initialize Database

The database tables will be created automatically when the app starts. If you want to add seed data:

1. Go to your Railway project
2. Click on the PostgreSQL database
3. Go to **"Data"** tab
4. Or use Railway CLI to run seed script (optional)

---

## ▲ Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your repository: `mdSHash/fast-dropship`
3. Click **"Import"**

### Step 3: Configure Build Settings

Vercel will auto-detect Next.js, but verify these settings:

1. **Framework Preset**: Next.js
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### Step 4: Add Environment Variables

Before deploying, add environment variables:

1. Expand **"Environment Variables"** section
2. Add this variable:

```bash
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-url.up.railway.app
```

**Important**: Replace `your-backend-url.up.railway.app` with your actual Railway backend URL from Step 6 above.

### Step 5: Deploy Frontend

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://fast-dropship.vercel.app`
4. Click **"Visit"** to see your live app!

---

## 🔗 Part 3: Connect Backend and Frontend

### Update Backend CORS Settings

Now that you have your frontend URL, update the backend:

1. Go back to **Railway**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Find `ALLOWED_ORIGINS` variable
5. Update it with your Vercel URL:

```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

**Note**: The `*` wildcard allows preview deployments to work.

6. Click **"Save"**
7. Railway will automatically redeploy with new settings

---

## ✅ Part 4: Test Your Deployment

### 1. Test Backend API

Visit your Railway backend URL + `/docs`:
```
https://your-backend-url.up.railway.app/docs
```

You should see the FastAPI Swagger documentation.

### 2. Test Frontend

Visit your Vercel frontend URL:
```
https://your-app.vercel.app
```

You should see the login page.

### 3. Test Login

Try logging in with default credentials:
- **Username**: `admin`
- **Password**: `admin123`

If login works, you're all set! 🎉

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Build fails on Railway
- **Solution**: Check build logs in Railway dashboard
- Verify `requirements.txt` is in the `backend` folder
- Ensure Python version is compatible (3.11+)

**Problem**: Database connection error
- **Solution**: Railway automatically provides `DATABASE_URL`
- Check that PostgreSQL database is created and linked
- Verify environment variables are set correctly

**Problem**: 502 Bad Gateway
- **Solution**: Check that start command is correct
- Verify the app is listening on `0.0.0.0` and `$PORT`
- Check deployment logs for errors

### Frontend Issues

**Problem**: Build fails on Vercel
- **Solution**: Check build logs in Vercel dashboard
- Verify `package.json` is in the `frontend` folder
- Ensure all dependencies are listed

**Problem**: API connection error (CORS)
- **Solution**: Update `ALLOWED_ORIGINS` in Railway backend
- Include your Vercel URL with wildcard: `https://your-app-*.vercel.app`
- Redeploy backend after updating

**Problem**: Environment variable not working
- **Solution**: Ensure variable name starts with `NEXT_PUBLIC_`
- Redeploy frontend after adding/changing variables
- Clear browser cache

### Login Issues

**Problem**: Cannot login with default credentials
- **Solution**: Database might be empty
- Use Railway CLI or database console to run seed script
- Or create a new user via API `/docs` endpoint

---

## 🎯 Post-Deployment Steps

### 1. Change Default Passwords

**Important**: Change default admin password immediately!

1. Login as admin
2. Go to "Change Password" page
3. Update to a secure password

### 2. Create Additional Users

1. Login as admin
2. Go to "Users" page
3. Create user accounts for your team

### 3. Set Up Custom Domain (Optional)

#### For Backend (Railway):
1. Go to Railway project → Backend service
2. Click "Settings" → "Networking"
3. Add custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

#### For Frontend (Vercel):
1. Go to Vercel project → "Settings" → "Domains"
2. Add custom domain (e.g., `yourdomain.com`)
3. Update DNS records as instructed
4. Update backend `ALLOWED_ORIGINS` with new domain

### 4. Monitor Usage

#### Railway:
- Check "Metrics" tab for usage
- Monitor $5 monthly credit
- Upgrade if needed

#### Vercel:
- Check "Analytics" for traffic
- Monitor bandwidth usage
- Free tier is usually sufficient

---

## 💰 Cost Breakdown

### Current Setup (Free Tier)

| Service | Cost | Limits |
|---------|------|--------|
| **Railway** | $5 credit/month | ~500 hours, 512MB RAM, 1GB storage |
| **Vercel** | $0 | Unlimited deployments, 100GB bandwidth |
| **Total** | **$0/month** | Sufficient for small-medium apps |

### When to Upgrade

**Railway** ($5-20/month):
- When you exceed $5 credit
- Need more RAM or storage
- Higher traffic

**Vercel** ($20/month Pro):
- Need more bandwidth (>100GB)
- Want advanced analytics
- Need team collaboration

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Automatic Deployments

1. **Push to GitHub**: Any push to `main` branch triggers deployment
2. **Railway**: Automatically rebuilds and deploys backend
3. **Vercel**: Automatically rebuilds and deploys frontend

### Preview Deployments (Vercel)

- Every pull request gets a preview URL
- Test changes before merging
- Automatic cleanup after merge

---

## 📊 Monitoring & Logs

### Railway Logs

1. Go to your backend service
2. Click "Deployments" tab
3. Click on a deployment to see logs
4. Use "View Logs" for real-time monitoring

### Vercel Logs

1. Go to your project
2. Click "Deployments" tab
3. Click on a deployment
4. View build logs and runtime logs

---

## 🆘 Getting Help

### Railway Support
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Help Center](https://help.railway.app)

### Vercel Support
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [Vercel Support](https://vercel.com/support)

### Fast-Dropship Issues
- [GitHub Issues](https://github.com/mdSHash/fast-dropship/issues)
- Check README.md for troubleshooting

---

## ✨ Success Checklist

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Backend URL obtained
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable set
- [ ] CORS configured in backend
- [ ] Can access backend API docs
- [ ] Can access frontend login page
- [ ] Can login successfully
- [ ] Default password changed
- [ ] Custom domain configured (optional)

---

## 🎉 Congratulations!

Your Fast-Dropship application is now live and accessible worldwide!

**Your URLs:**
- 🔗 Frontend: `https://your-app.vercel.app`
- 🔗 Backend API: `https://your-backend.up.railway.app`
- 🔗 API Docs: `https://your-backend.up.railway.app/docs`

Share your app with your team and start managing your dropshipping business! 🚀

---

**Made with 💜 by the Fast-Dropship Team**