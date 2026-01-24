# 🚂 TaskFlow Backend Deployment to Railway

## Why Railway?

Railway is perfect for your situation because:
- ✅ **Free tier** available (512MB RAM, 1GB disk)
- ✅ **MySQL support** - can connect to your existing cPanel database
- ✅ **Git-based deployments** - automatic deployments on push
- ✅ **Built-in SSL** and global CDN
- ✅ **Excellent developer experience**

## 📋 Prerequisites

1. **Railway Account**: [railway.app](https://railway.app)
2. **Git Repository**: Your code should be in Git
3. **cPanel Database**: Your MySQL database (already set up)

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Railway Project

1. **Sign up/Login** to Railway
2. **Create New Project**:
   - Click "New Project"
   - Choose "Deploy from GitHub" or "Empty Project"
   - If using GitHub: Connect your repository
   - If manual: We'll use Railway CLI

### Step 2: Install Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to your account
railway login
```

### Step 3: Initialize Railway Project

```bash
# Navigate to your project directory
cd /path/to/your/taskflow

# Initialize Railway project
railway init

# Link to your Railway project
railway link

# If you have multiple projects, select the correct one
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables for your cPanel database
railway variables set DB_HOST=your-cpanel-mysql-host
railway variables set DB_USER=your-cpanel-db-username
railway variables set DB_PASSWORD=your-cpanel-db-password
railway variables set DB_NAME=your-database-name
railway variables set DB_PORT=3306
railway variables set SESSION_SECRET=your-secure-random-secret-here
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

### Step 5: Deploy to Railway

```bash
# Push your code to trigger deployment
git add .
git commit -m "Deploy backend to Railway"
git push origin main
```

Railway will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Build your application
- ✅ Start the server
- ✅ Provide you with a domain (e.g., `your-app.up.railway.app`)

### Step 6: Update Vercel Frontend

1. **Go to your Vercel project dashboard**
2. **Update environment variable**:
   - `VITE_API_URL=https://your-app.up.railway.app`

3. **Redeploy** your frontend to apply the changes

### Step 7: Test Your Deployment

1. **Backend**: Visit `https://your-app.up.railway.app/api/me`
2. **Frontend**: Visit your Vercel domain
3. **Full Test**: Try logging in and using features

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check Railway logs
railway logs

# Test database connection locally first
node -e "
require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    await conn.execute('SELECT 1');
    console.log('✅ Database connected');
    await conn.end();
  } catch (err) {
    console.log('❌ Database error:', err.message);
  }
}
test();
"
```

### Common Issues:

1. **CORS Errors**: Railway handles CORS automatically
2. **Port Issues**: Railway uses port 3000 by default
3. **Memory Limits**: Free tier has 512MB limit - optimize if needed

## 📊 Railway Free Tier Limits

- **RAM**: 512MB
- **Disk**: 1GB
- **Outbound Bandwidth**: 1GB/month
- **Concurrent Requests**: Limited

For production apps, upgrade to paid plans when needed.

## 🔄 Migration Complete!

Your TaskFlow will now have:
- **Frontend**: Vercel (fast, global CDN)
- **Backend**: Railway (Node.js, scalable)
- **Database**: cPanel MySQL (your existing data)

## 🎯 Next Steps

1. **Deploy backend** using the steps above
2. **Update Vercel** with new API URL
3. **Test thoroughly**
4. **Monitor usage** in Railway dashboard

Your app is ready for production! 🚀

Need help with any specific step?