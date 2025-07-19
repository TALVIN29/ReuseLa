# ReuseLa Security Check Script for Windows PowerShell
# This script searches for potential API keys in your codebase

Write-Host "ReuseLa Security Check" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

# Function to search for patterns in files
function Search-Pattern {
    param(
        [string]$Pattern,
        [string]$Description
    )
    
    Write-Host "Searching for ${Description}..." -ForegroundColor Yellow
    
    try {
        $results = Get-ChildItem -Recurse -File | 
                   Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next" } |
                   Select-String -Pattern $Pattern -AllMatches
        
        if ($results) {
            Write-Host "Found potential ${Description}:" -ForegroundColor Red
            $results | ForEach-Object {
                Write-Host "  File: $($_.Filename)" -ForegroundColor Red
                Write-Host "  Line: $($_.LineNumber)" -ForegroundColor Red
                $matchValue = $_.Matches.Value
                if ($matchValue.Length -gt 50) {
                    $matchValue = $matchValue.Substring(0, 50) + "..."
                }
                Write-Host "  Match: $matchValue" -ForegroundColor Gray
                Write-Host ""
            }
        } else {
            Write-Host "No ${Description} found" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error searching for ${Description}: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Check for various API key patterns
Search-Pattern "eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*" "JWT tokens"
Search-Pattern "sk_[A-Za-z0-9]{24}" "Stripe secret keys"
Search-Pattern "pk_[A-Za-z0-9]{24}" "Stripe publishable keys"
Search-Pattern "AIza[A-Za-z0-9_-]{35}" "Google API keys"
Search-Pattern "ghp_[A-Za-z0-9]{36}" "GitHub personal access tokens"
Search-Pattern "gho_[A-Za-z0-9]{36}" "GitHub OAuth tokens"
Search-Pattern "ghu_[A-Za-z0-9]{36}" "GitHub user-to-server tokens"
Search-Pattern "ghs_[A-Za-z0-9]{36}" "GitHub server-to-server tokens"
Search-Pattern "ghr_[A-Za-z0-9]{36}" "GitHub refresh tokens"

# Check for environment files that might contain secrets
Write-Host "Checking for environment files..." -ForegroundColor Yellow
$envFiles = @(".env", ".env.local", ".env.production", ".env.development")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Found $file - Make sure it's in .gitignore!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Security Check Complete!" -ForegroundColor Green
Write-Host "If any issues were found, please address them immediately." -ForegroundColor Yellow 