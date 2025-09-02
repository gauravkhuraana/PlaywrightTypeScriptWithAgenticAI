import { test as base } from '@playwright/test';
import { TestOptions } from '../types/test-options';
import { TestDataManager } from '../utils/test-data-manager';
import { ApiClient } from '../utils/api-client';
import { Logger } from '../utils/logger';
import { ScreenshotHelper } from '../utils/screenshot-helper';
import { VideoHelper } from '../utils/video-helper';
import { PerformanceHelper } from '../utils/performance-helper';
import { AccessibilityHelper } from '../utils/accessibility-helper';

// Extend the base test with custom fixtures
export const test = base.extend<TestOptions & {
  // Utility fixtures
  testDataManager: TestDataManager;
  apiClient: ApiClient;
  logger: Logger;
  screenshotHelper: ScreenshotHelper;
  videoHelper: VideoHelper;
  performanceHelper: PerformanceHelper;
  accessibilityHelper: AccessibilityHelper;
  
  // Custom page fixtures
  googlePage: any; // Will be defined in page objects
}>({
  // Test data manager fixture
  testDataManager: async ({ environment }, use) => {
    const testDataManager = new TestDataManager(environment);
    await testDataManager.initialize();
    await use(testDataManager);
    await testDataManager.cleanup();
  },

  // API client fixture
  apiClient: async ({ apiBaseURL, apiConfig }, use) => {
    const apiClient = new ApiClient(apiBaseURL, apiConfig);
    await use(apiClient);
    await apiClient.cleanup();
  },

  // Logger fixture
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(logger);
  },

  // Screenshot helper fixture
  screenshotHelper: async ({ page }, use, testInfo) => {
    const screenshotHelper = new ScreenshotHelper(page, testInfo);
    await use(screenshotHelper);
  },

  // Video helper fixture
  videoHelper: async ({ page, browserConfig }, use, testInfo) => {
    const videoHelper = new VideoHelper(page, testInfo, browserConfig?.recordVideo);
    await use(videoHelper);
    await videoHelper.cleanup();
  },

  // Performance helper fixture
  performanceHelper: async ({ page, enablePerformanceTesting }, use) => {
    if (!enablePerformanceTesting) {
      await use(undefined as any);
      return;
    }
    
    const performanceHelper = new PerformanceHelper(page);
    await use(performanceHelper);
  },

  // Accessibility helper fixture
  accessibilityHelper: async ({ page, enableAccessibilityTesting }, use) => {
    if (!enableAccessibilityTesting) {
      await use(undefined as any);
      return;
    }
    
    const accessibilityHelper = new AccessibilityHelper(page);
    await use(accessibilityHelper);
  },

  // Enhanced browser context fixture
  context: async ({ browser, browserConfig }, use) => {
    const contextOptions: any = {
      // Add viewport size based on device
      viewport: { width: 1920, height: 1080 }
    };

    // Add recording options if enabled
    if (browserConfig?.recordVideo) {
      contextOptions.recordVideo = { dir: 'test-results/videos' };
    }
    
    if (browserConfig?.recordHar) {
      contextOptions.recordHar = { path: 'test-results/har/network.har' };
    }

    const context = await browser.newContext(contextOptions);
    
    // Add event listeners for network monitoring
    context.on('page', page => {
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`Console error: ${msg.text()}`);
        }
      });
      
      page.on('pageerror', error => {
        console.log(`Page error: ${error.message}`);
      });
    });

    await use(context);
    await context.close();
  },

  // Enhanced page fixture
  page: async ({ context, browserConfig }, use) => {
    const page = await context.newPage();
    
    // Add slow motion if specified
    if (browserConfig?.slowMo) {
      await page.waitForTimeout(browserConfig.slowMo);
    }
    
    // Set default timeout
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(60000);
    
    await use(page);
    await page.close();
  }
});

export { expect } from '@playwright/test';
