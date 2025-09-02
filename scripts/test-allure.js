#!/usr/bin/env node

/**
 * Test script to verify Allure report generation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing Allure Report Generation...\n');

// Check if allure-results exists
const allureResultsPath = path.join(__dirname, '..', 'allure-results');
if (!fs.existsSync(allureResultsPath)) {
  console.error('❌ allure-results directory not found!');
  process.exit(1);
}

// Count result files
const resultFiles = fs.readdirSync(allureResultsPath).filter(file => 
  file.endsWith('-result.json') || file.endsWith('-container.json')
);

console.log(`📁 Found ${resultFiles.length} Allure result files`);

if (resultFiles.length === 0) {
  console.error('❌ No Allure result files found! Run tests first.');
  process.exit(1);
}

// Generate report
try {
  console.log('🔨 Generating Allure report...');
  execSync('npm run allure:generate', { stdio: 'inherit' });
  console.log('✅ Allure report generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Allure report:', error.message);
  process.exit(1);
}

// Check if report was created
const reportPath = path.join(__dirname, '..', 'allure-report', 'index.html');
if (!fs.existsSync(reportPath)) {
  console.error('❌ Allure report index.html not found!');
  process.exit(1);
}

console.log('✅ Allure report is ready!');
console.log(`📄 Report location: ${reportPath}`);
console.log('\n🚀 To view the report, run: npm run test:allure');
