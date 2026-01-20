# cPanel Deployment Script for TaskFlow (PowerShell)
Write-Host "🚀 Starting cPanel deployment process..." -ForegroundColor Green

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build

# Create deployment package
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy") {
    Remove-Item "deploy" -Recurse -Force
}
New-Item -ItemType Directory -Path "deploy" -Force

# Copy files
Copy-Item "dist\*" -Destination "deploy\" -Recurse
Copy-Item "package.json" -Destination "deploy\"
Copy-Item "package-lock.json" -Destination "deploy\"
Copy-Item ".env.production" -Destination "deploy\.env"

# Create .htaccess for Node.js proxy (if needed)
@"
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/`$1 [P,L]
"@ | Out-File -FilePath "deploy\.htaccess" -Encoding UTF8

Write-Host "✅ Deployment package created in 'deploy/' folder" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload the 'deploy/' folder contents to your cPanel public_html or subdomain folder" -ForegroundColor White
Write-Host "2. Set up MySQL database in cPanel and update .env file" -ForegroundColor White
Write-Host "3. Configure Node.js application in cPanel" -ForegroundColor White
Write-Host "4. Set up domain/subdomain pointing to your application" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📁 Files to upload:" -ForegroundColor Cyan
Write-Host "- dist/index.cjs" -ForegroundColor White
Write-Host "- dist/public/*" -ForegroundColor White
Write-Host "- package.json" -ForegroundColor White
Write-Host "- package-lock.json" -ForegroundColor White
Write-Host "- .env (with your production settings)" -ForegroundColor White