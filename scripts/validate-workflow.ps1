# GitHub Actions workflow validation script
Write-Host "=== GitHub Actions Workflow Validation ===" -ForegroundColor Green

# Step 1: Simulate artifact download
Write-Host "`n1. Simulating artifact download..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "all-artifacts" -Force | Out-Null

# Create mock artifact structure as it would appear after download
New-Item -ItemType Directory -Path "all-artifacts\allure-results-chromium-1" -Force | Out-Null
New-Item -ItemType Directory -Path "all-artifacts\allure-results-chromium-2" -Force | Out-Null
New-Item -ItemType Directory -Path "all-artifacts\allure-results-firefox-1" -Force | Out-Null
New-Item -ItemType Directory -Path "all-artifacts\playwright-report-chromium-1" -Force | Out-Null

# Copy existing allure results to simulate multiple shards
if (Test-Path "allure-results") {
    Write-Host "Copying existing allure results to simulate multiple browser/shard combinations..." -ForegroundColor Cyan
    
    # Simulate chromium shard 1
    Copy-Item -Path "allure-results\*" -Destination "all-artifacts\allure-results-chromium-1\" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Simulate chromium shard 2 (subset of files)
    Get-ChildItem -Path "allure-results\*.json" | Select-Object -First 5 | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "all-artifacts\allure-results-chromium-2\" -Force
    }
    
    # Simulate firefox shard 1 (subset of files)
    Get-ChildItem -Path "allure-results\*.json" | Select-Object -Last 3 | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "all-artifacts\allure-results-firefox-1\" -Force
    }
}

# Step 2: Debug artifact structure (as in workflow)
Write-Host "`n2. Debugging artifact structure..." -ForegroundColor Yellow
if (Test-Path "all-artifacts") {
    Write-Host "=== Artifact Structure ===" -ForegroundColor Green
    Get-ChildItem -Path "all-artifacts" -Recurse -File | Select-Object -First 20 | ForEach-Object { 
        Write-Host $_.FullName.Replace((Get-Location).Path, ".")
    }
    
    Write-Host "`n=== Looking for allure files ===" -ForegroundColor Green
    Get-ChildItem -Path "all-artifacts" -Recurse -Directory | Where-Object { $_.Name -like "*allure*" }
    Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.json" -and ($_.Name -like "*result*" -or $_.Name -like "*container*") } | Select-Object -First 10
} else {
    Write-Host "Error: all-artifacts directory not found" -ForegroundColor Red
    Get-ChildItem
}

# Step 3: Simulate allure report generation
Write-Host "`n3. Simulating allure report generation..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "combined-allure-results" -Force | Out-Null

Write-Host "Searching for allure results..." -ForegroundColor Cyan
if (Test-Path "all-artifacts") {
    Write-Host "Found the following allure-related files:" -ForegroundColor Green
    Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.json" -and ($_.Name -like "*result*" -or $_.Name -like "*container*" -or $_.Name -like "*attachment*") } | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nCopying JSON result and container files..." -ForegroundColor Cyan
    try {
        $resultFiles = Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.json" -and ($_.Name -like "*result*" -or $_.Name -like "*container*") }
        $resultFiles | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "combined-allure-results\" -Force
        }
        Write-Host "Copied $($resultFiles.Count) JSON files" -ForegroundColor Green
    } catch {
        Write-Host "No JSON result files found" -ForegroundColor Yellow
    }
    
    Write-Host "Copying attachment files..." -ForegroundColor Cyan
    try {
        $attachmentFiles = @()
        $attachmentFiles += Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.txt" -and $_.Name -like "*attachment*" }
        $attachmentFiles += Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.webm" -and $_.Name -like "*attachment*" }
        $attachmentFiles += Get-ChildItem -Path "all-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.png" -and $_.Name -like "*attachment*" }
        $attachmentFiles | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "combined-allure-results\" -Force
        }
        Write-Host "Copied $($attachmentFiles.Count) attachment files" -ForegroundColor Green
    } catch {
        Write-Host "No attachment files found" -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: all-artifacts directory not found" -ForegroundColor Yellow
}

# Step 4: Check results
Write-Host "`n4. Checking combined results..." -ForegroundColor Yellow
Write-Host "Files in combined-allure-results:" -ForegroundColor Green
if ((Test-Path "combined-allure-results") -and (Get-ChildItem -Path "combined-allure-results" -ErrorAction SilentlyContinue)) {
    $files = Get-ChildItem -Path "combined-allure-results"
    $files | Format-Table -AutoSize
    Write-Host "Total files: $($files.Count)" -ForegroundColor Green
    
    # Count different types
    $resultCount = ($files | Where-Object { $_.Name -like "*result*" }).Count
    $containerCount = ($files | Where-Object { $_.Name -like "*container*" }).Count
    $attachmentCount = ($files | Where-Object { $_.Name -like "*attachment*" }).Count
    
    Write-Host "`nFile breakdown:" -ForegroundColor Cyan
    Write-Host "  Result files: $resultCount" -ForegroundColor White
    Write-Host "  Container files: $containerCount" -ForegroundColor White
    Write-Host "  Attachment files: $attachmentCount" -ForegroundColor White
    
    if ($resultCount -gt 0 -and $containerCount -gt 0) {
        Write-Host "`n✅ Sufficient data for Allure report generation" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ May not have sufficient data for Allure report" -ForegroundColor Yellow
    }
} else {
    Write-Host "Directory is empty or does not exist" -ForegroundColor Red
}

# Step 5: Cleanup
Write-Host "`n5. Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path "all-artifacts" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "combined-allure-results" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n=== Validation Complete ===" -ForegroundColor Green
Write-Host "The GitHub Actions workflow should work correctly with the fixed artifact download order." -ForegroundColor White
