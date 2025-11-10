# Database Setup Helper Script
# This script helps you set up your database connection

Write-Host "=== Church Song Filter - Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "Found .env file" -ForegroundColor Green
    $envContent = Get-Content .env
    $hasDbUrl = $envContent | Where-Object { $_ -match "DATABASE_URL" }
    
    if ($hasDbUrl) {
        Write-Host "DATABASE_URL found in .env" -ForegroundColor Green
        $currentUrl = ($hasDbUrl -split "=")[1]
        Write-Host "Current: $currentUrl" -ForegroundColor Yellow
    } else {
        Write-Host "DATABASE_URL not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host ".env file not found. Creating one..." -ForegroundColor Yellow
    @"
DATABASE_URL=postgresql://user:password@localhost:5432/song_filter?schema=public
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host ".env file created with default values" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Database Setup Options ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Supabase (Recommended - Free)" -ForegroundColor White
Write-Host "   - Go to https://supabase.com" -ForegroundColor Gray
Write-Host "   - Create a free account and project" -ForegroundColor Gray
Write-Host "   - Copy the connection string from Settings > Database" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Neon.tech (Free)" -ForegroundColor White
Write-Host "   - Go to https://neon.tech" -ForegroundColor Gray
Write-Host "   - Create a free account and project" -ForegroundColor Gray
Write-Host "   - Copy the connection string from the dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Local PostgreSQL" -ForegroundColor White
Write-Host "   - Install PostgreSQL locally" -ForegroundColor Gray
Write-Host "   - Create database: CREATE DATABASE song_filter;" -ForegroundColor Gray
Write-Host "   - Use: postgresql://username:password@localhost:5432/song_filter" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your database connection string (or press Enter to skip)"

if ($choice) {
    # Update .env file
    $envContent = Get-Content .env
    $newContent = $envContent | ForEach-Object {
        if ($_ -match "DATABASE_URL=") {
            "DATABASE_URL=$choice"
        } else {
            $_
        }
    }
    $newContent | Out-File -FilePath .env -Encoding utf8
    Write-Host ""
    Write-Host "✓ Updated .env file with your database URL" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "2. Run: npm run db:seed (optional)" -ForegroundColor White
    Write-Host "3. The dev server should already be running at http://localhost:3000" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Skipped. Please update .env manually with your DATABASE_URL" -ForegroundColor Yellow
}

Write-Host ""

