import { defineConfig, devices } from '@playwright/test';
import { TestOptions } from './src/types/test-options';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      suiteTitle: true,
      categories: [
        {
          name: 'Broken tests',
          matchedStatuses: ['broken']
        },
        {
          name: 'Failed tests',
          matchedStatuses: ['failed']
        }
      ]
    }],
    ['./src/reporters/custom-reporter.ts']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://www.google.com',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Global test timeout
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000,
    
    // Accept downloads
    acceptDownloads: true,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Custom test options
    environment: process.env.TEST_ENV || 'staging',
    apiBaseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    
    // User agent
    userAgent: 'Playwright Test Automation Framework'
  },
  
  // Test output directory
  outputDir: 'test-results',
  
  // Expect configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10 * 1000,
    
    // Threshold for screenshot comparison
    threshold: 0.2,
    
    // Mode for screenshot comparison
    mode: 'default'
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
      teardown: 'cleanup'
    },
    {
      name: 'cleanup',
      testMatch: '**/global.teardown.ts'
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox']
      },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari']
      },
      dependencies: ['setup']
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
      dependencies: ['setup']
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      },
      dependencies: ['setup']
    },
    
    // Tablet browsers
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro']
      },
      dependencies: ['setup']
    },
    
    // API testing
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com'
      }
    },
    
    // Visual regression testing
    {
      name: 'visual-chromium',
      testMatch: '**/visual/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      dependencies: ['setup']
    }
  ],
  
  // Development server configuration
  webServer: process.env.START_SERVER ? {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  } : undefined
});
