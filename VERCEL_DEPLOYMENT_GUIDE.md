# TaskFlow Deployment Guide

## 🚀 Deploying to Vercel + Railway (Recommended)

**Note**: If your cPanel doesn't support Node.js (which is common), use Railway instead of cPanel for the backend. Railway offers a generous free tier and excellent Node.js support.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Railway Account**: Sign up at [railway.app](https://railway.app) - **Free tier available!**
3. **cPanel/MySQL**: Your database (already set up)
4. **Git Repository**: Your code in Git

### Step 1: Deploy Backend to Railway

#### Quick Railway Setup:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**:
   ```bash
   cd your-project-directory
   railway init
   railway link
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set DB_HOST=your-cpanel-mysql-host
   railway variables set DB_USER=your-cpanel-db-username
   railway variables set DB_PASSWORD=your-cpanel-db-password
   railway variables set DB_NAME=your-database-name
   railway variables set SESSION_SECRET=your-secure-random-secret
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

Railway will give you a URL like: `https://your-app.up.railway.app`

### Step 2: Deploy Frontend to Vercel

#### Using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel
vercel login

# Deploy frontend
cd client
vercel --prod

# Set API URL
vercel env add VITE_API_URL
# Enter: https://your-app.up.railway.app
```

### Step 3: Test Your Deployment

1. **Backend**: `https://your-app.up.railway.app/api/me`
2. **Frontend**: Your Vercel domain
3. **Full App**: Test login and features

## 📖 Detailed Guides

- **Railway Deployment**: See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Alternative Options**: See `BACKEND_DEPLOYMENT_ALTERNATIVES.md`

## 🎉 Your App is Live!

With Railway + Vercel, you get:
- ✅ **Free hosting** (Railway free tier + Vercel free tier)
- ✅ **Global CDN** and SSL
- ✅ **Automatic deployments**
- ✅ **Your existing cPanel database**

Visit your Vercel domain to see your TaskFlow app in action! 🚀

### Step 2: Deploy Backend to cPanel

#### 2.1 Upload Files to cPanel

1. **Connect via FTP/SFTP** or use cPanel's File Manager
2. **Upload the entire project** to your public_html directory or a subdomain directory
3. **Navigate to the project directory** in cPanel's terminal

#### 2.2 Configure Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=your-cpanel-mysql-host (e.g., localhost or your-server-ip)
DB_USER=your-cpanel-db-username
DB_PASSWORD=your-cpanel-db-password
DB_NAME=your-database-name
DB_PORT=3306

# Session Configuration
SESSION_SECRET=your-secure-random-secret-here-make-it-long-and-random

# Application Settings
NODE_ENV=production
PORT=5000

# Optional: Email configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

#### 2.3 Run the Automated Deployment Script

**For Linux/cPanel:**
```bash
./deploy-backend.sh
```

**For Windows (if using local testing):**
```batch
deploy-backend.bat
```

This script will:
- ✅ Check Node.js and npm installation
- 📦 Install dependencies
- 🗄️ Test database connection
- 📁 Create uploads directory

#### 2.4 Start the Server

**Option A: Using PM2 (Recommended)**
```bash
# Install PM2 if not already installed
npm install -g pm2

# Start the application
pm2 start "npm start" --name taskflow

# Save PM2 configuration
pm2 save
pm2 startup
```

**Option B: Direct Node.js**
```bash
npm start
```

#### 2.5 Configure Domain

1. **Point your domain** to your cPanel hosting
2. **Set up SSL certificate** (Let's Encrypt is usually available in cPanel)
3. **Test your backend**: Visit `https://your-domain.com/api/me` (should return authentication status)

### Step 3: Deploy Frontend to Vercel

#### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy from client directory**:
   ```bash
   cd client
   vercel --prod
   ```

3. **Set environment variable**:
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-cpanel-domain.com
   ```

#### Method 2: Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your Git repository

2. **Configure Build Settings**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-cpanel-domain.com`
   - **Environment**: Production

4. **Deploy**: Click "Deploy"

### Step 4: Final Configuration

#### 4.1 Update CORS Settings (if needed)

In your cPanel backend, ensure CORS allows your Vercel domain:

```javascript
// In server/index.ts, you might need to add:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-vercel-domain.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

#### 4.2 Test the Complete Application

1. **Frontend**: Visit your Vercel domain
2. **Authentication**: Try logging in
3. **API Calls**: Check browser network tab for API requests
4. **Database**: Verify data is being saved/retrieved

### Troubleshooting

#### Backend Issues:

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs taskflow

# Restart application
pm2 restart taskflow
```

#### Database Connection Issues:

1. **Check credentials** in `.env` file
2. **Verify database host** - sometimes it's `localhost`, other times it's an IP
3. **Test connection** using the deployment script

#### Frontend Issues:

1. **Check Vercel build logs** in dashboard
2. **Verify VITE_API_URL** environment variable
3. **Check browser console** for CORS or network errors

#### Common Errors:

- **CORS errors**: Add your Vercel domain to allowed origins
- **Database connection refused**: Check firewall settings, database credentials
- **Build failures**: Ensure all dependencies are listed in `client/package.json`

### File Structure:

```
your-cpanel-directory/
├── client/           # Frontend source (deployed to Vercel)
├── server/          # Backend source (runs on cPanel)
├── shared/          # Shared code
├── uploads/         # File uploads directory
├── .env            # Environment variables
├── package.json    # Backend dependencies
├── deploy-backend.sh    # Linux deployment script
├── deploy-backend.bat   # Windows deployment script
└── VERCEL_DEPLOYMENT_GUIDE.md
```

### Security Checklist:

- ✅ **Strong SESSION_SECRET** (at least 32 characters)
- ✅ **HTTPS enabled** on both domains
- ✅ **Database credentials** not in version control
- ✅ **Firewall configured** to restrict access
- ✅ **Regular backups** of database
- ✅ **PM2 configured** for auto-restart

### Performance Optimization:

1. **Enable compression** in your cPanel server
2. **Set up CDN** for static assets if needed
3. **Monitor PM2** for memory usage
4. **Configure database connection pooling**

---

## 🎉 Deployment Complete!

Your TaskFlow application should now be live with:
- **Frontend**: Fast, globally distributed via Vercel
- **Backend**: Securely hosted on your cPanel server
- **Database**: Your existing MySQL database

Visit your Vercel domain to see your application in action!