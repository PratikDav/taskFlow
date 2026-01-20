#!/bin/bash
# cPanel Deployment Script for TaskFlow

echo "🚀 Starting cPanel deployment process..."

# Build the application
echo "📦 Building application..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deploy
cp -r dist/* deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp .env.production deploy/.env

# Create .htaccess for Node.js proxy (if needed)
cat > deploy/.htaccess << 'EOF'
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
EOF

echo "✅ Deployment package created in 'deploy/' folder"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'deploy/' folder contents to your cPanel public_html or subdomain folder"
echo "2. Set up MySQL database in cPanel and update .env file"
echo "3. Configure Node.js application in cPanel"
echo "4. Set up domain/subdomain pointing to your application"
echo ""
echo "📁 Files to upload:"
echo "- dist/index.cjs"
echo "- dist/public/*"
echo "- package.json"
echo "- package-lock.json"
echo "- .env (with your production settings)"