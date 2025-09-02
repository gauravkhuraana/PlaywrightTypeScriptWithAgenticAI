#!/bin/bash

# Local test script to simulate artifact merging
echo "=== Local Artifact Structure Test ==="

# Create a mock artifacts directory structure
mkdir -p test-artifacts/allure-results-chromium-1
mkdir -p test-artifacts/allure-results-firefox-1
mkdir -p test-artifacts/playwright-report-chromium-1

# Copy some real allure results if they exist
if [ -d "allure-results" ]; then
    echo "Copying existing allure results..."
    cp -r allure-results/* test-artifacts/allure-results-chromium-1/ 2>/dev/null || echo "No allure results to copy"
fi

# Create some mock results
echo '{"uuid":"test-result-1","name":"Sample Test","status":"passed"}' > test-artifacts/allure-results-chromium-1/test-result.json
echo '{"uuid":"test-container-1","name":"Test Suite"}' > test-artifacts/allure-results-chromium-1/test-container.json

echo "=== Test Artifact Structure ==="
find test-artifacts -type f | head -20

echo "=== Looking for allure files ==="
find test-artifacts -name "*allure*" -type d
find test-artifacts -name "*.json" | grep -E "(result|container)" | head -10

echo "=== Merging Allure Results ==="
mkdir -p combined-allure-results

# Simulate the merging process
find test-artifacts -type f -name "*.json" | grep -E "(result|container)" | xargs -I {} cp {} combined-allure-results/ 2>/dev/null || echo "No JSON result files found"

echo "Files in combined-allure-results:"
ls -la combined-allure-results/ || echo "Directory is empty"

# Cleanup
echo "=== Cleaning up test artifacts ==="
rm -rf test-artifacts combined-allure-results

echo "=== Test Complete ==="
