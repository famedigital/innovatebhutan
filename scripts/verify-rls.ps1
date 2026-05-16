# Verify RLS Policies - Check if migration was successful
$DATABASE_URL = $env:DATABASE_URL
if (-not $DATABASE_URL) {
    # Load from .env file
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^DATABASE_URL=(.+)$") {
                $DATABASE_URL = $matches[1]
            }
        }
    }
}

Write-Host "=== Checking RLS Status ===" -ForegroundColor Cyan

Write-Host "`n1. Tables with RLS enabled:" -ForegroundColor Yellow
& psql "$DATABASE_URL" -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename;"

Write-Host "`n2. RLS Policies on profiles table:" -ForegroundColor Yellow
& psql "$DATABASE_URL" -c "SELECT policyname, permissive, roles FROM pg_policies WHERE tablename = 'profiles';"

Write-Host "`n3. RLS Policies on clients table:" -ForegroundColor Yellow
& psql "$DATABASE_URL" -c "SELECT policyname, permissive, roles FROM pg_policies WHERE tablename = 'clients';"

Write-Host "`n4. Verify columns added to clients:" -ForegroundColor Yellow
& psql "$DATABASE_URL" -c "\d clients" -T

Write-Host "`n5. Verify columns added to profiles:" -ForegroundColor Yellow
& psql "$DATABASE_URL" -c "\d profiles" -T
