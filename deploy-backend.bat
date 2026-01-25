@echo off
echo 🚀 TaskFlow Backend Deployment Script
echo =====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Please create one with your database credentials.
    echo    Copy .env.example to .env and fill in your values.
    pause
    exit /b 1
)

echo ✅ Environment file found

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    mkdir uploads
    echo 📁 Created uploads directory
)

REM Test database connection
echo 🗄️  Testing database connection...
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQL_HOST,
      user: process.env.DB_USER || process.env.MYSQL_USER,
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
      port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306
    });
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

if %errorlevel% neq 0 (
    echo ❌ Database connection test failed. Please check your .env file.
    pause
    exit /b 1
)

echo 🎉 Backend deployment preparation complete!
echo.
echo Next steps:
echo 1. Make sure your domain is configured to point to this directory
echo 2. Start the server with: npm start
echo 3. Or use PM2: pm2 start "npm start" --name taskflow
echo.
echo Your backend should be running and ready to receive requests from your Vercel frontend!

pause