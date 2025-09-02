# Local test script to simulate artifact merging (PowerShell version)
Write-Host "=== Local Artifact Structure Test ===" -ForegroundColor Green

# Create a mock artifacts directory structure
New-Item -ItemType Directory -Path "test-artifacts\allure-results-chromium-1" -Force | Out-Null
New-Item -ItemType Directory -Path "test-artifacts\allure-results-firefox-1" -Force | Out-Null
New-Item -ItemType Directory -Path "test-artifacts\playwright-report-chromium-1" -Force | Out-Null

# Copy some real allure results if they exist
if (Test-Path "allure-results") {
    Write-Host "Copying existing allure results..." -ForegroundColor Yellow
    try {
        Copy-Item -Path "allure-results\*" -Destination "test-artifacts\allure-results-chromium-1\" -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "No allure results to copy" -ForegroundColor Yellow
    }
}

# Create some mock results
'{"uuid":"test-result-1","name":"Sample Test","status":"passed"}' | Out-File -FilePath "test-artifacts\allure-results-chromium-1\test-result.json" -Encoding UTF8
'{"uuid":"test-container-1","name":"Test Suite"}' | Out-File -FilePath "test-artifacts\allure-results-chromium-1\test-container.json" -Encoding UTF8

Write-Host "=== Test Artifact Structure ===" -ForegroundColor Green
Get-ChildItem -Path "test-artifacts" -Recurse -File | Select-Object -First 20 | ForEach-Object { $_.FullName }

Write-Host "=== Looking for allure files ===" -ForegroundColor Green
Get-ChildItem -Path "test-artifacts" -Recurse -Directory | Where-Object { $_.Name -like "*allure*" }
Get-ChildItem -Path "test-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.json" -and ($_.Name -like "*result*" -or $_.Name -like "*container*") } | Select-Object -First 10

Write-Host "=== Merging Allure Results ===" -ForegroundColor Green
New-Item -ItemType Directory -Path "combined-allure-results" -Force | Out-Null

# Simulate the merging process
try {
    Get-ChildItem -Path "test-artifacts" -Recurse -File | Where-Object { $_.Name -like "*.json" -and ($_.Name -like "*result*" -or $_.Name -like "*container*") } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "combined-allure-results\" -Force
    }
} catch {
    Write-Host "No JSON result files found" -ForegroundColor Yellow
}

Write-Host "Files in combined-allure-results:" -ForegroundColor Green
if (Test-Path "combined-allure-results") {
    Get-ChildItem -Path "combined-allure-results" | Format-Table -AutoSize
} else {
    Write-Host "Directory is empty" -ForegroundColor Yellow
}

# Cleanup
Write-Host "=== Cleaning up test artifacts ===" -ForegroundColor Green
Remove-Item -Path "test-artifacts" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "combined-allure-results" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "=== Test Complete ===" -ForegroundColor Green
