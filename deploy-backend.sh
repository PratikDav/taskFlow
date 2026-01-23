#!/bin/bash

echo "🚀 TaskFlow Backend Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one with your database credentials."
    echo "   Copy .env.example to .env and fill in your values."
    exit 1
fi

echo "✅ Environment file found"

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo "📁 Created uploads directory"
fi

# Test database connection
echo "🗄️  Testing database connection..."
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

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed. Please check your .env file."
    exit 1
fi

echo "🎉 Backend deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your domain is configured to point to this directory"
echo "2. Start the server with: npm start"
echo "3. Or use PM2: pm2 start \"npm start\" --name taskflow"
echo ""
echo "Your backend should be running and ready to receive requests from your Vercel frontend!"