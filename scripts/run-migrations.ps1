# Quick Migration Runner - Direct SQL Execution
# Uses psql to run migrations without prompts

$ErrorActionPreference = "Continue"

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

if (-not $DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not found!" -ForegroundColor Red
    exit 1
}

$MIGRATIONS = @(
    "drizzle/0010_clients_schema_fix.sql",
    "drizzle/0011_profiles_schema_fix.sql",
    "drizzle/0012_add_rls_policies.sql"
)

foreach ($migration in $MIGRATIONS) {
    if (Test-Path $migration) {
        Write-Host "Running: $migration"
        Get-Content $migration -Raw | & psql "$DATABASE_URL"
        Write-Host ""
    }
}
